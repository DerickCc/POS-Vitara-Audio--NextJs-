import { PurchaseOrderModel } from '@/models/purchase-order.model';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { NextResponse } from 'next/server';

// GetPurchaseOrderById
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized', result: null }, { status: 401 });
  }

  const { id } = params;

  try {
    const po = await db.purchaseOrders.findUnique({
      where: { id },
    });

    if (!po) {
      return NextResponse.json({ message: 'Transaksi Pembelian tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Success', result: po }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}

// UpdatePurchaseOrder
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  const data: PurchaseOrderModel = new PurchaseOrderModel(await request.json());

  try {
    const userId = session.id;

    const updatedPo = await db.purchaseOrders.update({
      where: { id },
      data: {
        UpdatedBy: {
          connect: { id: userId },
        },
      },
    });

    // update detail po
    // update product stock

    if (!updatedPo) {
      return NextResponse.json(
        { message: 'Transaksi Pembelian Gagal Diupdate Karena Tidak Ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Transaksi Pembelian Berhasil Diupdate' }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}

// DeletePurchaseOrder
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const po = await db.purchaseOrders.findUnique({
      where: { id },
    });

    if (!po) {
      return NextResponse.json(
        { message: 'Transaksi Pembelian Gagal Dihapus Karena Tidak Ditemukan' },
        { status: 404 }
      );
    } else if (po.status !== 'Sedang Berlangsung') {
      return NextResponse.json(
        { message: 'Hanya Dapat Menghapus Transaksi Pembelian yang Berstatus "Sedang Berlangsung"' },
        { status: 403 } // 403 = Forbidden
      );
    }

    const deletedPo = await db.purchaseOrders.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: 'Transaksi Pembelian Berhasil Dihapus' }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
