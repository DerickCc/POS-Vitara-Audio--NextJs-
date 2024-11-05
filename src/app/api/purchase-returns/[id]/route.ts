import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Decimal } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server';

// GetPurchaseReturnById
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
    const pr = await db.purchaseReturns.findUnique({
      where: { id },
      select: {
        id: true,
        poId: true,
        PurchaseOrder: {
          select: {
            code: true,
            Supplier: { select: { name: true } },
          },
        },
        code: true,
        returnDate: true,
        returnType: true,
        grandTotal: true,
        status: true,
        PurchaseReturnDetails: {
          select: {
            id: true,
            podId: true,
            PurchaseOrderDetail: {
              select: {
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
            returnQuantity: true,
            reason: true,
          },
        },
      },
    });

    if (!pr) {
      return NextResponse.json({ message: 'Retur Pembelian tidak ditemukan' }, { status: 404 });
    }

    let grandTotal = new Decimal(0);

    const formattedPrDetail = pr.PurchaseReturnDetails.map((d) => {
      const totalPrice = d.returnQuantity.times(d.PurchaseOrderDetail.purchasePrice);
      grandTotal = grandTotal.plus(totalPrice);

      return {
        ...d,
        productId: d.PurchaseOrderDetail.Product.id,
        productName: d.PurchaseOrderDetail.Product.name,
        purchasePrice: d.PurchaseOrderDetail.purchasePrice,
        productUom: d.PurchaseOrderDetail.Product.uom,
        totalPrice,
        PurchaseOrderDetail: undefined,
      };
    });

    const formattedPr = {
      ...pr,
      poCode: pr.PurchaseOrder.code,
      supplierName: pr.PurchaseOrder.Supplier.name,
      details: formattedPrDetail,
      grandTotal,
      PurchaseOrder: undefined,
      PurchaseReturnDetails: undefined,
    };

    return NextResponse.json({ message: 'Success', result: formattedPr }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
