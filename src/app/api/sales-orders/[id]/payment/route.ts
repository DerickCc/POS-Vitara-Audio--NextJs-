import { SalesOrderPaymentModel } from '@/models/sales-order';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Decimal } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server';

// UpdateSoPayment
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized', result: null }, { status: 401 });
  }

  const { id } = params;

  const data: SalesOrderPaymentModel = await request.json();

  try {
    const userId = session.id;

    const so = await db.salesOrders.findUnique({
      where: { id },
      select: {
        status: true,
        grandTotal: true,
        PaymentHistories: {
          select: { amount: true },
        },
      },
    });

    if (!so) {
      return NextResponse.json({ message: 'Transaksi Penjualan tidak ditemukan' }, { status: 404 });
    }

    const paidAmount = so.PaymentHistories.reduce((acc, p) => acc.plus(p.amount), new Decimal(0));
    const unpaidAmount = so.grandTotal.minus(paidAmount);

    if (new Decimal(data.paymentAmount).greaterThan(unpaidAmount)) {
      return NextResponse.json({ message: 'Biaya yang dibayarkan lebih dari yang seharusnya' }, { status: 404 });
    }

    await db.$transaction(async (prisma) => {
      await prisma.paymentHistories.create({
        data: {
          SalesOrder: {
            connect: { id },
          },
          paymentMethod: data.paymentMethod,
          amount: data.paymentAmount,
          CreatedBy: {
            connect: { id: userId },
          },
        },
      });

      if (new Decimal(data.paymentAmount).equals(unpaidAmount)) {
        await prisma.salesOrders.update({
          where: { id },
          data: {
            status: 'Lunas',
          },
        });
      }
    });

    return NextResponse.json({ message: 'Pembayaran berhasil diupdate' }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
