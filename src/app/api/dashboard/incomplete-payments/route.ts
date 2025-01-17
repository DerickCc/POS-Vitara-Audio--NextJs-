import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server';

// BrowseIncompletePayment
export async function GET(request: Request) {
  const session = await getSession();

  if (!session?.id) {
    return NextResponse.json(
      { message: 'Unauthorized, mohon melakukan login ulang', result: null, recordsTotal: 0 },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);

  const pageIndex = Number(queryParams.get('pageIndex')) ?? 0;
  const pageSize = Number(queryParams.get('pageSize')) ?? 5;
  const sortOrder = queryParams.get('sortOrder') ?? 'desc';
  const sortColumn = queryParams.get('sortColumn') ?? 'createdAt';

  const where = { progressStatus: 'Belum Lunas' };

  try {
    const incompletePayments = await db.salesOrders.findMany({
      skip: pageIndex * pageSize,
      take: pageSize,
      orderBy:
        sortColumn === 'customerName'
          ? {
              Customer: { name: sortOrder as Prisma.SortOrder },
            }
          : {
              [sortColumn]: sortOrder,
            },
      where,
      select: {
        id: true,
        code: true,
        Customer: {
          select: { name: true, licensePlate: true },
        },
        grandTotal: true,
        SalesOrderPaymentHistories: {
          select: { amount: true },
        },
      },
    });
    const recordsTotal = await db.salesOrders.count({ where });

    const mappedIncompletePayments = incompletePayments.map((data) => {
      const paidAmount = data.SalesOrderPaymentHistories.reduce((acc, p) => acc.plus(p.amount), new Decimal(0));

      return {
        ...data,
        soId: data.id,
        soCode: data.code,
        customerName: data.Customer.name,
        customerLicensePlate: data.Customer.licensePlate,
        paidAmount,
        id: undefined,
        code: undefined,
        Customer: undefined,
        SalesOrderPaymentHistories: undefined,
      };
    });

    return NextResponse.json({ message: 'Success', result: mappedIncompletePayments, recordsTotal });
  } catch (e) {
    return NextResponse.json(
      { message: 'Internal Server Error: ' + e, result: null, recordsTotal: 0 },
      { status: 500 }
    );
  }
}
