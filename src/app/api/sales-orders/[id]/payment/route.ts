import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { NextResponse } from 'next/server';

// UpdateSoPayment
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized', result: null }, { status: 401 });
  }

  const { id } = params;

  try {
    const userId = session.id;

    const so = await db.salesOrders.findUnique({
      where: { id },
      include: { SalesOrderProductDetails: true },
    });

    return NextResponse.json({ message: 'Pembayaran berhasil diupdate' }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
