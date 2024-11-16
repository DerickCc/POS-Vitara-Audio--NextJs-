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
      include: { PurchaseOrderDetails: true },
    });

    if (!po) {
      throw new Error('Data Transaksi Pembelian tidak ditemukan');
    } else if (po.status !== 'Selesai') {
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
      for (const { entity, errorMessage, relationPath, additionalPath } of entities) {
        await checkForRelatedRecords(
          entity as any,
          cancelledProducts,
          po.createdAt,
          errorMessage,
          relationPath,
          additionalPath
        );
      }

      // update stock and costPrice of each product in details
      const adjustProductPromises = po.PurchaseOrderDetails.map(async (d) => {
        const product = await prisma.products.findUnique({ where: { id: d.productId } });

        if (!product) {
          throw new Error('Barang yang ingin di-update tidak ditemukan');
        }

        // total cost of product in db rn
        const existingTotalCost = product.stock.times(product.costPrice);

        // stock substracted added with purchased product qty
        const updatedStock = product.stock.minus(d.quantity);

        if (updatedStock.isNegative()) {
          throw new Error(`Transaksi tidak dapat dibatalkan karena stok ${product.name} akan minus`);
        }

        const updatedCostPrice = existingTotalCost.minus(d.totalPrice).isZero()
          ? 0
          : existingTotalCost.minus(d.totalPrice).div(updatedStock); // cost price calculated after cancel purchase product

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

      await db.suppliers.update({
        where: { id: po.supplierId },
        data: {
          receivables: { increment: po.appliedReceivables },
        }
      });

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
      return NextResponse.json({ message: e.message }, { status: 403 }); // forbidden
    }
    if (e.message.includes('tidak ditemukan')) {
      return NextResponse.json({ message: e.message }, { status: 404 });
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
