import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Decimal } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server';

// FinishPurchaseOrder
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const userId = session.id;

    await db.$transaction(async (prisma) => {
      const po = await prisma.purchaseOrders.findUnique({
        where: { id },
        include: { PurchaseOrderDetails: true }
      });
  
      if (!po) {
        return NextResponse.json(
          { message: 'Data Transaksi Pembelian Gagal Dibatalkan Karena Tidak Ditemukan' },
          { status: 404 }
        );
      } else if (po.status !== 'Dalam Proses') {
        return NextResponse.json(
          { message: 'Hanya Dapat Menyelesaikan Transaksi Pembelian yang Berstatus "Dalam Proses"' },
          { status: 403 } // 403 = Forbidden
        );
      }

      const updatePromises = po.PurchaseOrderDetails.map(async d => {
        const product = await prisma.products.findUnique({ where: { id: d.productId}});
      
        if (!product) {
          throw new Error('Barang yang ingin di-update Tidak Ditemukan');
        }

        const totalCost = product.stock.times(product.costPrice); // total cost before added with purchase product
        const currStock = product.stock.plus(d.quantity); // stock after added with purchased product qty

        const currCostPrice = totalCost.plus(d.totalPrice).div(currStock); // cost price calculated after purchase product

        return prisma.products.update({
          where: { id: d.productId },
          data: { 
            stock: currStock,
            costPrice: currCostPrice,
            UpdatedBy: {
              connect: { id: userId },
            },
          }
        })
      });

      await Promise.all(updatePromises);

      // set po status to 'Selesai'
      await prisma.purchaseOrders.update({
        where: { id },
        data: {
          status: 'Selesai',
          UpdatedBy: {
            connect: { id: userId },
          },
        },
      });
    })


    return NextResponse.json({ message: 'Transaksi Pembelian Berhasil Diselesaikan' }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
