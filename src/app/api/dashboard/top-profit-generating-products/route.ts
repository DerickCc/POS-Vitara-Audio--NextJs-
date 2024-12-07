import { TopProfitGeneratingProductModel } from '@/models/dashboard.model';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
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

  try {
    const topProfitGeneratingProducts = await db.$queryRaw<rawQueryModel[]>`
      SELECT 
        p.name, 
        p.uom,
        SUM(sopd.quantity) AS item_sold,
        SUM(sopd.quantity * (sopd.selling_price - sopd.cost_price)) AS total_profit
      FROM "public"."SalesOrderProductDetails" sopd
      JOIN "public"."Products" p ON sopd.product_id = p.id
      GROUP BY p.id
      ORDER BY total_profit DESC
      LIMIT ${limit}
    `;

    const mappedTopProfitGeneratingProducts: TopProfitGeneratingProductModel[] = topProfitGeneratingProducts.map(prd => ({
      ...prd,
      label: prd.name,
      itemSold: Number(prd.item_sold),
      totalProfit: Number(prd.total_profit),
      item_sold: undefined,
      total_profit: undefined,
      name: undefined,
    }))

    return NextResponse.json({ message: 'Success', result: mappedTopProfitGeneratingProducts });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e, result: [] }, { status: 500 });
  }
}
