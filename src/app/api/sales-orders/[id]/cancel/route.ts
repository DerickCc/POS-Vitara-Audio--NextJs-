import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { NextResponse } from 'next/server';

// CancelSalesOrder
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session || session.role !== 'Admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const userId = session.id;

    const so = await db.salesOrders.findUnique({
      where: { id },
      include: { SalesOrderProductDetails: true },
    });

    if (!so) {
      throw new Error('Data Transaksi Penjualan tidak ditemukan');
    } else if (so.status === 'Batal') {
      throw new Error('Transaksi Penjualan telah berstatus "Batal"');
    }

    await db.$transaction(async (prisma) => {
      // update stock and costPrice of each product in details
      const updatePromises = so.SalesOrderProductDetails.map(async (d) => {
        const product = await prisma.products.findUnique({ where: { id: d.productId } });

        if (!product) {
          throw new Error('Barang yang ingin di-update tidak ditemukan');
        }

        // const totalCost = product.stock.times(product.costPrice); // total cost before substracted with purchase product
        // const updatedStock = product.stock.minus(d.quantity); // stock substracted added with purchased product qty
        // if (updatedStock.isNegative()) {
        //   throw new Error(`Transaksi tidak dapat dibatalkan karena stok ${product.name} akan minus`);
        // }

        // const updatedCostPrice = totalCost.minus(d.totalPrice).isZero()
        //   ? 0
        //   : totalCost.minus(d.totalPrice).div(updatedStock); // cost price calculated after purchase product

        // return prisma.products.update({
        //   where: { id: d.productId },
        //   data: {
        //     stock: updatedStock,
        //     costPrice: updatedCostPrice,
        //     UpdatedBy: {
        //       connect: { id: userId },
        //     },
        //   },
        // });
      });

      // await Promise.all(updatePromises);

      // set so status to 'Batal'
      await db.salesOrders.update({
        where: { id },
        data: {
          status: 'Batal',
          UpdatedBy: {
            connect: { id: userId },
          },
        },
      });
    });

    return NextResponse.json({ message: 'Transaksi Penjualan berhasil dibatalkan' }, { status: 200 });
  } catch (e: any) {
    if (e.message.includes('Transaksi Penjualan telah berstatus "Batal"')) {
      return NextResponse.json({ message: e.message }, { status: 403 }); // forbidden
    }
    if (e.message.includes('tidak ditemukan')) {
      return NextResponse.json({ message: e.message }, { status: 404 }); 
    }
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
