import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { NextResponse } from 'next/server';

// GetNewSoCode
export async function GET(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized', result: null, recordsTotal: 0 }, { status: 401 });
  }

  try {
    const lastSo = await db.salesOrders.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { code: true },
    });

    let newCode = 'SO00000001'; // default code

    if (lastSo) {
      const lastCodeNumber = parseInt(lastSo.code.replace('SO', ''), 10);
      newCode = 'SO' + (lastCodeNumber + 1).toString().padStart(8, '0');
    }

    return NextResponse.json({ message: 'Success', result: newCode }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
