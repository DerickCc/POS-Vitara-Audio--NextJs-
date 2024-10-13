import { SalesOrderSchema } from '@/models/sales-order';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { NextResponse } from 'next/server';

// GetSalesOrderById
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized', result: null }, { status: 401 });
  }

  const { id } = params;

  try {
    const so = await db.salesOrders.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        salesDate: true,
        customerId: true,
        Customer: {
          select: { name: true },
        },
        remarks: true,
        // totalItem: true,
        // grandTotal: true,
        // status: true,
        // createdBy: true,
        // PurchaseOrderDetails: {
        //   select: {
        //     id: true,
        //     poId: true,
        //     productId: true,
        //     Product: {
        //       select: { name: true, uom: true },
        //     },
        //     purchasePrice: true,
        //     quantity: true,
        //     totalPrice: true,
        //   },
        // },
      },
    });

    if (!so) {
      return NextResponse.json({ message: 'Transaksi Penjualan tidak ditemukan' }, { status: 404 });
    }

    // const formattedPoDetail = so.PurchaseOrderDetails.map((d) => ({
    //   ...d,
    //   productName: d.Product.name,
    //   uom: d.Product.uom,
    //   Product: undefined,
    // }));

    // const formattedPo = {
    //   ...po,
    //   supplierName: po.Supplier.name,
    //   details: formattedPoDetail,
    //   Supplier: undefined,
    //   PurchaseOrderDetails: undefined,
    // };

    return NextResponse.json({ message: 'Success', result: '' }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}