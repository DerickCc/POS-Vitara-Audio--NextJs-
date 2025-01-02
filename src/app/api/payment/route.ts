import { PaymentSchema } from "@/models/payment-history.model";
import { db } from "@/utils/prisma";
import { getSession } from "@/utils/sessionlib";
import { Decimal } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";

// UpdatePayment
export async function PUT(request: Request) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json({ message: "Unauthorized, mohon melakukan login ulang" }, { status: 401 });
  }

  const validationRes = PaymentSchema.safeParse(await request.json());

  // if validation failed
  if (!validationRes.success) {
    return NextResponse.json(
      {
        message: "Terdapat kesalahan pada data yang dikirim",
        error: validationRes.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const data = validationRes.data;

  try {
    const userId = session.id;

    let trx: any;

    if (data.type === "po") {
      trx = await db.purchaseOrders.findUnique({
        where: { id: data.id },
        select: {
          status: true,
          grandTotal: true,
          PurchaseOrderPaymentHistories: {
            select: { amount: true },
          },
        },
      });
    } else if (data.type === "so") {
      trx = await db.salesOrders.findUnique({
        where: { id: data.id },
        select: {
          status: true,
          grandTotal: true,
          SalesOrderPaymentHistories: {
            select: { amount: true },
          },
        },
      });
    }

    if (!trx) {
      return NextResponse.json({ message: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    // type-type nya 
    const paymentHistories = data.type === "po" ? "PurchaseOrderPaymentHistories" : "SalesOrderPaymentHistories";

    const paidAmount = trx[paymentHistories].reduce(
      (acc: Decimal, p: { amount: Decimal }) => acc.plus(p.amount),
      new Decimal(0)
    );
    const unpaidAmount = trx.grandTotal.minus(paidAmount);

    if (new Decimal(data.paymentAmount).greaterThan(unpaidAmount)) {
      return NextResponse.json({ message: "Biaya yang dibayarkan lebih dari yang seharusnya" }, { status: 404 });
    }

    await db.$transaction(async (prisma) => {
      await prisma.salesOrderPaymentHistories.create({ //
        data: {
          SalesOrder: { //
            connect: { id: data.id },
          },
          paymentMethod: data.paymentMethod,
          amount: data.paymentAmount,
          CreatedBy: {
            connect: { id: userId },
          },
        },
      });

      if (new Decimal(data.paymentAmount).equals(unpaidAmount)) {
        await prisma.salesOrders.update({ //
          where: { id: data.id },
          data: {
            status: "Lunas",
          },
        });
      }
    });

    return NextResponse.json({ message: "Pembayaran berhasil diupdate" }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ message: "Internal Server Error: " + e }, { status: 500 });
  }
}
