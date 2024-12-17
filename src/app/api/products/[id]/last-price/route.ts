import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Decimal } from '@prisma/client/runtime/library';
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
    let lastPrice = new Decimal(0);

    if (type === 'supplier') {
      const pod = await db.purchaseOrderDetails.findFirst({
        where: {
          productId,
          PurchaseOrder: {
            supplierId: supOrCusId,
          },
        },
        orderBy: { createdAt: 'desc' },
        select: { purchasePrice: true },
      });

      lastPrice = pod?.purchasePrice || new Decimal(0);
    } else if (type === 'customer') {
      const sopd = await db.salesOrderProductDetails.findFirst({
        where: {
          productId,
          SalesOrder: {
            customerId: supOrCusId,
            status: { not: 'Batal' }
          },
        },
        orderBy: { createdAt: 'desc' },
        select: { sellingPrice: true },
      });

      lastPrice = sopd?.sellingPrice || new Decimal(0);
    }

    return NextResponse.json({ message: 'Success', result: Number(lastPrice) }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e, result: 0 }, { status: 500 });
  }
}
