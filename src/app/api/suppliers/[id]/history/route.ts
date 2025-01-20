import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server';

// BrowseSupplierHistories
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

  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);

  const pageIndex = Number(queryParams.get('pageIndex')) ?? 0;
  const pageSize = Number(queryParams.get('pageSize')) ?? 5;
  const sortOrder = queryParams.get('sortOrder') ?? 'desc';
  const sortColumn = queryParams.get('sortColumn') ?? 'createdAt';

  const orderBy = { createdAt: 'desc' as Prisma.SortOrder };

  try {
    // Purchase Order
    const purchaseOrders = await db.purchaseOrders.findMany({
      select: {
        id: true,
        createdAt: true,
        code: true,
        progressStatus: true,
        paymentStatus: true,
        grandTotal: true,
      },
      where: {
        supplierId: id,
      },
      orderBy,
    });

    const formattedPurchaseOrders = purchaseOrders.map((po) => ({
      date: po.createdAt,
      id: po.id,
      code: po.code,
      progressStatus: po.progressStatus,
      paymentStatus: po.paymentStatus,
      grandTotal: po.grandTotal,
      type: 'Pembelian',
    }));

    // Purchase Return
    const purchaseReturns = await db.purchaseReturns.findMany({
      select: {
        id: true,
        createdAt: true,
        code: true,
        status: true,
        returnType: true,
        PurchaseReturnDetails: {
          select: {
            returnPrice: true,
            returnQuantity: true,
          },
        },
      },
      where: {
        PurchaseOrder: {
          supplierId: id,
        },
      },
      orderBy,
    });

    const formattedPurchaseReturns = purchaseReturns.map((pr) => ({
      date: pr.createdAt,
      id: pr.id,
      code: pr.code,
      progressStatus: pr.status,
      grandTotal:
        pr.returnType === 'Penggantian Barang'
          ? 0
          : pr.PurchaseReturnDetails.reduce(
              (acc, d) => acc.plus(d.returnPrice.times(d.returnQuantity)),
              new Decimal(0)
            ),
      type: `Retur Pembelian (${pr.returnType})`,
    }));

    const supplierHistories = [...formattedPurchaseOrders, ...formattedPurchaseReturns].sort((a, b) => {
      if (sortOrder === 'desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
    });

    const pagedSupplierHistories = supplierHistories.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize);

    return NextResponse.json(
      { message: 'Success', result: pagedSupplierHistories, recordsTotal: supplierHistories.length },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json(
      { message: 'Internal Server Error: ' + e, result: null, recordsTotal: 0 },
      { status: 500 }
    );
  }
}
