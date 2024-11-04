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
    where.AND.push({
      PurchaseOrder: { supplierId },
    });
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
            code: true,
          },
        },
      },
    });
    const recordsTotal = await db.purchaseReturns.count({ where });

    const mappedPurchaseReturns = purchaseReturns.map((pr) => ({
      ...pr,
      supplierName: pr.PurchaseOrder.Supplier.name,
      poCode: pr.PurchaseOrder.code,
      PurchaseOrder: undefined,
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
    const grandTotal = data.details.reduce((acc, d) => {
      return acc + d.purchasePrice * d.returnQuantity;
    }, 0);

    // check receivables if piutang
    if (data.returnType === 'Piutang') {
      const supplier = (
        await db.purchaseOrders.findUniqueOrThrow({
          where: { id: data.poId },
          select: {
            Supplier: {
              select: {
                receivables: true,
                receivablesLimit: true,
              },
            },
          },
        })
      )?.Supplier;

      if (grandTotal > supplier.receivablesLimit - supplier.receivables) {
        const remainingReceivables = new Intl.NumberFormat('id-ID').format(
          supplier.receivablesLimit - supplier.receivables
        );

        return NextResponse.json(
          { message: `Grand total retur melebihi sisa piutang (Tersisa: Rp ${remainingReceivables})` },
          { status: 400 }
        );
      }
    }

    // retreive last pr code
    const lastPr = await db.purchaseReturns.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { code: true },
    });

    let newCode = 'PR00000001'; // default code

    if (lastPr) {
      const lastCodeNumber = parseInt(lastPr.code.replace('PR', ''), 10);
      newCode = 'PR' + (lastCodeNumber + 1).toString().padStart(8, '0');
    }

    const returnDate = new Date().toISOString();

    await db.$transaction(async (prisma) => {
      const pr = await prisma.purchaseReturns.create({
        data: {
          code: newCode,
          PurchaseOrder: {
            connect: { id: data.poId },
          },
          returnDate,
          returnType: data.returnType,
          grandTotal,
          status: 'Dalam Proses',
          CreatedBy: {
            connect: { id: userId },
          },
        },
      });

      await prisma.purchaseReturnDetails.createMany({
        data: data.details.map((d) => ({
          prId: pr.id,
          podId: d.podId,
          returnQuantity: d.returnQuantity,
          reason: d.reason,
          createdBy: userId,
        })),
      });
    });

    return NextResponse.json({ message: 'Data Retur Pembelian berhasil disimpan' }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
