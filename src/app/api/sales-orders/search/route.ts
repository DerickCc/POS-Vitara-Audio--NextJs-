import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { NextResponse } from 'next/server';

// SearcSalesOrder
export async function GET(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized', result: null }, { status: 401 });
  }

  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);

  // filters
  const code = queryParams.get('code') ?? '';

  const where: any = { AND: [] };
  if (code) {
    where.AND.push({
      code: {
        contains: code,
        mode: 'insensitive',
      },
    });
  }
  // ----------------

  try {
    const salesOrders = await db.salesOrders.findMany({
      orderBy: { code: 'desc' },
      where,
      select: {
        id: true,
        code: true,
      },
    });

    const salesOrdersWithExtraData: any[] = salesOrders.map((po) => ({
      ...po,
      value: po.id,
      label: po.code,
    }));

    return NextResponse.json({ message: 'Success', result: salesOrdersWithExtraData }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e, result: null }, { status: 500 });
  }
}
