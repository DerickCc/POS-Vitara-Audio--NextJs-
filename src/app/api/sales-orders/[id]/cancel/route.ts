import { checkForRelatedRecords } from '@/utils/backend-helper-function';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Decimal } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server';

// CancelSalesOrder
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session.id || session.role !== 'Admin') {
    return NextResponse.json(
      { message: 'Unauthorized, mohon melakukan login ulang', result: null, recordsTotal: 0 },
      { status: 401 }
    );
  }

  const { id } = params;

  try {
    const userId = session.id;

    const so = await db.salesOrders.findUnique({
      where: { id },
      select: {
        progressStatus: true,
        createdAt: true,
        SalesOrderProductDetails: {
          select: {
            productId: true,
            quantity: true,
          },
        },
      },
    });

    if (!so) {
      throw new Error('Data Transaksi Penjualan tidak ditemukan');
    } else if (so.progressStatus === 'Batal') {
      throw new Error('Transaksi Penjualan telah berstatus "Batal"');
    }

    await db.$transaction(async (prisma) => {
      const cancelledProducts = so.SalesOrderProductDetails.map((d) => d.productId);

      const entities = [
        {
          entity: 'purchaseOrders',
          errorMessage:
            'Transaksi tidak dapat dibatalkan karena telah ada pembelian terkait salah satu barang dari transaksi penjualan yang ingin dibatalkan.',
          relationPath: 'PurchaseOrderDetails',
        },
        {
          entity: 'salesOrders',
          errorMessage:
            'Transaksi tidak dapat dibatalkan karena telah ada penjualan terkait salah satu barang dari transaksi penjualan yang ingin dibatalkan.',
          relationPath: 'SalesOrderProductDetails',
        },
        {
          entity: 'purchaseReturns',
          errorMessage:
            'Transaksi tidak dapat dibatalkan karena telah ada retur pembelian terkait salah satu barang dari transaksi penjualan yang ingin dibatalkan.',
          relationPath: 'PurchaseReturnDetails',
          additionalPath: 'PurchaseOrderDetail',
        },
        {
          entity: 'salesReturns',
          errorMessage:
            'Transaksi tidak dapat dibatalkan karena telah ada retur penjualan terkait salah satu barang dari transaksi penjualan yang ingin dibatalkan.',
          relationPath: 'SalesReturnProductDetails',
          additionalPath: 'SalesOrderProductDetail',
        },
      ];

      // check if there is transaction or return that was created after the canceled purchase return, is not 'batal', and contains the cancelled products
      await Promise.all(
        entities.map(({ entity, errorMessage, relationPath, additionalPath }) =>
          checkForRelatedRecords(
            entity as any,
            cancelledProducts,
            so.createdAt,
            errorMessage,
            relationPath,
            additionalPath
          )
        )
      );

      // update stock of each product in details
      const adjustProductPromises = so.SalesOrderProductDetails.map(({ productId, quantity }) =>
        prisma.products.update({
          where: { id: productId },
          data: {
            stock: { increment: new Decimal(quantity) },
            UpdatedBy: { connect: { id: userId } },
          },
        })
      );

      const updateSo = prisma.salesOrders.update({
        where: { id },
        data: {
          progressStatus: 'Batal',
          paymentStatus: 'Batal',
          UpdatedBy: {
            connect: { id: userId },
          },
        },
      });

      const deleteSoPaymentHistories = prisma.salesOrderPaymentHistories.deleteMany({
        where: { soId: id },
      });

      await Promise.all([...adjustProductPromises, updateSo, deleteSoPaymentHistories]);
    });

    return NextResponse.json({ message: 'Transaksi Penjualan berhasil dibatalkan' }, { status: 200 });
  } catch (e: any) {
    const errorResponses = [
      { match: 'Transaksi Penjualan telah berstatus "Batal"', status: 403 },
      { match: 'tidak ditemukan', status: 404 },
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
