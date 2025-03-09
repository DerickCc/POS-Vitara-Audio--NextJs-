import { checkForRelatedRecords } from '@/utils/backend-helper-function';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Decimal } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server';

// CancelSalesReturn
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session || session.role !== 'Admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!session.id) {
    return NextResponse.json(
      { message: 'Unauthorized, mohon melakukan login ulang' },
      { status: 401 }
    );
  }

  const { id } = params;

  try {
    const userId = session.id;

    const sr = await db.salesReturns.findUnique({
      where: { id },
      select: {
        createdAt: true,
        status: true,
        SalesReturnProductDetails: {
          select: {
            sopdId: true,
            returnQuantity: true,
            returnPrice: true,
            SalesOrderProductDetail: {
              select: { id: true, productId: true }
            }
          }
        },
      },
    });

    if (!sr) throw new Error('Data Retur Penjualan tidak ditemukan');

    await db.$transaction(async (prisma) => {
      if (sr.status !== 'Selesai') {
        throw new Error('Hanya Retur Penjualan berstatus "Selesai" yang dapat dibatalkan');
      }

      const cancelledProducts = sr.SalesReturnProductDetails.map((d) => d.SalesOrderProductDetail.productId);

      const entities = [
        {
          entity: 'purchaseOrders',
          errorMessage:
            'Retur tidak dapat dibatalkan karena telah ada pembelian terkait salah satu barang dari retur penjualan yang ingin dibatalkan.',
          relationPath: 'PurchaseOrderDetails',
        },
        {
          entity: 'salesOrders',
          errorMessage:
            'Retur tidak dapat dibatalkan karena telah ada penjualan terkait salah satu barang dari retur penjualan yang ingin dibatalkan.',
          relationPath: 'SalesOrderProductDetails',
        },
        {
          entity: 'purchaseReturns',
          errorMessage:
            'Retur tidak dapat dibatalkan karena telah ada retur pembelian terkait salah satu barang dari retur penjualan yang ingin dibatalkan.',
          relationPath: 'PurchaseReturnDetails',
          additionalPath: 'PurchaseOrderDetail',
        },
        {
          entity: 'salesReturns',
          errorMessage:
            'Retur tidak dapat dibatalkan karena telah ada retur penjualan terkait salah satu barang dari retur penjualan yang ingin dibatalkan.',
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
            sr.createdAt,
            errorMessage,
            relationPath,
            additionalPath
          )
        )
      );

      const updatePromises: Promise<any>[] = [];

      for (const srpd of sr.SalesReturnProductDetails) {
        // update sop detail's returned qty
        updatePromises.push(
          prisma.salesOrderProductDetails.update({
            where: { id: srpd.SalesOrderProductDetail.id },
            data: {
              returnedQuantity: { decrement: new Decimal(srpd.returnQuantity) },
              UpdatedBy: {
                connect: { id: userId },
              },
            },
          })
        );

        // update product stock
        updatePromises.push(
          prisma.products.update({
            where: { id: srpd.SalesOrderProductDetail.productId },
            data: {
              stock: { increment: new Decimal(srpd.returnQuantity) },
              UpdatedBy: {
                connect: { id: userId },
              },
            },
          })
        );
      }
      await Promise.all(updatePromises);

      // set pr status to 'Batal'
      await db.salesReturns.update({
        where: { id },
        data: {
          status: 'Batal',
          UpdatedBy: {
            connect: { id: userId },
          },
        },
      });
    });

    return NextResponse.json({ message: 'Retur penjualan berhasil dibatalkan' }, { status: 200 });
  } catch (e: any) {
    const errorResponses = [
      { match: 'Hanya Retur penjualan berstatus "Dalam Proses" dan "Selesai" yang dapat dibatalkan', status: 403 },
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
