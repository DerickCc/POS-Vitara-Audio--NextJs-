import { TopProfitGeneratingProductModel } from '@/models/dashboard.model';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

interface rawQueryModel {
  name: string;
  uom: string;
  item_sold: number;
  total_profit: number;
}

// GetTopProfitGeneratingProduct
export async function GET(request: Request) {
  const session = await getSession();

  if (!session?.id) {
    return NextResponse.json({ message: 'Unauthorized, mohon melakukan login ulang', result: [] }, { status: 401 });
  }

  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);

  const period = queryParams.get('period') || 'all-time';
  const limit = Number(queryParams.get('limit')) || 5;

  const today = new Date();
  let startDate: Date | null = null;
  let endDate: Date | null = null;

  if (period === 'year') {
    const currYear = new Date().getFullYear();
    startDate = new Date(currYear, 0, 1); // 1st January
    endDate = new Date(currYear, 11, 31, 23, 59, 59, 999); // 31 December midnight
  } else if (period === 'month') {
    startDate = new Date(today.getFullYear(), today.getMonth(), 1); // first day of month
    endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999); // Last day of this month
  } else if (period === 'day') {
    startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // Start of today
    endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999); // End of today
  }

  const isoStartDate = startDate?.toISOString();
  const isoEndDate = endDate?.toISOString();

  try {
    const topProfitGeneratingProducts = await db.$queryRaw<rawQueryModel[]>`
      SELECT 
        p.name, 
        p.uom,
        SUM(sopd.quantity) AS item_sold,
        SUM(sopd.quantity * (sopd.selling_price - sopd.cost_price)) AS total_profit
      FROM "public"."SalesOrderProductDetails" sopd
      JOIN "public"."Products" p ON sopd.product_id = p.id
      JOIN "public"."SalesOrders" so ON sopd.so_id = so.id
      ${
        period !== 'all-time'
          ? Prisma.sql`WHERE sopd.created_at::text BETWEEN ${isoStartDate} AND ${isoEndDate} AND so.progress_status != 'Batal'`
          : Prisma.sql`WHERE so.progress_status != 'Batal'`
      }
      GROUP BY p.id
      ORDER BY total_profit DESC
      LIMIT ${limit}
    `;

    const mappedTopProfitGeneratingProducts: TopProfitGeneratingProductModel[] = topProfitGeneratingProducts.map(
      (prd) => ({
        ...prd,
        label: prd.name,
        itemSold: Number(prd.item_sold),
        totalProfit: Number(prd.total_profit),
        item_sold: undefined,
        total_profit: undefined,
        name: undefined,
      })
    );

    return NextResponse.json({ message: 'Success', result: mappedTopProfitGeneratingProducts });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e, result: [] }, { status: 500 });
  }
}
