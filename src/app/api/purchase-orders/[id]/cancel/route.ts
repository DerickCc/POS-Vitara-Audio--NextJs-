import { checkForRelatedRecords } from '@/utils/backend-helper-function';
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
      select: {
        progressStatus: true,
        createdAt: true,
        supplierId: true,
        appliedReceivables: true,
        PurchaseOrderDetails: {
          select: {
            productId: true,
            Product: {
              select: {
                name: true,
                stock: true,
                costPrice: true,
              }
            },
            quantity: true,
            totalPrice: true,
          }
        }
      }
    });

    if (!po) {
      throw new Error('Data Transaksi Pembelian tidak ditemukan');
    } else if (po.progressStatus !== 'Selesai') {
      throw new Error('Hanya Transaksi Pembelian berstatus "Selesai" yang dapat dibatalkan');
    }

    await db.$transaction(async (prisma) => {
      const cancelledProducts = po.PurchaseOrderDetails.map((d) => d.productId);

      const entities = [
        {
          entity: 'purchaseOrders',
          errorMessage:
            'Transaksi tidak dapat dibatalkan karena telah ada pembelian terkait salah satu barang dari transaksi pembelian yang ingin dibatalkan.',
          relationPath: 'PurchaseOrderDetails',
        },
        {
          entity: 'salesOrders',
          errorMessage:
            'Transaksi tidak dapat dibatalkan karena telah ada penjualan terkait salah satu barang dari transaksi pembelian yang ingin dibatalkan.',
          relationPath: 'SalesOrderProductDetails',
        },
        {
          entity: 'purchaseReturns',
          errorMessage:
            'Transaksi tidak dapat dibatalkan karena telah ada retur pembelian terkait salah satu barang dari transaksi pembelian yang ingin dibatalkan.',
          relationPath: 'PurchaseReturnDetails',
          additionalPath: 'PurchaseOrderDetail',
        },
        {
          entity: 'salesReturns',
          errorMessage:
            'Transaksi tidak dapat dibatalkan karena telah ada retur penjualan terkait salah satu barang dari transaksi pembelian yang ingin dibatalkan.',
          relationPath: 'SalesReturnProductDetails',
          additionalPath: 'SalesOrderProductDetail',
        },
      ];

      // check if there is transaction or return that was created after the canceled purchase order, is not 'batal', and contains the cancelled products
      await Promise.all(
        entities.map(({ entity, errorMessage, relationPath, additionalPath }) =>
          checkForRelatedRecords(
            entity as any,
            cancelledProducts,
            po.createdAt,
            errorMessage,
            relationPath,
            additionalPath
          )
        )
      );

      // update stock and costPrice of each product in details
      const adjustProductPromises = po.PurchaseOrderDetails.map(async (d) => {
        // total cost of product in db rn
        const existingTotalCost = d.Product.stock.times(d.Product.costPrice);

        // stock substracted added with purchased product qty
        const updatedStock = d.Product.stock.minus(d.quantity);

        if (updatedStock.isNegative()) {
          throw new Error(`Transaksi tidak dapat dibatalkan karena stok ${d.Product.name} akan minus`);
        }

        const updatedCostPrice = existingTotalCost.minus(d.totalPrice).isZero() || updatedStock.isZero()
          ? 0
          : existingTotalCost.minus(d.totalPrice).div(updatedStock).round(); // cost price calculated after cancel purchase product

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

      const updatePo = db.purchaseOrders.update({
        where: { id },
        data: {
          progressStatus: 'Batal',
          paymentStatus: 'Batal',
          UpdatedBy: {
            connect: { id: userId },
          },
        },
      });

      const deletePoPaymentHistories = prisma.purchaseOrderPaymentHistories.deleteMany({
        where: { poId: id },
      });

      const promises = [
        ...adjustProductPromises,
        updatePo,
        deletePoPaymentHistories, 
      ];

      if (po.appliedReceivables.isPositive()) {
        promises.push(
          db.suppliers.update({
            where: { id: po.supplierId },
            data: {
              receivables: { increment: po.appliedReceivables },
            }
          }) as any
        )
      }

      await Promise.all(promises);
    });

    return NextResponse.json({ message: 'Transaksi Pembelian berhasil dibatalkan' }, { status: 200 });
  } catch (e: any) {
    const errorResponses = [
      { match: 'Hanya Transaksi Pembelian berstatus "Selesai" yang dapat dibatalkan', status: 403 },
      { match: 'tidak ditemukan', status: 404 },
      { match: 'akan minus', status: 422 },
      { match: 'tidak dapat dibatalkan', status: 409 },
    ];

    for (const { match, status } of errorResponses ) {
      if (e.message.includes(match)) {
        return NextResponse.json({ message: e.message }, { status });
      }
    }

    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
