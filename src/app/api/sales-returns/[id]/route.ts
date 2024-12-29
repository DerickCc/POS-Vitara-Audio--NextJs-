import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Decimal } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server';

// GetSalesReturnById
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
    const sr = await db.salesReturns.findUnique({
      where: { id },
      select: {
        id: true,
        soId: true,
        SalesOrder: {
          select: {
            code: true,
            Customer: { select: { name: true, licensePlate: true } },
          },
        },
        code: true,
        returnDate: true,
        grandTotal: true,
        status: true,
        SalesReturnProductDetails: {
          select: {
            id: true,
            sopdId: true,
            SalesOrderProductDetail: {
              select: {
                Product: {
                  select: {
                    id: true,
                    name: true,
                    uom: true,
                  },
                },
              },
            },
            returnPrice: true,
            returnQuantity: true,
            reason: true,
          },
        },
        SalesReturnServiceDetails: {
          select: {
            id: true,
            serviceName: true,
            returnQuantity: true,
            reason: true,
          }
        }
      },
    });

    if (!sr) {
      return NextResponse.json({ message: 'Retur Penjualan tidak ditemukan' }, { status: 404 });
    }

    let grandTotal = new Decimal(0);

    const formattedSrpDetails = sr.SalesReturnProductDetails.map((d) => {
      const totalPrice = d.returnQuantity.times(d.returnPrice);
      grandTotal = grandTotal.plus(totalPrice);

      return {
        ...d,
        productId: d.SalesOrderProductDetail.Product.id,
        productName: d.SalesOrderProductDetail.Product.name,
        productUom: d.SalesOrderProductDetail.Product.uom,
        totalPrice,
        SalesOrderProductDetail: undefined,
      };
    });

    const formattedSr = {
      ...sr,
      soCode: sr.SalesOrder.code,
      customerName: sr.SalesOrder.Customer.name,
      customerLicensePlate: sr.SalesOrder.Customer.licensePlate,
      productDetails: formattedSrpDetails,
      serviceDetails: sr.SalesReturnServiceDetails,
      grandTotal,
      SalesOrder: undefined,
      SalesReturnProductDetails: undefined,
      SalesReturnServiceDetails: undefined,
    }

    return NextResponse.json({ message: 'Success', result: formattedSr }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}