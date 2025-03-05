import { UpdatePurchaseOrderSchema } from '@/models/purchase-order.model';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Decimal } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

// GetPurchaseOrderById
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json({ message: 'Unauthorized, mohon melakukan login ulang' }, { status: 401 });
  }

  const { id } = params;

  try {
    const po = await db.purchaseOrders.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        purchaseDate: true,
        supplierId: true,
        Supplier: {
          select: { name: true, receivables: true },
        },
        remarks: true,
        totalItem: true,
        subTotal: true,
        appliedReceivables: true,
        grandTotal: true,
        progressStatus: true,
        paymentStatus: true,
        createdBy: true,
        PurchaseOrderDetails: {
          select: {
            id: true,
            poId: true,
            productId: true,
            Product: {
              select: { name: true, uom: true },
            },
            purchasePrice: true,
            quantity: true,
            totalPrice: true,
          },
        },
        PurchaseOrderPaymentHistories: {
          select: { amount: true },
        },
      },
    });

    if (!po) {
      return NextResponse.json({ message: 'Transaksi Pembelian tidak ditemukan' }, { status: 404 });
    }

    const formattedPoDetail = po.PurchaseOrderDetails.map((d) => ({
      ...d,
      productName: d.Product.name,
      uom: d.Product.uom,
      Product: undefined,
    }));

    const paidAmount = po.PurchaseOrderPaymentHistories.reduce((acc, p) => acc.plus(p.amount), new Decimal(0));

    const formattedPo = {
      ...po,
      supplierName: po.Supplier.name,
      supplierReceivable: Number(po.Supplier.receivables),
      appliedReceivables: Number(po.appliedReceivables),
      paidAmount: Number(paidAmount),
      details: formattedPoDetail,
      Supplier: undefined,
      PurchaseOrderPaymentHistories: undefined,
      PurchaseOrderDetails: undefined,
    };

    return NextResponse.json({ message: 'Success', result: formattedPo }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}

// UpdatePurchaseOrder
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json({ message: 'Unauthorized, mohon melakukan login ulang' }, { status: 401 });
  }

  const { id } = params;

  const validationRes = UpdatePurchaseOrderSchema.safeParse(await request.json());

  // if validation failed
  if (!validationRes.success) {
    return NextResponse.json(
      {
        message: 'Terdapat kesalahan pada data yang dikirim',
        error: validationRes.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const data = validationRes.data;

  try {
    const [supplier, po] = await Promise.all([
      db.suppliers.findUniqueOrThrow({
        where: { id: data.supplierId },
        select: { receivables: true },
      }),
      db.purchaseOrders.findUniqueOrThrow({
        where: { id },
        select: { appliedReceivables: true },
      }),
    ]);

    const supplierReceivables = supplier.receivables.toNumber();
    const hasBeenAppliedReceivables = po.appliedReceivables.toNumber();

    // adjustment may be + or -
    const appliedReceivablesAdjustment = data.appliedReceivables - hasBeenAppliedReceivables;

    if (appliedReceivablesAdjustment > supplierReceivables) {
      return NextResponse.json(
        { message: 'Potongan piutang melebihi piutang yang dimiliki supplier' },
        { status: 422 } // unprocessable entity
      );
    }

    const userId = session.id;

    const subTotal = data.details.reduce((acc, d) => {
      return acc + d.purchasePrice * d.quantity;
    }, 0);
    const grandTotal = subTotal - data.appliedReceivables;
    const paymentStatus = data.paidAmount === grandTotal ? 'Lunas' : 'Belum Lunas';

    await db.$transaction(
      async (prisma) => {
        await prisma.purchaseOrders.update({
          where: { id },
          data: {
            Supplier: {
              connect: { id: data.supplierId },
            },
            remarks: data.remarks,
            totalItem: data.details.length,
            subTotal,
            appliedReceivables: data.appliedReceivables,
            grandTotal,
            paymentStatus,
            UpdatedBy: {
              connect: { id: userId },
            },
          },
        });

        // Fetch existing details
        const existingDetailsIds = await prisma.purchaseOrderDetails
          .findMany({
            where: { poId: id },
            select: { id: true },
          })
          .then((res) => res.map((d) => d.id));

        const updatedDetailIds = data.details.map((d) => d.id);
        const detailIdsToDelete = existingDetailsIds.filter((id) => !updatedDetailIds.includes(id));

        // Delete details that are no longer present in the update
        if (detailIdsToDelete.length > 0) {
          await prisma.purchaseOrderDetails.deleteMany({
            where: { id: { in: detailIdsToDelete } },
          });
        }

        const updatePromises = data.details.map(async (d) => {
          return d.id
            ? // update if there is poDetail id
              prisma.purchaseOrderDetails.update({
                where: { id: d.id },
                data: {
                  Product: {
                    connect: { id: d.productId },
                  },
                  purchasePrice: d.purchasePrice,
                  quantity: d.quantity,
                  totalPrice: d.purchasePrice * d.quantity,
                  UpdatedBy: {
                    connect: { id: userId },
                  },
                },
              })
            : // create if poDetail id is null
              prisma.purchaseOrderDetails.create({
                data: {
                  PurchaseOrder: {
                    connect: { id },
                  },
                  Product: {
                    connect: { id: d.productId },
                  },
                  purchasePrice: d.purchasePrice,
                  quantity: d.quantity,
                  totalPrice: d.purchasePrice * d.quantity,
                  CreatedBy: {
                    connect: { id: userId },
                  },
                },
              });
        });

        await Promise.all(updatePromises);

        // update supplier's receivable if there is adjustment on appliedReceivables
        if (appliedReceivablesAdjustment !== 0) {
          await prisma.suppliers.update({
            where: { id: data.supplierId },
            data: {
              receivables: appliedReceivablesAdjustment > 0
                ? { decrement: appliedReceivablesAdjustment }
                : { increment: Math.abs(appliedReceivablesAdjustment) },
            },
          });
        }

        // delete all related purchaseOrderPaymentHistories
        // if paid amount higher than new grandtotal
        if (data.paidAmount > grandTotal) {
          await prisma.purchaseOrderPaymentHistories.deleteMany({
            where: { poId: id },
          });
        }
      },
      {
        maxWait: 10000, // 10 seconds max wait to connect to prisma
        timeout: 20000, // 20 seconds
      }
    );

    return NextResponse.json({ message: 'Transaksi Pembelian berhasil diupdate' }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}

// DeletePurchaseOrder
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json(
      { message: 'Unauthorized, mohon melakukan login ulang', result: null, recordsTotal: 0 },
      { status: 401 }
    );
  }

  const { id } = params;

  try {
    const po = await db.purchaseOrders.findUnique({
      where: { id },
      select: {
        progressStatus: true,
        supplierId: true,
        appliedReceivables: true,
      },
    });

    if (!po) {
      return NextResponse.json({ message: 'Transaksi Pembelian tidak ditemukan' }, { status: 404 });
    } else if (po.progressStatus !== 'Dalam Proses') {
      return NextResponse.json(
        { message: 'Hanya Transaksi Pembelian berstatus "Dalam Proses" yang dapat dihapus' },
        { status: 403 } // 403 = Forbidden
      );
    }

    await db.$transaction(async (prisma) => {
      await prisma.purchaseOrders.delete({
        where: { id },
      });

      await prisma.purchaseOrderPaymentHistories.deleteMany({
        where: { poId: id },
      });

      if (po.appliedReceivables.greaterThan(0)) {
        await prisma.suppliers.update({
          where: { id: po.supplierId },
          data: {
            receivables: { increment: po.appliedReceivables },
          },
        });
      }
    });

    return NextResponse.json({ message: 'Transaksi Pembelian berhasil dihapus' }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
