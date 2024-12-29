import { SearchCustomerModel } from '@/models/customer.model';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
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

  const where: any = { AND: [] };
  if (search) {
    // full text search
    const searchTerm = search.split(' ').filter((term) => term);

    if (searchTerm.length > 0) {
      searchTerm.forEach((term) => {
        where.AND.push({
          OR: [
            {
              name: {
                contains: term,
                mode: 'insensitive',
              },
            },
            {
              licensePlate: {
                contains: term,
                mode: 'insensitive',
              },
            },
          ],
        });
      });
    }
  }
  // ----------------

  try {
    const customers = await db.customers.findMany({
      orderBy: { name: 'asc' },
      where,
      select: {
        id: true,
        code: true,
        name: true,
        licensePlate: true,
      },
    });

    const customersWithExtraData: SearchCustomerModel[] = customers.map((customer) => ({
      ...customer,
      value: customer.id,
      label: customer.name,
    }));

    return NextResponse.json({ message: 'Success', result: customersWithExtraData }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e, result: null }, { status: 500 });
  }
}
