import { SearchSupplierModel } from '@/models/supplier.model';
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
    // full text search
    const searchTerm = name.split(' ').filter((term) => term);

    if (searchTerm.length > 0) {
      searchTerm.forEach((term) => {
        where.AND.push({
          name: {
            contains: term,
            mode: 'insensitive',
          },
        });
      });
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
