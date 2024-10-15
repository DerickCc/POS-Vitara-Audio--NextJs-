import { SalesOrderSchema } from '@/models/sales-order';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { NextResponse } from 'next/server';

// BrowseSalesOrders
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
  const customerId = queryParams.get('customerId') ?? 0;
  const startDate = queryParams.get('startDate') ?? '';
  const endDate = queryParams.get('endDate') ?? '';
  const status = queryParams.get('status') ?? '';

  const where: any = { AND: [] };
  if (code) {
    where.AND.push({
      code: {
        contains: code,
        mode: 'insensitive',
      },
    });
  }

  if (customerId) {
    where.AND.push({ customerId });
  }

  if (startDate) {
    const startOfDay = new Date(startDate);

    where.AND.push({
      salesDate: {
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
      salesDate: {
        lte: endOfDay,
      },
    });
  }

  if (status) {
    where.AND.push({ status });
  }
  // ----------------

  try {
    const salesOrders = await db.salesOrders.findMany({
      skip: pageIndex * pageSize,
      take: pageSize,
      orderBy: {
        [sortColumn]: sortOrder,
      },
      where,
      include: {
        Customer: {
          select: { name: true },
        },
      },
    });
    const recordsTotal = await db.salesOrders.count({ where });

    const mappedSalesOrders = salesOrders.map((po) => ({
      ...po,
      customerName: po.Customer.name,
      Customer: undefined,
    }));

    return NextResponse.json({ message: 'Success', result: mappedSalesOrders, recordsTotal }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { message: 'Internal Server Error: ' + e, result: null, recordsTotal: 0 },
      { status: 500 }
    );
  }
}

// CreateSalesOrder
export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const validationRes = SalesOrderSchema.safeParse(await request.json());

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

    // retreive last so code
    const lastSo = await db.salesOrders.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { code: true },
    });

    let newCode = 'SO00000001'; // default code

    if (lastSo) {
      const lastCodeNumber = parseInt(lastSo.code.replace('SO', ''), 10);
      newCode = 'SO' + (lastCodeNumber + 1).toString().padStart(8, '0');
    }

    const salesDate = new Date().toISOString();
    // const grandTotal = data.details.reduce((acc, d) => {
    //   return acc + d.purchasePrice * d.quantity;
    // }, 0);

    // await db.$transaction(async (prisma) => {
    //   const po = await prisma.purchaseOrders.create({
    //     data: {
    //       code: newCode,
    //       purchaseDate: purchaseDate,
    //       Supplier: {
    //         connect: { id: data.supplierId },
    //       },
    //       remarks: data.remarks,
    //       totalItem: data.details.length,
    //       grandTotal: grandTotal,
    //       status: 'Dalam Proses',
    //       CreatedBy: {
    //         connect: { id: userId },
    //       },
    //     },
    //   });

    //   await prisma.purchaseOrderDetails.createMany({
    //     data: data.details.map((d) => ({
    //       poId: po.id,
    //       productId: d.productId,
    //       purchasePrice: d.purchasePrice,
    //       quantity: d.quantity,
    //       totalPrice: d.purchasePrice * d.quantity,
    //       createdBy: userId,
    //     })),
    //   });
    // });

    return NextResponse.json({ message: 'Data Transaksi Penjualan berhasil disimpan' }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
