import { SearchCustomerModel } from '@/models/customer.model';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Customers } from '@prisma/client';
import { NextResponse } from 'next/server';

// SearchCustomner
export async function GET(request: Request) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json({ message: 'Unauthorized, mohon melakukan login ulang' }, { status: 401 });
  }

  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);

  // filters
  const search = queryParams.get('search') ?? '';

  try {
    let customers: any[] = [];
    const formattedQuery = search.trim().split(' ').filter(term => term).map(term => term + ':*').join(' & ');

    customers = await db.$queryRaw<any[]>`
      SELECT id, code, name, license_plate,
        ts_rank(
          to_tsvector('simple', coalesce(name, '') || ' ' || coalesce("license_plate", '')),
          to_tsquery('simple', ${formattedQuery})
        ) as rank
      FROM "public"."Customers"
      WHERE to_tsvector('simple', coalesce(name, '') || ' ' || coalesce("license_plate", '')) @@ to_tsquery('simple', ${formattedQuery})
      ORDER BY rank DESC, name ASC;
    `;

    const customersWithExtraData: SearchCustomerModel[] = customers.map((customer) => ({
      ...customer,
      licensePlate: customer.license_plate,
      value: customer.id,
      label: customer.name,
    }));

    return NextResponse.json({ message: 'Success', result: customersWithExtraData }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e, result: null }, { status: 500 });
  }
}
