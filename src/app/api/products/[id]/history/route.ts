import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Decimal } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server';

// GetProductHistories
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json(
      { message: 'Unauthorized, mohon melakukan login ulang', result: null, recordsTotal: 0 },
      { status: 401 }
    );
  }

  const { id } = params;

  if (!id) {
    return NextResponse.json({ message: 'Id barang tidak boleh null' }, { status: 400 });
  }

  try {
    // Purchase Order
    const poDetails = await db.purchaseOrderDetails.findMany({
      select: {
        poId: true,
        createdAt: true,
        PurchaseOrder: {
          select: {
            code: true,
            Supplier: {
              select: { name: true },
            },
          },
        },
        purchasePrice: true,
        quantity: true,
        totalPrice: true,
      },
      where: { productId: id },
      orderBy: { createdAt: 'desc' },
    });

    const formattedPoDetails = poDetails.map((d) => ({
      date: d.createdAt,
      id: d.poId,
      code: d.PurchaseOrder.code,
      supOrCus: d.PurchaseOrder.Supplier.name,
      price: d.purchasePrice,
      quantity: d.quantity,
      totalPrice: d.totalPrice,
      type: 'Pembelian',
    }));

    // Sales Order
    const sopDetails = await db.salesOrderProductDetails.findMany({
      select: {
        soId: true,
        createdAt: true,
        SalesOrder: {
          select: {
            code: true,
            Customer: {
              select: { name: true },
            },
          },
        },
        sellingPrice: true,
        quantity: true,
        totalPrice: true,
      },
      where: { productId: id },
      orderBy: { createdAt: 'desc' },
    });

    const formattedSopDetails = sopDetails.map((d) => ({
      date: d.createdAt,
      id: d.soId,
      code: d.SalesOrder.code,
      supOrCus: d.SalesOrder.Customer.name,
      price: d.sellingPrice,
      quantity: d.quantity,
      totalPrice: d.totalPrice,
      type: 'Penjualan',
    }));

    // Purchase Return
    const prDetails = await db.purchaseReturnDetails.findMany({
      select: {
        prId: true,
        createdAt: true,
        PurchaseReturn: {
          select: {
            code: true,
            status: true,
            returnType: true,
            PurchaseOrder: {
              select: {
                Supplier: {
                  select: { name: true },
                },
              },
            },
          },
        },
        returnPrice: true,
        returnQuantity: true,
      },
      where: {
        PurchaseOrderDetail: {
          productId: id,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedPrDetails = prDetails.map((d) => ({
      date: d.createdAt,
      id: d.prId,
      code: d.PurchaseReturn.code,
      supOrCus: d.PurchaseReturn.PurchaseOrder.Supplier.name,
      price: 0,
      quantity:
        d.PurchaseReturn.status === 'Selesai' && d.PurchaseReturn.returnType === 'Penggantian Barang'
          ? 0
          : d.returnQuantity,
      totalPrice: 0,
      type: `Retur Pembelian (${d.PurchaseReturn.returnType})`,
    }));

    // Sales Return
    const srDetails = await db.salesReturnProductDetails.findMany({
      select: {
        srId: true,
        createdAt: true,
        SalesReturn: {
          select: {
            code: true,
            SalesOrder: {
              select: {
                Customer: {
                  select: { name: true },
                },
              },
            },
          },
        },
        returnPrice: true,
        returnQuantity: true,
      },
      where: {
        SalesOrderProductDetail: {
          productId: id,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedSrDetails = srDetails.map((d) => ({
      date: d.createdAt,
      id: d.srId,
      code: d.SalesReturn.code,
      supOrCus: d.SalesReturn.SalesOrder.Customer.name,
      price: d.returnPrice,
      quantity: d.returnQuantity,
      totalPrice: d.returnPrice.times(d.returnQuantity),
      type: 'Retur Penjualan',
    }));

    const productHistories = [
      ...formattedPoDetails,
      ...formattedSopDetails,
      ...formattedPrDetails,
      ...formattedSrDetails,
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(
      { message: 'Success', result: productHistories, recordsTotal: productHistories.length },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json(
      { message: 'Internal Server Error: ' + e, result: null, recordsTotal: 0 },
      { status: 500 }
    );
  }
}
