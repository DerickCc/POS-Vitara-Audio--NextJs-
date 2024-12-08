import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Decimal } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server';

// GetOverviewMetrics
export async function GET(request: Request) {
  const session = await getSession();

  if (!session?.id) {
    return NextResponse.json({ message: 'Unauthorized, mohon melakukan login ulang' }, { status: 401 });
  }

  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999); // Last day of this month

    const dateFilter = {
      createdAt: { gte: startOfMonth, lte: endOfMonth },
    };

    const [newCustomers, newProducts, salesThisMonth, onGoingPo] = await Promise.all([
      db.customers.count({ where: dateFilter }),
      db.products.count({ where: dateFilter }),
      db.salesOrders.findMany({ where: dateFilter, select: { grandTotal: true } }),
      db.purchaseOrders.count({ where: { ...dateFilter, status: 'Dalam Proses' } }),
    ]);

    const totalSales = salesThisMonth.reduce((acc, sales) => acc.plus(sales.grandTotal), new Decimal(0));

    const overviewMetrics = {
      newCustomers,
      newProducts,
      totalSales: Number(totalSales),
      onGoingPo,
    };

    return NextResponse.json({ message: 'Success', result: overviewMetrics }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e, result: null }, { status: 500 });
  }
}
