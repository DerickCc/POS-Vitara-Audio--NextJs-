import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { NextResponse } from 'next/server';

// FinishSalesOrder
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json({ message: 'Unauthorized, mohon melakukan login ulang' }, { status: 401 });
  }

  const { id } = params;

  try {
    const userId = session.id;

    await db.$transaction(async (prisma) => {
      const so = await prisma.salesOrders.findUnique({
        where: { id },
        select: {
          progressStatus: true,
          SalesOrderProductDetails: {
            select: {
              productId: true,
              quantity: true,

            }
          }
        }
      });

      if (!so) {
        throw new Error('Data Transaksi Penjualan tidak ditemukan');
      } else if (so.progressStatus !== 'Belum Dikerjakan') {
        throw new Error('Hanya Transaksi Penjualan berstatus "Belum Dikerjakan" yang dapat diselesaikan');
      }

      // update stock of each product in details
      const updatePromises = so.SalesOrderProductDetails.map(async (d) => {
        return prisma.products.update({
          where: { id: d.productId },
          data: {
            stock: { decrement: d.quantity },
            UpdatedBy: {
              connect: { id: userId },
            },
          },
        });
      });

      await Promise.all(updatePromises);

      // set po status to 'Selesai'
      await prisma.purchaseOrders.update({
        where: { id },
        data: {
          progressStatus: 'Selesai',
          UpdatedBy: {
            connect: { id: userId },
          },
        },
      });
    });

    return NextResponse.json({ message: 'Transaksi Penjualan Berhasil Diselesaikan' }, { status: 200 });
  } catch (e: any) {
    if (e.message.includes('Hanya Transaksi Penjualan berstatus "Belum Dikerjakan" yang dapat diselesaikan')) {
      return NextResponse.json({ message: e.message }, { status: 403 });
    }
    if (e.message.includes('tidak ditemukan')) {
      return NextResponse.json({ message: e.message }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
