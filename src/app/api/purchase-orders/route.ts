import { CreatePurchaseOrderSchema } from '@/models/purchase-order.model';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server';

// BrowsePurchaseOrders
export async function GET(request: Request) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json(
      { message: 'Unauthorized, mohon melakukan login ulang', result: null, recordsTotal: 0 },
      { status: 401 }
    );
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
  const startDate = queryParams.get('startDate') ?? '';
  const endDate = queryParams.get('endDate') ?? '';
  const progressStatus = queryParams.get('progressStatus') ?? '';
  const paymentStatus = queryParams.get('paymentStatus') ?? '';

  const where: any = { AND: [] };
  if (code) {
    where.AND.push({
      code: {
        contains: code,
        mode: 'insensitive',
      },
    });
  }

  if (supplierId) {
    where.AND.push({ supplierId });
  }

  if (startDate) {
    const startOfDay = new Date(startDate);

    where.AND.push({
      purchaseDate: {
        gte: startOfDay,
      },
    });
  }

  if (endDate) {
    const durationToEndOfDay =
      23 * 60 * 60 * 1000 + // Convert hours to milliseconds
      59 * 60 * 1000 + // Convert minutes to milliseconds
      59 * 1000 + // Convert seconds to milliseconds
      999;
    const endOfDay = new Date(new Date(endDate).getTime() + durationToEndOfDay);

    where.AND.push({
      purchaseDate: {
        lte: endOfDay,
      },
    });
  }

  if (progressStatus) {
    where.AND.push({ progressStatus });
  }

  if (paymentStatus) {
    where.AND.push({ paymentStatus });
  }
  // ----------------

  try {
    const purchaseOrders = await db.purchaseOrders.findMany({
      skip: pageIndex * pageSize,
      take: pageSize,
      orderBy:
        sortColumn === 'supplierName'
          ? {
              Supplier: { name: sortOrder as Prisma.SortOrder },
            }
          : {
              [sortColumn]: sortOrder,
            },
      where,
      include: {
        Supplier: {
          select: { name: true },
        },
        PurchaseOrderPaymentHistories: {
          select: { amount: true },
        },
      },
    });
    const recordsTotal = await db.purchaseOrders.count({ where });

    const mappedPurchaseOrders = purchaseOrders.map((po) => {
      const paidAmount = po.PurchaseOrderPaymentHistories.reduce((acc, p) => acc.plus(p.amount), new Decimal(0));

      return {
        ...po,
        supplierName: po.Supplier.name,
        paidAmount: Number(paidAmount),
        grandTotal: Number(po.grandTotal),
        Supplier: undefined,
        PurchaseOrderPaymentHistories: undefined,
      };
    });

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

  if (!session.id) {
    return NextResponse.json({ message: 'Unauthorized, mohon melakukan login ulang' }, { status: 401 });
  }

  const validationRes = CreatePurchaseOrderSchema.safeParse(await request.json());

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
    const supplierReceivables = (
      await db.suppliers.findUniqueOrThrow({
        where: { id: data.supplierId },
        select: { receivables: true },
      })
    ).receivables;

    if (new Decimal(data.appliedReceivables).greaterThan(supplierReceivables)) {
      return NextResponse.json(
        { message: 'Potongan piutang melebihi piutang yang dimiliki supplier' },
        { status: 422 } // unprocessable entity
      );
    }

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

    const subTotal = data.details.reduce((acc, d) => {
      return acc + d.purchasePrice * d.quantity;
    }, 0);
    const grandTotal = subTotal - data.appliedReceivables;
    const paymentStatus = data.paidAmount === grandTotal ? 'Lunas' : 'Belum Lunas';

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
          subTotal,
          appliedReceivables: data.appliedReceivables,
          grandTotal,
          progressStatus: 'Dalam Proses',
          paymentStatus,
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

      if (data.appliedReceivables > 0) {
        await prisma.suppliers.update({
          where: { id: data.supplierId },
          data: {
            receivables: { decrement: data.appliedReceivables },
          },
        });
      }

      if (data.paidAmount > 0) {
        // create payment history
        await prisma.purchaseOrderPaymentHistories.create({
          data: {
            PurchaseOrder: {
              connect: { id: po.id },
            },
            paymentMethod: data.paymentMethod,
            amount: data.paidAmount,
            CreatedBy: {
              connect: { id: userId },
            },
          },
        });
      }
    });

    return NextResponse.json({ message: 'Data Transaksi Pembelian berhasil disimpan' }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
