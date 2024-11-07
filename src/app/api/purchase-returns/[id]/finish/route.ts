import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { NextResponse } from 'next/server';

// FinishPurchaseReturn
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json(
      { message: 'Unauthorized, mohon melakukan login ulang', result: null, recordsTotal: 0 },
      { status: 401 }
    );
  }

  const { id } = params;

  try {
    const userId = session.id;

    await db.$transaction(async (prisma) => {
      const pr = await prisma.purchaseReturns.findUnique({
        where: { id },
        select: {
          status: true,
          returnType: true,
          PurchaseReturnDetails: {
            select: {
              returnQuantity: true,
              PurchaseOrderDetail: {
                select: {
                  Product: true,
                },
              },
            },
          },
        },
      });

      if (!pr) {
        throw new Error('Data Retur Pembelian tidak ditemukan');
      } else if (pr.status !== 'Dalam Proses') {
        throw new Error('Hanya Retur Pembelian berstatus "Dalam Proses" yang dapat diselesaikan');
      }

      if (pr.returnType === 'Penggantian Barang') {
        const updatePromises = pr.PurchaseReturnDetails.map(async (prd) => {
          const productId = prd.PurchaseOrderDetail.Product.id;

          return prisma.products.update({
            where: { id: productId },
            data: {
              stock: { increment: prd.returnQuantity },
            },
          });
        });

        await Promise.all(updatePromises);
      }

      
      // only update status for returnType 'Pengembalian Dana'
      // set pr status to 'Selesai'
      await prisma.purchaseReturns.update({
        where: { id },
        data: {
          status: 'Selesai',
          UpdatedBy: {
            connect: { id: userId },
          },
        },
      });
    });

    return NextResponse.json({ message: 'Retur Pembelian Berhasil Diselesaikan' }, { status: 200 });
  } catch (e: any) {
    if (e.message.includes('Hanya Retur Pembelian berstatus "Dalam Proses" yang dapat diselesaikan')) {
      return NextResponse.json({ message: e.message }, { status: 403 });
    }
    if (e.message.includes('tidak ditemukan')) {
      return NextResponse.json({ message: e.message }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
