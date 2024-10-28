import { PurchaseReturnSchema } from '@/models/purchase-return.model';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

// BrowsePurchaseReturns
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
  const poCode = queryParams.get('poCode') ?? '';
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

  if (poCode) {
    where.AND.push({
      poCode: {
        contains: poCode,
        mode: 'insensitive',
      },
    });
  }

  if (status) {
    where.AND.push({ status });
  }
  // ----------------

  try {
    const purchaseReturns = await db.purchaseReturns.findMany({
      skip: pageIndex * pageSize,
      take: pageSize,
      orderBy:
        sortColumn === 'supplierName'
          ? {
              PurchaseOrder: {
                Supplier: {
                  name: sortOrder as Prisma.SortOrder,
                },
              },
            }
          : {
              [sortColumn]: sortOrder,
            },
      where,
      include: {
        PurchaseOrder: {
          select: {
            Supplier: {
              select: { name: true },
            },
          },
        },
      },
    });
    const recordsTotal = await db.purchaseReturns.count({ where });
    console.log(purchaseReturns)

    const mappedPurchaseReturns = purchaseReturns.map((pr) => ({
      ...pr,
      supplierName: pr.PurchaseOrder.Supplier.name,
      // Supplier: undefined,
    }));

    return NextResponse.json({ message: 'Success', result: mappedPurchaseReturns, recordsTotal }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { message: 'Internal Server Error: ' + e, result: null, recordsTotal: 0 },
      { status: 500 }
    );
  }
}

// CreatePurchaseReturn
export async function POST(request: Request) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json(
      { message: 'Unauthorized, mohon melakukan login ulang', result: null, recordsTotal: 0 },
      { status: 401 }
    );
  }

  const validationRes = PurchaseReturnSchema.safeParse(await request.json());

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

    // retreive last pr code
    const lastPr = await db.purchaseReturns.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { code: true },
    });

    let newCode = 'PR00000001'; // default code

    if (lastPr) {
      const lastCodeNumber = parseInt(lastPr.code.replace('PR', ''), 10);
      newCode = 'PO' + (lastCodeNumber + 1).toString().padStart(8, '0');
    }

    // const purchaseDate = new Date().toISOString();
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

    return NextResponse.json({ message: 'Data Retur Pembelian berhasil disimpan' }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
