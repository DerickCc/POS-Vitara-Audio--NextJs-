import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { NextResponse } from 'next/server';

// UpdatePurchaseOrder
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const userId = session.id;

    const po = await db.purchaseOrders.findUnique({
      where: { id },
    });

    if (!po) {
      return NextResponse.json(
        { message: 'Data Transaksi Pembelian Gagal Dibatalkan Karena Tidak Ditemukan' },
        { status: 404 }
      );
    } else if (po.status !== 'Dalam Proses') {
      return NextResponse.json(
        { message: 'Hanya Dapat Membatalkan Transaksi Pembelian yang Berstatus "Dalam Proses"' },
        { status: 403 } // 403 = Forbidden
      );
    }

    const canceledPo = await db.purchaseOrders.update({
      where: { id },
      data: {
        status: 'Dibatalkan',
        UpdatedBy: {
          connect: { id: userId },
        },
      },
    });

    return NextResponse.json({ message: 'Transaksi Pembelian Berhasil Dibatalkan' }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
