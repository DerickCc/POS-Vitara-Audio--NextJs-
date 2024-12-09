import { PurchaseOrderSchema } from '@/models/purchase-order.model';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Decimal } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server';

// GetPurchaseOrderById
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json(
      { message: 'Unauthorized, mohon melakukan login ulang' },
      { status: 401 }
    );
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
        status: true,
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

    const formattedPo = {
      ...po,
      supplierName: po.Supplier.name,
      supplierReceivable: Number(po.Supplier.receivables),
      appliedReceivables: Number(po.appliedReceivables),
      details: formattedPoDetail,
      Supplier: undefined,
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

  const validationRes = PurchaseOrderSchema.safeParse(await request.json());

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
    const supplierReceivables = (
      await db.suppliers.findUniqueOrThrow({
        where: { id: data.supplierId },
        select: { receivables: true },
      })
    ).receivables;

    const hasBeenAppliedReceivables = (
      await db.purchaseOrders.findUniqueOrThrow({
        where: { id },
        select: { appliedReceivables: true },
      })
    ).appliedReceivables;

    // adjustment may be + or -
    const appliedReceivablesAdjustment = new Decimal(data.appliedReceivables).minus(hasBeenAppliedReceivables);
    console.log(appliedReceivablesAdjustment)
    if (new Decimal(appliedReceivablesAdjustment).greaterThan(supplierReceivables)) {
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


    await db.$transaction(async (prisma) => {
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
          UpdatedBy: {
            connect: { id: userId },
          },
        },
      });

      const updatePromises = data.details.map((d) => {
        if (d.id) {
          // update if there is poDetail id
          return prisma.purchaseOrderDetails.update({
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
          });
        } else {
          // create if poDetail id is null
          return prisma.purchaseOrderDetails.create({
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
        }
      });

      await Promise.all(updatePromises);

      // update supplier's receivable if there is adjustment on appliedReceivables
      if (!appliedReceivablesAdjustment.isZero()) {
        await prisma.suppliers.update({
          where: { id: data.supplierId },
          data: {
            receivables: appliedReceivablesAdjustment.isPositive()
              ? { decrement: appliedReceivablesAdjustment }
              : { increment: appliedReceivablesAdjustment.abs() },
          },
        });
      }
    });

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
        status: true,
        supplierId: true,
        appliedReceivables: true,
      },
    });

    if (!po) {
      return NextResponse.json({ message: 'Transaksi Pembelian tidak ditemukan' }, { status: 404 });
    } else if (po.status !== 'Dalam Proses') {
      return NextResponse.json(
        { message: 'Hanya Transaksi Pembelian berstatus "Dalam Proses" yang dapat dihapus' },
        { status: 403 } // 403 = Forbidden
      );
    }

    await db.$transaction(async (prisma) => {
      await prisma.purchaseOrders.delete({
        where: { id },
      });

      await prisma.suppliers.update({
        where: { id: po.supplierId },
        data: {
          receivables: { increment: po.appliedReceivables },
        },
      });
    });

    return NextResponse.json({ message: 'Transaksi Pembelian berhasil dihapus' }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
