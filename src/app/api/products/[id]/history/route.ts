import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

// BrowseProductHistories
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json(
      { message: 'Unauthorized, mohon melakukan login ulang', result: null, recordsTotal: 0 },
      { status: 401 }
    );
  }

  const { id: productId } = params;

  if (!productId) {
    return NextResponse.json({ message: 'Id barang tidak boleh null' }, { status: 400 });
  }

  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);

  const pageIndex = Number(queryParams.get('pageIndex')) ?? 0;
  const pageSize = Number(queryParams.get('pageSize')) ?? 5;
  const sortOrder = queryParams.get('sortOrder') ?? 'desc';

  try {
    const dataQuery = Prisma.sql`
      -- 1. purchase order
      SELECT * FROM (
        (
          SELECT
            pod.id,
            po.purchase_date AS date,
            po.code,
            'Pembelian' AS type,
            s.name AS partner_name,
            pod.quantity,
            pod.purchase_price AS price,
            pod.total_price
          FROM "PurchaseOrderDetails" pod
          JOIN "PurchaseOrders" po ON pod.po_id = po.id
          JOIN "Suppliers" s ON po.supplier_id = s.id
          WHERE pod.product_id = ${productId} AND po.progress_status = 'Selesai'
        )
        UNION ALL
        -- 2. sales order
        (
          SELECT
            sopd.id,
            so.sales_date AS date,
            so.code,
            'Penjualan' AS type,
            c.name AS partner_name,
            sopd.quantity,
            sopd.selling_price AS price,
            sopd.total_price
          FROM "SalesOrderProductDetails" sopd
          JOIN "SalesOrders" so ON sopd.so_id = so.id
          JOIN "Customers" c ON so.customer_id = c.id
          WHERE sopd.product_id = ${productId} AND so.progress_status = 'Selesai'
        )
        UNION ALL
        -- 3. purchase return
        (
          SELECT
            prd.id,
            pr.return_date AS date,
            pr.code,
            'Retur Pembelian (' || pr.return_type || 
                CASE 
                    WHEN pr.return_type = 'Penggantian Barang' THEN ' ' || pr.status 
                    ELSE '' 
                END 
            || ')' AS type,
            s.name AS partner_name,
            prd.return_quantity as quantity,
            CASE
              WHEN pr.return_type = 'Penggantian Barang' THEN 0
              ELSE prd.return_price
            END AS price,
            CASE
              WHEN pr.return_type = 'Penggantian Barang' THEN 0
              ELSE (prd.return_price * prd.return_quantity)
            END AS total_price
          FROM "PurchaseReturnDetails" prd
          JOIN "PurchaseReturns" pr ON prd.pr_id = pr.id
          JOIN "PurchaseOrderDetails" pod ON prd.pod_id = pod.id
          JOIN "PurchaseOrders" po ON pr.po_id = po.id
          JOIN "Suppliers" s ON po.supplier_id = s.id
          WHERE pod.product_id = ${productId} AND pr.status != 'Batal'
        )
        UNION ALL
        -- 4. sales return
        (
          SELECT
            srpd.id,
            sr.return_date AS date,
            sr.code,
            'Retur Penjualan' AS type,
            c.name AS partner_name,
            srpd.return_quantity as quantity,
            srpd.return_price as price,
            srpd.return_price * srpd.return_quantity AS total_price
          FROM "SalesReturnProductDetails" srpd
          JOIN "SalesReturns" sr ON srpd.sr_id = sr.id
          JOIN "SalesOrderProductDetails" sopd ON srpd.sopd_id = sopd.id
          JOIN "SalesOrders" so ON sr.so_id = so.id
          JOIN "Customers" c ON so.customer_id = c.id
          WHERE sopd.product_id = ${productId} AND sr.status = 'Selesai'
        )
      ) AS "product_histories"
      ORDER BY date ${sortOrder === 'desc' ? Prisma.sql`DESC` : Prisma.sql`ASC`}
      LIMIT ${pageSize}
      OFFSET ${pageSize * pageIndex}
    `;

    const countQuery = Prisma.sql`
      SELECT SUM(total) FROM (
        (
          SELECT COUNT(*) AS total FROM "PurchaseOrderDetails" pod JOIN "PurchaseOrders" po ON pod.po_id = po.id 
          WHERE pod.product_id = ${productId} AND po.progress_status = 'Selesai'
        )
        UNION ALL
        (
          SELECT COUNT(*) AS total FROM "SalesOrderProductDetails" sopd JOIN "SalesOrders" so ON sopd.so_id = so.id 
          WHERE sopd.product_id = ${productId} AND so.progress_status = 'Selesai'
        )
        UNION ALL
        (
          SELECT COUNT(*) as total FROM "PurchaseReturnDetails" prd JOIN "PurchaseOrderDetails" pod ON prd.pod_id = pod.id JOIN "PurchaseReturns" pr ON prd.pr_id = pr.id 
          WHERE pod.product_id = ${productId} AND pr.status != 'Batal'
        )
        UNION ALL
        (
          SELECT COUNT(*) as total FROM "SalesReturnProductDetails" srpd JOIN "SalesOrderProductDetails" sopd ON srpd.sopd_id = sopd.id JOIN "SalesReturns" sr ON srpd.sr_id = sr.id 
          WHERE sopd.product_id = ${productId} AND sr.status='Selesai'
        )
      ) as "union_count"
    `;

    const [result, countResult] = await Promise.all([
      db.$queryRaw<any[]>(dataQuery),
      db.$queryRaw<{ sum: any }[]>(countQuery),
    ]);

    const mappedProductHistories = result.map((h) => {
      return {
        ...h,
        date: h.created_at,
        supOrCus: h.partner_name,
        price: Number(h.price),
        quantity: Number(h.quantity),
        totalPrice: Number(h.total_price),
        created_at: undefined,
        partner_name: undefined,
        total_price: undefined,
      };
    });

    const recordsTotal = Number(countResult[0]?.sum || 0);

    return NextResponse.json({ message: 'Success', result: mappedProductHistories, recordsTotal }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { message: 'Internal Server Error: ' + e, result: null, recordsTotal: 0 },
      { status: 500 }
    );
  }
}
