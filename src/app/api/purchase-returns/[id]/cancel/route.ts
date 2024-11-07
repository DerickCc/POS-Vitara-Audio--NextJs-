import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { NextResponse } from 'next/server';

// CancelPurchaseReturn
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session || session.role !== 'Admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const userId = session.id;

    const pr = await db.purchaseReturns.findUnique({
      where: { id },
      include: { PurchaseReturnDetails: true },
    });

    if (!pr) {
      throw new Error('Data Retur Pembelian tidak ditemukan');
    }

    // await db.$transaction(async (prisma) => {
    //   const cancelledProducts = pr.PurchaseReturnDetails.map((d) => d.productId);

    //   // update stock and costPrice of each product in details
    //   const adjustProductPromises = pr.PurchaseReturnDetails.map(async (d) => {
    //     // Fetch all purchase returns that were created after the canceled sales order, is not 'batal', and contains the cancelled products
    //     const affectedPurchaseOrders = await prisma.purchaseOrders.findMany({
    //       where: {
    //         PurchaseOrderDetails: {
    //           some: {
    //             productId: { in: cancelledProducts },
    //           },
    //         },
    //         createdAt: { gt: pr.createdAt },
    //         status: { not: 'Batal' },
    //       },
    //       orderBy: {
    //         createdAt: 'asc',
    //       },
    //     });

    //     if (affectedPurchaseOrders.length > 0) {
    //       throw new Error(
    //         'Transaksi ini tidak dapat dibatalkan karena telah ada pembelian terkait salah satu barang dari transaksi pembelian yang ingin dibatalkan.'
    //       );
    //     }

    //     // Fetch all sales orders that were created after the canceled sales order
    //     const affectedSalesOrders = await prisma.salesOrders.findMany({
    //       where: {
    //         SalesOrderProductDetails: {
    //           some: {
    //             productId: { in: cancelledProducts },
    //           },
    //         },
    //         createdAt: { gt: po.createdAt },
    //         status: { not: 'Batal' },
    //       },
    //       orderBy: {
    //         createdAt: 'asc',
    //       },
    //     });

    //     if (affectedSalesOrders.length > 0) {
    //       throw new Error(
    //         'Transaksi ini tidak dapat dibatalkan karena telah ada penjualan terkait salah satu barang dari transaksi pembelian yang ingin dibatalkan.'
    //       );
    //     }

    //     const product = await prisma.products.findUnique({ where: { id: d.productId } });

    //     if (!product) {
    //       throw new Error('Barang yang ingin di-update tidak ditemukan');
    //     }

    //     // total cost of product in db rn
    //     const existingTotalCost = product.stock.times(product.costPrice);

    //     // stock substracted added with purchased product qty
    //     const updatedStock = product.stock.minus(d.quantity);

    //     if (updatedStock.isNegative()) {
    //       throw new Error(`Transaksi tidak dapat dibatalkan karena stok ${product.name} akan minus`);
    //     }

    //     const updatedCostPrice = existingTotalCost.minus(d.totalPrice).isZero()
    //       ? 0
    //       : existingTotalCost.minus(d.totalPrice).div(updatedStock); // cost price calculated after cancel purchase product

    //     return prisma.products.update({
    //       where: { id: d.productId },
    //       data: {
    //         stock: updatedStock,
    //         costPrice: updatedCostPrice,
    //         UpdatedBy: {
    //           connect: { id: userId },
    //         },
    //       },
    //     });
    //   });

    //   await Promise.all(adjustProductPromises);

    //   // set po status to 'Batal'
    //   await db.purchaseOrders.update({
    //     where: { id },
    //     data: {
    //       status: 'Batal',
    //       UpdatedBy: {
    //         connect: { id: userId },
    //       },
    //     },
    //   });
    // });

    return NextResponse.json({ message: 'Retur Pembelian berhasil dibatalkan' }, { status: 200 });
  } catch (e: any) {
    if (e.message.includes('tidak ditemukan')) {
      return NextResponse.json({ message: e.message }, { status: 404 }); // forbidden
    }
    if (e.message.includes('akan minus')) {
      return NextResponse.json({ message: e.message }, { status: 422 }); // unprocessable entity
    }
    if (e.message.includes('tidak dapat dibatalkan')) {
      return NextResponse.json({ message: e.message }, { status: 409 }); // conflict
    }
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
