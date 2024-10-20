import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { NextResponse } from 'next/server';

// CancelPurchaseOrder
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session || session.role !== 'Admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const userId = session.id;

    const po = await db.purchaseOrders.findUnique({
      where: { id },
      include: { PurchaseOrderDetails: true },
    });

    if (!po) {
      throw new Error('Data Transaksi Pembelian tidak ditemukan');
    } else if (po.status !== 'Selesai') {
      throw new Error('Hanya Transaksi Pembelian berstatus "Selesai" yang dapat dibatalkan');
    }

    await db.$transaction(async (prisma) => {
      // update stock and costPrice of each product in details
      const updatePromises = po.PurchaseOrderDetails.map(async (d) => {
        const product = await prisma.products.findUnique({ where: { id: d.productId } });

        if (!product) {
          throw new Error('Barang yang ingin di-update tidak ditemukan');
        }

        // total cost before substracted with purchase product
        const totalCost = product.stock.times(product.costPrice); 
        
        // stock substracted added with purchased product qty
        const updatedStock = product.stock.minus(d.quantity); 
        
        if (updatedStock.isNegative()) {
          throw new Error(`Transaksi tidak dapat dibatalkan karena stok ${product.name} akan minus`);
        }

        const updatedCostPrice = totalCost.minus(d.totalPrice).isZero()
          ? 0
          : totalCost.minus(d.totalPrice).div(updatedStock); // cost price calculated after cancel purchase product

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

      // set po status to 'Batal'
      await db.purchaseOrders.update({
        where: { id },
        data: {
          status: 'Batal',
          UpdatedBy: {
            connect: { id: userId },
          },
        },
      });
    });

    return NextResponse.json({ message: 'Transaksi Pembelian berhasil dibatalkan' }, { status: 200 });
  } catch (e: any) {
    if (e.message.includes('Hanya Transaksi Pembelian berstatus "Selesai" yang dapat dibatalkan')) {
      return NextResponse.json({ message: e.message }, { status: 403 });
    }
    if (e.message.includes('tidak ditemukan')) {
      return NextResponse.json({ message: e.message }, { status: 404 }); // forbidden
    }
    if (e.message.includes('akan minus')) {
      return NextResponse.json({ message: e.message }, { status: 422 }); // unprocessable entity
    }
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
