import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { Fill, Workbook } from 'exceljs';
import { isoStringToReadableDate } from '@/utils/helper-function';
import { EXCEL_MONEY_FMT, STYLES } from '@/config/excel-variables';

// ExportPurchaseOrder
export async function GET(request: Request) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json({ message: 'Unauthorized, mohon melakukan login ulang' }, { status: 401 });
  }

  if (session.role !== 'Admin') {
    return NextResponse.json({ message: 'Anda tidak memiliki hak untuk export' }, { status: 401 });
  }

  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);

  const sortOrder = queryParams.get('sortOrder') ?? 'desc';
  const sortColumn = queryParams.get('sortColumn') ?? 'createdAt';

  // filters
  const code = queryParams.get('code') ?? '';
  const supplierId = queryParams.get('supplierId') ?? 0;
  const startDate = queryParams.get('startDate') ?? '';
  const endDate = queryParams.get('endDate') ?? '';
  const progressStatus = queryParams.get('progressStatus') ?? '';
  const paymentStatus = queryParams.get('paymentStatus') ?? '';

  const where: any = { AND: [] };
  if (code) {
    where.AND.push({
      code: {
        contains: code,
        mode: 'insensitive',
      },
    });
  }

  if (supplierId) {
    where.AND.push({ supplierId });
  }

  if (startDate) {
    const startOfDay = new Date(startDate);

    where.AND.push({
      purchaseDate: {
        gte: startOfDay,
      },
    });
  }

  if (endDate) {
    const durationToEndOfDay =
      23 * 60 * 60 * 1000 + // Convert hours to milliseconds
      59 * 60 * 1000 + // Convert minutes to milliseconds
      59 * 1000 + // Convert seconds to milliseconds
      999;
    const endOfDay = new Date(new Date(endDate).getTime() + durationToEndOfDay);

    where.AND.push({
      purchaseDate: {
        lte: endOfDay,
      },
    });
  }

  if (progressStatus) {
    where.AND.push({ progressStatus });
  }

  if (paymentStatus) {
    where.AND.push({ paymentStatus });
  }
  // ----------------

  try {
    const purchaseOrders = await db.purchaseOrders.findMany({
      orderBy:
        sortColumn === 'supplierName'
          ? {
              Supplier: { name: sortOrder as Prisma.SortOrder },
            }
          : {
              [sortColumn]: sortOrder,
            },
      where,
      select: {
        code: true,
        purchaseDate: true,
        Supplier: {
          select: { name: true },
        },
        subTotal: true,
        appliedReceivables: true,
        grandTotal: true,
        totalItem: true,
        progressStatus: true,
        paymentStatus: true,
        PurchaseOrderDetails: {
          select: {
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

    const formattedPurchaseOrders = purchaseOrders.map((po) => {
      const formattedPoDetails = po.PurchaseOrderDetails.map((d) => ({
        ...d,
        productName: d.Product.name,
        uom: d.Product.uom,
        purchasePrice: d.purchasePrice.toNumber(),
        quantity: d.quantity.toNumber(),
        totalPrice: d.totalPrice.toNumber(),
        Product: undefined,
      }));

      return {
        ...po,
        subTotal: po.subTotal.toNumber(),
        appliedReceivables: po.appliedReceivables.toNumber(),
        grandTotal: po.grandTotal.toNumber(),
        purchaseDate: isoStringToReadableDate(po.purchaseDate.toISOString()),
        details: formattedPoDetails,
        supplierName: po.Supplier.name,
        Supplier: undefined,
        PurchaseOrderDetails: undefined,
      };
    });

    const buffer = await exportPurchaseOrdersToExcel(startDate, endDate, formattedPurchaseOrders);

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="LaporanTransaksiPembelian.xlsx"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}

async function exportPurchaseOrdersToExcel(startDate: string, endDate: string, data: any[]) {
  const wb = new Workbook();
  const ws = wb.addWorksheet('Laporan Pembelian');

  const reportDateText = startDate
    ? `${isoStringToReadableDate(new Date(startDate).toISOString())} - ${isoStringToReadableDate(
        endDate ? new Date(endDate).toISOString() : isoStringToReadableDate(new Date().toISOString())
      )}`
    : `Hingga ${isoStringToReadableDate(new Date().toISOString())}`;

  ws.mergeCells('A1:C1');
  const titleCell = ws.getCell('A1');
  titleCell.value = 'Laporan Transaksi Pembelian';
  titleCell.style = STYLES.title;

  ws.mergeCells('A2:C2');
  const dateCell = ws.getCell('A2');
  dateCell.value = reportDateText;

  ws.addRow([]);

  // --- Header Tabel ---
  const headerRow = ws.addRow([
    'Kode PO',
    'Tanggal Pembelian',
    'Supplier',
    'Sub Total',
    'Potong Piutang',
    'Grand Total',
    'Status Pengiriman',
    'Status Pembayaran',
    'Barang',
    'Qty',
    'Satuan',
    'Harga Beli',
    'Total Harga',
  ]);
  headerRow.eachCell((cell) => {
    cell.style = STYLES.header;
  });
  headerRow.height = 33;

  // --- Content ---
  data.forEach((po) => {
    let statusFill: Fill | undefined = undefined;
    if (po.paymentStatus === 'Lunas') {
      statusFill = STYLES.greenFill;
    } else if (po.paymentStatus === 'Belum Lunas') {
      statusFill = STYLES.redFill;
    } else if (po.paymentStatus === 'Batal') {
      statusFill = STYLES.grayFill;
    }

    const masterRow = ws.addRow([
      po.code,
      po.purchaseDate,
      po.supplierName,
      po.subTotal,
      po.appliedReceivables,
      po.grandTotal,
      po.progressStatus,
      po.paymentStatus,
      ...Array(5).fill(''),
    ]);

    masterRow.eachCell((cell, colNumber) => {
      cell.alignment = STYLES.defaultAlignment;
      cell.border = STYLES.topBorder;
      if (statusFill) {
        cell.fill = statusFill;
      }
      if ([4, 5, 6].includes(colNumber)) {
        cell.numFmt = EXCEL_MONEY_FMT;
      }
    });

    const applyDetailRowStyle = (row: any) => {
      row.eachCell({ includeEmpty: true }, (cell: any, colNumber: number) => {
        if (colNumber >= 9) {
          cell.border = { ...STYLES.fullBorder };
        }
        if (colNumber >= 12) {
          cell.numFmt = EXCEL_MONEY_FMT;
        }
      });
    };

    po.details.forEach((detail: any, j: number) => {
      const detailRow = ws.addRow([
        ...Array(8).fill(''),
        detail.productName,
        detail.quantity,
        detail.uom,
        detail.purchasePrice,
        detail.totalPrice,
      ]);
      applyDetailRowStyle(detailRow);
    });

    const lastDetailRow = ws.lastRow ? ws.lastRow.number : masterRow.number;
    if (lastDetailRow > masterRow.number) {
      for (let i = 1; i <= 8; i++) {
        ws.mergeCells(masterRow.number, i, lastDetailRow, i);
      }
    }
  });

  const columnWidths = [15, 20, 25, 15, 15, 15, 16, 16, 35, 10, 10, 18, 18];
  columnWidths.forEach((width, idx) => {
    ws.getColumn(idx + 1).width = width;
  });

  return await wb.xlsx.writeBuffer();
}
