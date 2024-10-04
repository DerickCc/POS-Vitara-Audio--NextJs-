import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { NextResponse } from 'next/server';

// SearchSupplier
export async function GET(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized', result: null }, { status: 401 });
  }

  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);

  // filters
  const name = queryParams.get('name') ?? '';

  const where: any = {};
  if (name) {
    // full text search
    const searchTerm = name.split(' ').filter((term) => term);

    if (searchTerm.length > 0) {
      where['AND'] = searchTerm.map((term) => ({
        name: {
          contains: term,
          mode: 'insensitive',
        },
      }));
    }
  }
  // ----------------

  try {
    const suppliers = await db.suppliers.findMany({
      orderBy: { name: 'asc' },
      where,
    });

    return NextResponse.json({ message: 'Success', result: suppliers }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e, result: null }, { status: 500 });
  }
}
