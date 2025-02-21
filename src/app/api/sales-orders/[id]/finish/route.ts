import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { NextResponse } from 'next/server';

// FinishSalesOrder
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json({ message: 'Unauthorized, mohon melakukan login ulang' }, { status: 401 });
  }

  const { id } = params;

  try {
    const userId = session.id;

    await db.$transaction(async (prisma) => {
      const so = await prisma.salesOrders.findUnique({
        where: { id },
        select: {
          progressStatus: true,
          SalesOrderProductDetails: {
            select: {
              id: true,
              productId: true,
              quantity: true,
              costPrice: true,
              Product: {
                select: {
                  name: true,
                  stock: true,
                  uom: true,
                  costPrice: true,
                },
              },
            },
          },
        },
      });

      if (!so) {
        throw new Error('Data Transaksi Penjualan tidak ditemukan');
      } else if (so.progressStatus !== 'Belum Dikerjakan') {
        throw new Error('Hanya Transaksi Penjualan berstatus "Belum Dikerjakan" yang dapat diselesaikan');
      }

      // Validate stock for each product
      const insufficientStock = so.SalesOrderProductDetails.filter((d) => d.Product.stock.lessThan(d.quantity));

      if (insufficientStock.length > 0) {
        const errorMessage = insufficientStock
          .map(
            (d) =>
              `${d.Product.name} yang diperlukan sebanyak ${d.quantity} ${d.Product.uom}, tetapi tersisa ${d.Product.stock} ${d.Product.uom}.`
          )
          .join('\n\n');

        throw new Error(`Gagal diselesaikan \n\n${errorMessage}`);
      }

      // update stock of each product in details
      let updatePromises: any = [];
      so.SalesOrderProductDetails.forEach(async (d) => {
        if (d.costPrice.isZero()) {
          updatePromises.push(
            prisma.salesOrderProductDetails.update({
              where: { id: d.id },
              data: {
                costPrice: d.Product.costPrice,
              },
            })
          );
        }

        updatePromises.push(
          prisma.products.update({
            where: { id: d.productId },
            data: {
              stock: { decrement: d.quantity },
              ...(d.Product.stock.minus(d.quantity).isZero() ? { costPrice: 0 } : {}), // reset cost price if qty 0 after reduction
              UpdatedBy: {
                connect: { id: userId },
              },
            },
          })
        );
      });

      await Promise.all(updatePromises);

      // set po status to 'Selesai'
      await prisma.salesOrders.update({
        where: { id },
        data: {
          progressStatus: 'Selesai',
          UpdatedBy: {
            connect: { id: userId },
          },
        },
      });
    });

    return NextResponse.json({ message: 'Transaksi Penjualan Berhasil Diselesaikan' }, { status: 200 });
  } catch (e: any) {
    if (e.message.includes('Hanya Transaksi Penjualan berstatus "Belum Dikerjakan" yang dapat diselesaikan')) {
      return NextResponse.json({ message: e.message }, { status: 403 });
    }
    if (e.message.includes('tidak ditemukan')) {
      return NextResponse.json({ message: e.message }, { status: 404 });
    }
    if (e.message.includes('yang diperlukan sebanyak')) {
      return NextResponse.json({ message: e.message }, { status: 422 }); // Unprocessable entity
    }
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
