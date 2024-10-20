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
      // update stock and costPrice of each product in details
      const adjustProductPromises = so.SalesOrderProductDetails.map(async (d) => {
        const product = await prisma.products.findUnique({ where: { id: d.productId } });

        if (!product) {
          throw new Error('Barang yang ingin di-update tidak ditemukan');
        }

        // total cost rn in db
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

      const cancelledProducts = so.SalesOrderProductDetails.map((d) => d.productId);

      // Fetch all purchase orders detail of product (in the sales order) that were created after the canceled sales order
      const affectedPoDetails = await prisma.purchaseOrderDetails.findMany({
        where: {
          productId: { in: cancelledProducts },
          createdAt: { gt: so.createdAt },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      // Fetch all sales orders detail of product (in the sales order) that were created after the canceled sales order
      const affectedSoProductDetails = await prisma.salesOrderProductDetails.findMany({
        where: {
          productId: { in: cancelledProducts },
          createdAt: { gt: so.createdAt },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      // recalculate cost price to get accurate profit
      const recalculateCostPricePromises = affectedSoProductDetails.map(async (sopd) => {
        // Fetch relevant purchase orders detail for the specific product in the sales order detail
        const relevantPoDetails = affectedPoDetails.filter(
          (pod) => pod.productId === sopd.productId && pod.createdAt <= sopd.createdAt
        );

        let totalQuantity = new Decimal(0);
        let totalCost = new Decimal(0);

        relevantPoDetails.forEach((pod) => {
          totalCost = totalCost.plus(pod.quantity.times(pod.purchasePrice));
          totalQuantity = totalQuantity.plus(pod.quantity);
        });

        const adjustedCostPrice = totalQuantity.equals(0)
          ? sopd.costPrice // no purchase orders, use previous cost price
          : totalCost.div(totalQuantity);

        // Update the costPrice in the SalesOrderProductDetail
        return prisma.salesOrderProductDetails.update({
          where: { id: sopd.id },
          data: {
            costPrice: adjustedCostPrice,
          },
        });
      });

      await Promise.all(recalculateCostPricePromises);

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
