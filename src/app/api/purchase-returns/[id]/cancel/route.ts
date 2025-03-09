import { checkForRelatedRecords } from '@/utils/backend-helper-function';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Decimal } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server';

// CancelPurchaseReturn
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session || session.role !== 'Admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!session.id) {
    return NextResponse.json({ message: 'Unauthorized, mohon melakukan login ulang' }, { status: 401 });
  }

  const { id } = params;

  try {
    const userId = session.id;

    const pr = await db.purchaseReturns.findUnique({
      where: { id },
      select: {
        returnType: true,
        createdAt: true,
        status: true,
        PurchaseReturnDetails: {
          select: {
            podId: true,
            returnQuantity: true,
            returnPrice: true,
            PurchaseOrderDetail: {
              select: { id: true, productId: true },
            },
          },
        },
        PurchaseOrder: {
          select: { supplierId: true },
        },
      },
    });

    if (!pr) throw new Error('Data Retur Pembelian tidak ditemukan');

    await db.$transaction(async (prisma) => {
      if (pr.status !== 'Dalam Proses' && pr.status !== 'Selesai') {
        throw new Error('Hanya Retur Pembelian berstatus "Dalam Proses" dan "Selesai" yang dapat dibatalkan');
      }

      const cancelledProducts = pr.PurchaseReturnDetails.map((d) => d.PurchaseOrderDetail.productId);

      const entities = [
        {
          entity: 'purchaseOrders',
          errorMessage:
            'Retur tidak dapat dibatalkan karena telah ada pembelian terkait salah satu barang dari retur pembelian yang ingin dibatalkan.',
          relationPath: 'PurchaseOrderDetails',
        },
        {
          entity: 'salesOrders',
          errorMessage:
            'Retur tidak dapat dibatalkan karena telah ada penjualan terkait salah satu barang dari retur pembelian yang ingin dibatalkan.',
          relationPath: 'SalesOrderProductDetails',
        },
        {
          entity: 'purchaseReturns',
          errorMessage:
            'Retur tidak dapat dibatalkan karena telah ada retur pembelian terkait salah satu barang dari retur pembelian yang ingin dibatalkan.',
          relationPath: 'PurchaseReturnDetails',
          additionalPath: 'PurchaseOrderDetail',
        },
        {
          entity: 'salesReturns',
          errorMessage:
            'Retur tidak dapat dibatalkan karena telah ada retur penjualan terkait salah satu barang dari retur pembelian yang ingin dibatalkan.',
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
            pr.createdAt,
            errorMessage,
            relationPath,
            additionalPath
          )
        )
      );

      // stock adjustment if
      // - dalam proses
      // - selesai && ('Pengembalian Dana' || 'Piutang')
      const isStockAdjustmentNeeded =
        pr.status === 'Dalam Proses' ||
        (pr.status === 'Selesai' && (pr.returnType === 'Pengembalian Dana' || pr.returnType === 'Piutang'));

      const updatePromises: Promise<any>[] = [];
      let grandTotal = new Decimal(0);

      for (const prd of pr.PurchaseReturnDetails) {
        // update po detail's returned qty
        updatePromises.push(
          prisma.purchaseOrderDetails.update({
            where: { id: prd.PurchaseOrderDetail.id },
            data: {
              returnedQuantity: { decrement: new Decimal(prd.returnQuantity) },
              UpdatedBy: { connect: { id: userId } },
            },
          })
        );

        if (isStockAdjustmentNeeded) {
          // update product stock
          updatePromises.push(
            prisma.products.update({
              where: { id: prd.PurchaseOrderDetail.productId },
              data: {
                stock: { increment: new Decimal(prd.returnQuantity) },
                UpdatedBy: { connect: { id: userId } },
              },
            })
          );
        }

        // Calculate total amount for 'Piutang' only
        if (pr.returnType === 'Piutang') {
          grandTotal = grandTotal.plus(prd.returnQuantity.times(prd.returnPrice));
        }
      }

      // update supplier's receivable if returnType 'Piutang'
      if (pr.returnType === 'Piutang') {
        updatePromises.push(
          prisma.suppliers.update({
            where: { id: pr.PurchaseOrder.supplierId },
            data: { receivables: { decrement: grandTotal } },
          })
        );
      }
      await Promise.all(updatePromises);

      // set pr status to 'Batal'
      await prisma.purchaseReturns.update({
        where: { id },
        data: {
          status: 'Batal',
          UpdatedBy: { connect: { id: userId } },
        },
      });
    });

    return NextResponse.json({ message: 'Retur Pembelian berhasil dibatalkan' }, { status: 200 });
  } catch (e: any) {
    const errorResponses = [
      { match: 'Hanya Retur Pembelian berstatus "Dalam Proses" dan "Selesai" yang dapat dibatalkan', status: 403 },
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
