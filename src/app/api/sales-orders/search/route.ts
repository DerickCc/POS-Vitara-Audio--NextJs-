import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { NextResponse } from 'next/server';

// SearcSalesOrder
export async function GET(request: Request) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json(
      { message: 'Unauthorized, mohon melakukan login ulang', result: null, recordsTotal: 0 },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);

  // filters
  const code = queryParams.get('code') ?? '';
  const status = queryParams.get('status') ?? '';

  const where: any = { AND: [] };
  if (code) {
    where.AND.push({
      code: {
        contains: code,
        mode: 'insensitive',
      },
    });
  }

  if (status) {
    where.AND.push({ status });
  }
  // ----------------

  try {
    const salesOrders = await db.salesOrders.findMany({
      orderBy: { code: 'desc' },
      where,
      select: {
        id: true,
        code: true,
        Customer: {
          select: { name: true, licensePlate: true },
        },
        SalesOrderProductDetails: {
          select: {
            id: true,
            quantity: true,
            returnedQuantity: true,
            Product: {
              select: {
                id: true,
                name: true,
                uom: true,
                stock: true,
              },
            },
          },
        },
      },
    });

    const salesOrdersWithExtraData: any[] = salesOrders.map((so) => ({
      ...so,
      customerName: so.Customer.name,
      customerLicensePlate: so.Customer.licensePlate,
      Customer: undefined,
      productDetails: so.SalesOrderProductDetails.map((sopd) => ({
        ...sopd,
        productId: sopd.Product.id,
        productName: sopd.Product.name,
        productUom: sopd.Product.uom,
        productStock: Number(sopd.Product.stock),
        quantity: Number(sopd.quantity),
        returnedQuantity: Number(sopd.returnedQuantity),
        value: sopd.id,
        label: sopd.Product.name,
        Product: undefined,
      })),
      SalesOrderProductDetails: undefined,
      value: so.id,
      label: so.code,
    }));

    return NextResponse.json({ message: 'Success', result: salesOrdersWithExtraData }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e, result: null }, { status: 500 });
  }
}
