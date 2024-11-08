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

  const { id } = params;

  try {
    const userId = session.id;

    const pr = await db.purchaseReturns.findUnique({
      where: { id },
      include: { PurchaseReturnDetails: true, PurchaseOrder: true },
    });

    if (!pr) throw new Error('Data Retur Pembelian tidak ditemukan');

    await db.$transaction(async (prisma) => {
      if (pr.status !== 'Dalam Proses' && pr.status !== 'Selesai') {
        throw new Error('Hanya Retur Pembelian berstatus "Dalam Proses" dan "Selesai" yang dapat dibatalkan');
      }

      const updatePromises: Promise<any>[] = [];
      let grandTotal = new Decimal(0);
      // stock adjustment if
      // - dalam proses
      // - selesai && ('Pengembalian Dana' || 'Piutang')
      const isStockAdjustmentNeeded =
        pr.status === 'Dalam Proses' ||
        (pr.status === 'Selesai' && (pr.returnType === 'Pengembalian Dana' || pr.returnType === 'Piutang'));

      for (const prd of pr.PurchaseReturnDetails) {
        const poDetail = await prisma.purchaseOrderDetails.findUniqueOrThrow({
          where: { id: prd.podId },
          select: {
            id: true,
            Product: {
              select: { id: true },
            },
          },
        });

        // update po detail's returned qty
        updatePromises.push(
          prisma.purchaseOrderDetails.update({
            where: { id: poDetail.id },
            data: {
              returnedQuantity: { decrement: new Decimal(prd.returnQuantity) },
              UpdatedBy: {
                connect: { id: userId },
              },
            },
          })
        );

        if (isStockAdjustmentNeeded) {
          // update product stock
          updatePromises.push(
            prisma.products.update({
              where: { id: poDetail.Product.id },
              data: {
                stock: { increment: new Decimal(prd.returnQuantity) },
                UpdatedBy: {
                  connect: { id: userId },
                },
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
          db.suppliers.update({
            where: { id: pr.PurchaseOrder.supplierId },
            data: { receivables: { decrement: grandTotal } },
          })
        );
      }
      await Promise.all(updatePromises);

      // set pr status to 'Batal'
      await db.purchaseReturns.update({
        where: { id },
        data: {
          status: 'Batal',
          UpdatedBy: {
            connect: { id: userId },
          },
        },
      });
    });

    return NextResponse.json({ message: 'Retur Pembelian berhasil dibatalkan' }, { status: 200 });
  } catch (e: any) {
    if (e.message.includes('Hanya Retur Pembelian berstatus "Dalam Proses" dan "Selesai" yang dapat dibatalkan')) {
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
