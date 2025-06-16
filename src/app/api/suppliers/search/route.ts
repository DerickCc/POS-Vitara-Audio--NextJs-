import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { NextResponse } from 'next/server';

// SearchSupplier
export async function GET(request: Request) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json(
      { message: 'Unauthorized, mohon melakukan login ulang', result: null, recordsTotal: 0 },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);

  // filters
  const name = queryParams.get('name') ?? '';

  const where: any = { AND: [] };
  if (name) {
    const searchTerms = name.trim().split(' ').filter(term => term);
    const formattedQuery = searchTerms.map(term => term + ':*').join(' & ');

    if (formattedQuery) {
      where.name = {
        search: formattedQuery,
      };
    }
  }
  // ----------------

  try {
    const suppliers = await db.suppliers.findMany({
      orderBy: { name: 'asc' },
      where,
      select: {
        id: true,
        code: true,
        name: true,
        receivables: true,
      },
    });

    const suppliersWithExtraData = suppliers.map(supplier => ({
      ...supplier,
      value: supplier.id,
      label: supplier.name,
    }));

    return NextResponse.json({ message: 'Success', result: suppliersWithExtraData }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e, result: null }, { status: 500 });
  }
}
