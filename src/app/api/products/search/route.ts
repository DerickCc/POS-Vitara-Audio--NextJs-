import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { NextResponse } from 'next/server';

// SearchProduct
export async function GET(request: Request) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json({ message: 'Unauthorized, mohon melakukan login ulang' }, { status: 401 });
  }

  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);

  // filters
  const name = queryParams.get('name') ?? '';

  const where: any = {};
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
    const products = await db.products.findMany({
      orderBy: { name: 'asc' },
      where,
      select: {
        id: true,
        code: true,
        name: true,
        purchasePrice: true,
        purchasePriceCode: true,
        sellingPrice: true,
        uom: true,
        stock: true,
      },
    });

    const productsWithExtraData = products.map((product) => ({
      ...product,
      purchasePrice: Number(product.purchasePrice),
      sellingPrice: Number(product.sellingPrice),
      stock: Number(product.stock),
      value: product.id,
      label: product.name,
    }));

    return NextResponse.json({ message: 'Success', result: productsWithExtraData }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e, result: null }, { status: 500 });
  }
}
