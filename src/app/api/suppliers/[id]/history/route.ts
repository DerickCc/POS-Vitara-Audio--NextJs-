import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

// BrowseSupplierHistories
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json(
      { message: 'Unauthorized, mohon melakukan login ulang', result: null, recordsTotal: 0 },
      { status: 401 }
    );
  }

  const { id: supplierId } = params;

  if (!supplierId) {
    return NextResponse.json({ message: 'Id supplier tidak boleh null' }, { status: 400 });
  }

  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);
  const pageIndex = Number(queryParams.get('pageIndex')) || 0;
  const pageSize = Number(queryParams.get('pageSize')) || 5;
  const sortOrder = (queryParams.get('sortOrder') as Prisma.SortOrder) || 'desc';

  try {
    const dataQuery = Prisma.sql`
      (SELECT id, created_at as date, code, grand_total, payment_status, progress_status, 'Pembelian' AS type
      FROM "PurchaseOrders" WHERE supplier_id = ${supplierId})
      UNION ALL
      (SELECT pr.id, pr.created_at as date, pr.code, pr.grand_total, '' AS payment_status, pr.status AS progress_status, 'Retur Pembelian' AS type
      FROM "PurchaseReturns" pr JOIN "PurchaseOrders" po ON pr.po_id = po.id WHERE po.supplier_id = ${supplierId})
      ORDER BY date ${sortOrder === 'desc' ? Prisma.sql`DESC` : Prisma.sql`ASC`}
      LIMIT ${pageSize}
      OFFSET ${pageIndex * pageSize}
    `;

    const countQuery = Prisma.sql`
      SELECT SUM(total) FROM (
        (SELECT COUNT(*) as total FROM "PurchaseOrders" WHERE supplier_id = ${supplierId})
        UNION ALL
        (SELECT COUNT(*) as total FROM "PurchaseReturns" pr JOIN "PurchaseOrders" po ON pr.po_id = po.id WHERE po.supplier_id = ${supplierId})
      ) as "union_count"
    `;

    const [result, countResult] = await Promise.all([
      db.$queryRaw<any[]>(dataQuery),
      db.$queryRaw<{ sum: any }[]>(countQuery),
    ]);

    const mappedSupplierHistories = result.map((h) => {
      return {
        ...h,
        grandTotal: h.grand_total,
        paymentStatus: h.payment_status,
        progressStatus: h.progress_status,
        grand_total: undefined,
        payment_status: undefined,
        progress_status: undefined,
      };
    });

    const recordsTotal = Number(countResult[0]?.sum || 0);

    return NextResponse.json(
      { message: 'Success', result: mappedSupplierHistories, recordsTotal },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json(
      { message: 'Internal Server Error: ' + e, result: null, recordsTotal: 0 },
      { status: 500 }
    );
  }
}
