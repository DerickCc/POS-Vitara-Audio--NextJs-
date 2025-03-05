import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { NextResponse } from 'next/server';

// FinishPurchaseOrder
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json({ message: 'Unauthorized, mohon melakukan login ulang' }, { status: 401 });
  }

  const { id } = params;

  try {
    const userId = session.id;

    await db.$transaction(async (prisma) => {
      const po = await prisma.purchaseOrders.findUnique({
        where: { id },
        select: {
          progressStatus: true,
          PurchaseOrderDetails: {
            select: {
              productId: true,
              quantity: true,
              totalPrice: true,
              Product: {
                select: {
                  stock: true,
                  costPrice: true,
                },
              },
            },
          },
        },
      });

      if (!po) {
        throw new Error('Data Transaksi Pembelian tidak ditemukan');
      } else if (po.progressStatus !== 'Dalam Proses') {
        throw new Error('Hanya Transaksi Pembelian berstatus "Dalam Proses" yang dapat diselesaikan');
      }

      // update stock and costPrice of each product in details
      const updatePromises = po.PurchaseOrderDetails.map(async (d) => {
        const totalCost = d.Product.stock.times(d.Product.costPrice); // total cost before added with purchase product
        const updatedStock = d.Product.stock.plus(d.quantity); // stock after added with purchased product qty

        const updatedCostPrice = totalCost.plus(d.totalPrice).div(updatedStock).round(); // cost price calculated after purchase product

        return prisma.products.update({
          where: { id: d.productId },
          data: {
            stock: updatedStock,
            costPrice: updatedCostPrice,
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
    },
    {
      maxWait: 10000, // 10 seconds max wait to connect to prisma
      timeout: 20000, // 20 seconds
    });

    return NextResponse.json({ message: 'Transaksi Pembelian Berhasil Diselesaikan' }, { status: 200 });
  } catch (e: any) {
    if (e.message.includes('Hanya Transaksi Pembelian berstatus "Dalam Proses" yang dapat diselesaikan')) {
      return NextResponse.json({ message: e.message }, { status: 403 });
    }
    if (e.message.includes('tidak ditemukan')) {
      return NextResponse.json({ message: e.message }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
