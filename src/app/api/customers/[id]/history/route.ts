import { db } from "@/utils/prisma";
import { getSession } from "@/utils/sessionlib";
import { Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";

// BrowseCustomerHistories
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json(
      { message: "Unauthorized, mohon melakukan login ulang", result: null, recordsTotal: 0 },
      { status: 401 }
    );
  }

  const { id: customerId } = params;

  if (!customerId) {
    return NextResponse.json({ message: 'Id pelanggan tidak boleh null' }, { status: 400 });
  }

  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);
  const pageIndex = Number(queryParams.get("pageIndex")) || 0;
  const pageSize = Number(queryParams.get("pageSize")) || 5;
  const sortOrder = (queryParams.get("sortOrder") as Prisma.SortOrder) || "desc";

  try {
    const dataQuery = Prisma.sql`
      (SELECT id, created_at AS date, code, grand_total, payment_status, progress_status, 'Penjualan' AS type
      FROM "SalesOrders" WHERE customer_id = ${customerId})
      UNION ALL
      (SELECT sr.id, sr.created_at AS date, sr.code, sr.grand_total, '' AS payment_status, sr.status AS progress_status, 'Retur Penjualan' AS type
      FROM "SalesReturns" sr JOIN "SalesOrders" so ON sr.so_id = so.id WHERE so.customer_id = ${customerId})
      ORDER BY date ${sortOrder === "desc" ? Prisma.sql`DESC` : Prisma.sql`ASC`}
      LIMIT ${pageSize}
      OFFSET ${pageIndex * pageSize}
    `;

    const countQuery = Prisma.sql`
      SELECT SUM(total) FROM (
        (SELECT COUNT(*) as total FROM "SalesOrders" WHERE customer_id = ${customerId})
        UNION ALL
        (SELECT COUNT(*) as total FROM "SalesReturns" sr JOIN "SalesOrders" so ON sr.so_id = so.id WHERE so.customer_id = ${customerId})
      ) as "union_count"
    `;

    const [result, countResult] = await Promise.all([
      db.$queryRaw<any[]>(dataQuery),
      db.$queryRaw<{ sum: any }[]>(countQuery),
    ]);

    const mappedCustomerHistories = result.map((h) => {
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

    return NextResponse.json({ message: "Success", result: mappedCustomerHistories, recordsTotal }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { message: "Internal Server Error: " + e, result: null, recordsTotal: 0 },
      { status: 500 }
    );
  }
}
