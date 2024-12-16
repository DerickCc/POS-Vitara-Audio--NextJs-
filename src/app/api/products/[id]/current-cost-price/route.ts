import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { NextResponse } from 'next/server';

// GetProductCurrCostPriceyId
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json({ message: 'Unauthorized, mohon melakukan login ulang' }, { status: 401 });
  }

  const { id } = params;

  try {
    const product = await db.products.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        costPrice: true,
      },
    });
    
    if (!product) {
      return NextResponse.json({ message: 'Barang tidak ditemukan' }, { status: 404 });
    }

    const formattedProduct = {
      ...product,
      costPrice: Number(product.costPrice),
    };

    return NextResponse.json({ message: 'Success', result: formattedProduct }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
