import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { NextResponse } from 'next/server';

// SearchPurchaseOrder
export async function GET(request: Request) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json({ message: 'Unauthorized, mohon melakukan login ulang' }, { status: 401 });
  }

  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);

  // filters
  const code = queryParams.get('code') ?? '';
  const progressStatus = queryParams.get('progressStatus') ?? '';

  const where: any = { AND: [] };
  if (code) {
    where.AND.push({
      code: {
        contains: code,
        mode: 'insensitive',
      },
    });
  }

  if (progressStatus) {
    where.AND.push({ progressStatus });
  }
  // ----------------

  try {
    const purchaseOrders = await db.purchaseOrders.findMany({
      orderBy: { code: 'desc' },
      where,
      select: {
        id: true,
        code: true,
        Supplier: {
          select: { name: true },
        },
        PurchaseOrderDetails: {
          select: {
            id: true,
            quantity: true,
            returnedQuantity: true,
            purchasePrice: true,
            Product: {
              select: {
                id: true,
                name: true,
                uom: true,
              },
            },
          },
        },
      },
    });

    const purchaseOrdersWithExtraData: any[] = purchaseOrders.map((po) => ({
      ...po,
      supplierName: po.Supplier.name,
      Supplier: undefined,
      details: po.PurchaseOrderDetails.map((pod) => ({
        ...pod,
        productId: pod.Product.id,
        productName: pod.Product.name,
        productUom: pod.Product.uom,
        quantity: Number(pod.quantity),
        returnedQuantity: Number(pod.returnedQuantity),
        purchasePrice: Number(pod.purchasePrice),
        value: pod.id,
        label: pod.Product.name,
        Product: undefined,
      })),
      PurchaseOrderDetails: undefined,
      value: po.id,
      label: po.code,
    }));

    return NextResponse.json({ message: 'Success', result: purchaseOrdersWithExtraData }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e, result: null }, { status: 500 });
  }
}
