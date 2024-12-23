import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server';

// BrowseCustomerHistories
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json(
      { message: 'Unauthorized, mohon melakukan login ulang', result: null, recordsTotal: 0 },
      { status: 401 }
    );
  }

  const { id } = params;

  if (!id) {
    return NextResponse.json({ message: 'Id barang tidak boleh null' }, { status: 400 });
  }

  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);

  const pageIndex = Number(queryParams.get('pageIndex')) ?? 0;
  const pageSize = Number(queryParams.get('pageSize')) ?? 5;
  const sortOrder = queryParams.get('sortOrder') ?? 'desc';
  const sortColumn = queryParams.get('sortColumn') ?? 'createdAt';

  const orderBy = { createdAt: 'desc' as Prisma.SortOrder };

  try {
    // Sales Order
    const salesOrders = await db.salesOrders.findMany({
      select: {
        id: true,
        createdAt: true,
        code: true,
        status: true,
        grandTotal: true,
      },
      where: {
        customerId: id,
      },
      orderBy,
    });

    const formattedSalesOrders = salesOrders.map((so) => ({
      date: so.createdAt,
      id: so.id,
      code: so.code,
      status: so.status,
      grandTotal: so.grandTotal,
      type: 'Penjualan',
    }));

    // Sales Return
    const salesReturns = await db.salesReturns.findMany({
      select: {
        id: true,
        createdAt: true,
        code: true,
        status: true,
        SalesReturnProductDetails: {
          select: {
            returnPrice: true,
            returnQuantity: true,
          },
        },
      },
      where: {
        SalesOrder: {
          customerId: id,
        },
      },
      orderBy,
    });

    const formattedSalesReturns = salesReturns.map((sr) => ({
      date: sr.createdAt,
      id: sr.id,
      code: sr.code,
      status: sr.status,
      grandTotal: sr.SalesReturnProductDetails.reduce(
        (acc, d) => acc.plus(d.returnPrice.times(d.returnQuantity)),
        new Decimal(0)
      ),
      type: `Retur Penjualan`,
    }));

    const customerHistories = [...formattedSalesOrders, ...formattedSalesReturns].sort((a, b) => {
      if (sortOrder === 'desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
    });

    const pagedCustomerHistories = customerHistories.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize);

    return NextResponse.json(
      { message: 'Success', result: pagedCustomerHistories, recordsTotal: customerHistories.length },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json(
      { message: 'Internal Server Error: ' + e, result: null, recordsTotal: 0 },
      { status: 500 }
    );
  }
}
