import { LowStockProductModel } from '@/models/dashboard.model';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

interface LowStockProductRawQueryModel {
  id: string;
  name: string;
  stock: number;
  uom: string;
  restock_threshold: number;
}

// BrowseLowStockProduct
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

  const pageIndex = Number(queryParams.get('pageIndex')) || 0;
  const pageSize = Number(queryParams.get('pageSize')) || 5;
  const sortOrder = queryParams.get('sortOrder') ?? 'desc';

  try {
    const direction = Prisma.sql([sortOrder]);

    const [lowStockProducts, recordsTotal] = await Promise.all([
      db.$queryRaw<LowStockProductRawQueryModel[]>`
        SELECT id, name, stock, uom, restock_threshold
        FROM "Products" WHERE stock < restock_threshold
        ORDER BY stock ${direction} 
        LIMIT ${pageSize}
        OFFSET ${pageIndex * pageSize}
      `,
      db.$queryRaw<{ count: any }[]>`
        SELECT COUNT(id)
        FROM "Products"
        WHERE stock < restock_threshold
      `,
    ]);

    const mappedLowStockProducts: LowStockProductModel[] = lowStockProducts.map((prd) => ({
      ...prd,
      restock_threshold: undefined,
    }));

    // format big int to number
    const formattedRecordsTotal = Number(recordsTotal[0].count);

    return NextResponse.json({
      message: 'Success',
      result: mappedLowStockProducts,
      recordsTotal: formattedRecordsTotal,
    });
  } catch (e) {
    return NextResponse.json(
      { message: 'Internal Server Error: ' + e, result: null, recordsTotal: 0 },
      { status: 500 }
    );
  }
}
