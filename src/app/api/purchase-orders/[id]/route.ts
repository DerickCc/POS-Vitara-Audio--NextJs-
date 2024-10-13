import { PurchaseOrderSchema } from '@/models/purchase-order.model';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { NextResponse } from 'next/server';

// GetPurchaseOrderById
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized', result: null }, { status: 401 });
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
          select: { name: true },
        },
        remarks: true,
        totalItem: true,
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

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
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
    const userId = session.id;

    const grandTotal = data.details.reduce((acc, d) => {
      return acc + d.purchasePrice * d.quantity;
    }, 0);

    await db.$transaction(async (prisma) => {
      const updatedPo = await prisma.purchaseOrders.update({
        where: { id },
        data: {
          Supplier: {
            connect: { id: data.supplierId },
          },
          remarks: data.remarks,
          totalItem: data.details.length,
          grandTotal: grandTotal,
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
    });

    return NextResponse.json({ message: 'Transaksi Pembelian berhasil diupdate' }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}

// DeletePurchaseOrder
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const po = await db.purchaseOrders.findUnique({
      where: { id },
    });

    if (!po) {
      return NextResponse.json(
        { message: 'Transaksi Pembelian tidak ditemukan' },
        { status: 404 }
      );
    } else if (po.status !== 'Dalam Proses') {
      return NextResponse.json(
        { message: 'Hanya Transaksi Pembelian berstatus "Dalam Proses" yang dapat dihapus' },
        { status: 403 } // 403 = Forbidden
      );
    }

    const deletedPo = await db.purchaseOrders.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Transaksi Pembelian berhasil dihapus' }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
