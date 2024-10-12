import { PurchaseOrderModel, PurchaseOrderSchema } from '@/models/purchase-order.model';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { NextResponse } from 'next/server';

// BrowsePurchaseOrders
export async function GET(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized', result: null, recordsTotal: 0 }, { status: 401 });
  }

  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);

  const pageIndex = Number(queryParams.get('pageIndex')) ?? 0;
  const pageSize = Number(queryParams.get('pageSize')) ?? 10;
  const sortOrder = queryParams.get('sortOrder') ?? 'desc';
  const sortColumn = queryParams.get('sortColumn') ?? 'createdAt';

  // filters
  const code = queryParams.get('code') ?? '';
  const supplierId = queryParams.get('supplierId') ?? 0;
  const purchaseDate = Number(queryParams.get('purchaseDate')) ?? '';
  const status = queryParams.get('status') ?? '';

  const where: any = {};
  if (code) {
    where['AND'] = [
      {
        code: {
          contains: code,
          mode: 'insensitive',
        },
      },
    ];
  }

  if (supplierId) {
    where['AND'] = [...(where['AND'] || []), { supplierId }];
  }

  if (status) {
    where['AND'] = [...(where['AND'] || []), { status }];
  }
  // ----------------

  try {
    const purchaseOrders = await db.purchaseOrders.findMany({
      skip: pageIndex * pageSize,
      take: pageSize,
      orderBy: {
        [sortColumn]: sortOrder,
      },
      where,
      include: {
        Supplier: {
          select: { name: true },
        },
      },
    });
    const recordsTotal = await db.purchaseOrders.count({ where });

    const mappedPurchaseOrders = purchaseOrders.map((po) => ({
      ...po,
      supplierName: po.Supplier.name,
      Supplier: undefined,
    }));

    return NextResponse.json({ message: 'Success', result: mappedPurchaseOrders, recordsTotal }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { message: 'Internal Server Error: ' + e, result: null, recordsTotal: 0 },
      { status: 500 }
    );
  }
}

// CreatePurchaseOrder
export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const validationRes = PurchaseOrderSchema.safeParse(await request.json());

  // if validation failed
  if (!validationRes.success) {
    return NextResponse.json(
      {
        message: 'Terdapat kesalahan pada data yang dikirim',
        error: validationRes.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const data = validationRes.data;

  try {
    const userId = session.id;

    // retreive last po code
    const lastPo = await db.purchaseOrders.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { code: true },
    });

    let newCode = 'PO00000001'; // default code

    if (lastPo) {
      const lastCodeNumber = parseInt(lastPo.code.replace('PO', ''), 10);
      newCode = 'PO' + (lastCodeNumber + 1).toString().padStart(8, '0');
    }

    const purchaseDate = new Date().toISOString();
    const grandTotal = data.details.reduce((acc, d) => {
      return acc + d.purchasePrice * d.quantity;
    }, 0);

    await db.$transaction(async (prisma) => {
      const po = await prisma.purchaseOrders.create({
        data: {
          code: newCode,
          purchaseDate: purchaseDate,
          Supplier: {
            connect: { id: data.supplierId },
          },
          remarks: data.remarks,
          totalItem: data.details.length,
          grandTotal: grandTotal,
          status: 'Dalam Proses',
          CreatedBy: {
            connect: { id: userId },
          },
        },
      });

      await prisma.purchaseOrderDetails.createMany({
        data: data.details.map((d) => ({
          poId: po.id,
          productId: d.productId,
          purchasePrice: d.purchasePrice,
          quantity: d.quantity,
          totalPrice: d.purchasePrice * d.quantity,
          createdBy: userId,
        })),
      });
    });

    return NextResponse.json({ message: 'Data Transaksi Pembelian Berhasil Disimpan' }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
