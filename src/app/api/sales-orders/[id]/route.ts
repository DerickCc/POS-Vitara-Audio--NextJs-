import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Decimal } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server';

// GetSalesOrderById
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json(
      { message: 'Unauthorized, mohon melakukan login ulang', result: null, recordsTotal: 0 },
      { status: 401 }
    );
  }

  const { id } = params;

  try {
    const so = await db.salesOrders.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        salesDate: true,
        entryDate: true,
        customerId: true,
        Customer: {
          select: {
            name: true,
            licensePlate: true,
            phoneNo: true,
            address: true,
          },
        },
        paymentType: true,
        SalesOrderPaymentHistories: {
          select: { amount: true },
        },
        subTotal: true,
        discount: true,
        grandTotal: true,
        status: true,
        remarks: true,
        SalesOrderProductDetails: {
          select: {
            id: true,
            soId: true,
            productId: true,
            Product: {
              select: { name: true, uom: true, type: true },
            },
            sellingPrice: true,
            quantity: true,
            totalPrice: true,
          },
        },
        SalesOrderServiceDetails: {
          select: {
            id: true,
            soId: true,
            serviceName: true,
            sellingPrice: true,
            quantity: true,
            totalPrice: true,
          },
        },
        CreatedBy: {
          select: { name: true },
        },
      },
    });

    if (!so) {
      return NextResponse.json({ message: 'Transaksi Penjualan tidak ditemukan' }, { status: 404 });
    }

    const formattedSoProductDetail = so.SalesOrderProductDetails.map((d) => ({
      ...d,
      productName: d.Product.name,
      sellingPrice: Number(d.sellingPrice),
      quantity: Number(d.quantity),
      totalPrice: Number(d.totalPrice),
      uom: d.Product.uom,
      type: d.Product.type,
      Product: undefined,
    }));

    const formattedSoServiceDetail = so.SalesOrderServiceDetails.map((d) => ({
      ...d,
      sellingPrice: Number(d.sellingPrice),
      quantity: Number(d.quantity),
      totalPrice: Number(d.totalPrice),
    }));

    const cashier = so.CreatedBy.name;

    const paidAmount = so.SalesOrderPaymentHistories.reduce((acc, p) => acc.plus(p.amount), new Decimal(0));

    const formattedSo = {
      ...so,
      subTotal: Number(so.subTotal),
      discount: Number(so.discount),
      grandTotal: Number(so.grandTotal),
      paidAmount: Number(paidAmount),
      customerName: so.Customer.name,
      customerLicensePlate: so.Customer.licensePlate,
      customerAddress: so.Customer.address,
      customerPhoneNo: so.Customer.phoneNo,
      productDetails: formattedSoProductDetail,
      serviceDetails: formattedSoServiceDetail,
      cashier,
      Customer: undefined,
      SalesOrderPaymentHistories: undefined,
      SalesOrderProductDetails: undefined,
      SalesOrderServiceDetails: undefined,
      CreatedBy: undefined,
    };

    return NextResponse.json({ message: 'Success', result: formattedSo }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
