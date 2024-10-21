import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Decimal } from '@prisma/client/runtime/library';
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
      const cancelledProducts = so.SalesOrderProductDetails.map((d) => d.productId);

      // Fetch all purchase orders that were created after the canceled sales order, is not 'batal', and contains the cancelled products
      const affectedPurchaseOrders = await prisma.purchaseOrders.findMany({
        where: {
          PurchaseOrderDetails: {
            some: {
              productId: { in: cancelledProducts },
            },
          },
          createdAt: { gt: so.createdAt },
          status: { not: 'Batal' },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      if (affectedPurchaseOrders.length > 0) {
        throw new Error(
          'Transaksi ini tidak dapat dibatalkan karena telah ada pembelian terkait salah satu barang dari transaksi penjualan yang ingin dibatalkan.'
        );
      }

      // Fetch all sales orders that were created after the canceled sales order
      const affectedSalesOrders = await prisma.salesOrders.findMany({
        where: {
          SalesOrderProductDetails: {
            some: {
              productId: { in: cancelledProducts },
            }
          },
          createdAt: { gt: so.createdAt },
          status: { not: 'Batal' },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      if (affectedSalesOrders.length > 0) {
        throw new Error(
          'Transaksi ini tidak dapat dibatalkan karena telah ada penjualan terkait salah satu barang dari transaksi penjualan yang ingin dibatalkan.'
        );
      }

      // update stock and costPrice of each product in details
      const adjustProductPromises = so.SalesOrderProductDetails.map(async (d) => {
        const product = await prisma.products.findUnique({ where: { id: d.productId } });

        if (!product) {
          throw new Error('Barang yang ingin di-update tidak ditemukan');
        }

        // total cost of product in db rn
        const existingTotalCost = product.stock.times(product.costPrice);

        // total cost of the cancelled product
        const cancelledTotalCost = d.quantity.times(d.costPrice);

        const updatedTotalCost = existingTotalCost.plus(cancelledTotalCost);

        // Recalculate stock by adding back the quantity sold
        const updatedStock = product.stock.plus(d.quantity);

        const updatedCostPrice = updatedTotalCost.div(updatedStock); // cost price calculated

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

      await Promise.all(adjustProductPromises);

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
    if (e.message.includes('tidak dapat dibatalkan')) {
      return NextResponse.json({ message: e.message }, { status: 409 }); // conflict
    }
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
