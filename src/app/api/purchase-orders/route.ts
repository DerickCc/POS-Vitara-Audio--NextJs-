import { PurchaseOrderModel } from '@/models/purchase-order.model';
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
    });

    const recordsTotal = await db.purchaseOrders.count({ where });

    return NextResponse.json({ message: 'Success', result: purchaseOrders, recordsTotal }, { status: 200 });
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

  const data: PurchaseOrderModel = new PurchaseOrderModel(await request.json());

  // const validatedData = data.validate();

  // // if validation failed
  // if (!validatedData.success) {
  //   return NextResponse.json(
  //     {
  //       message: 'Terdapat kesalahan pada data yang dikirim',
  //       error: validatedData.error.flatten().fieldErrors,
  //     },
  //     { status: 400 }
  //   );
  // }

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

    const po = await db.purchaseOrders.create({
      data: {
        code: newCode,
        purchaseDate: data.purchaseDate,
        Supplier: {
          connect: { id: data.supplierId },
        },
        remarks: data.remarks,
        totalItem: data.totalItem,
        totalPrice: data.totalPrice,
        status: data.status,
        CreatedBy: {
          connect: { id: userId },
        },
      },
    });

    // save po detail

    return NextResponse.json({ message: 'Data Transaksi Pembelian Berhasil Disimpan' }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
