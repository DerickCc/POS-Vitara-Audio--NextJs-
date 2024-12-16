import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { NextResponse } from 'next/server';

// GetProductLastPriceyId
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json({ message: 'Unauthorized, mohon melakukan login ulang' }, { status: 401 });
  }

  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);

  const type = queryParams.get('type') || null;
  const supOrCusId = queryParams.get('supOrCusId') || null;

  if (type !== 'customer' && type !== 'supplier') {
    return NextResponse.json({ message: 'Tipe tidak valid' }, { status: 400 });
  }

  if (!supOrCusId) {
    return NextResponse.json({ message: 'Id supplier atau pelanggan tidak boleh null' }, { status: 400 });
  }

  const { id: productId } = params;

  try {
    const product = await db.products.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        costPrice: true,
      },
    });

    return NextResponse.json({ message: 'Success', result: 0 }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e, result: 0 }, { status: 500 });
  }
}
