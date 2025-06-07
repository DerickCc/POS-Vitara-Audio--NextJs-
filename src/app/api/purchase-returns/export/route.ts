import { EXCEL_MONEY_FMT, STYLES } from '@/config/excel-variables';
import { formatToReadableNumber, isoStringToReadableDate } from '@/utils/helper-function';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Prisma } from '@prisma/client';
import { Fill, Workbook } from 'exceljs';
import { NextResponse } from 'next/server';

// ExportPurchaseReturn
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
  const poCode = queryParams.get('poCode') ?? '';
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

  if (supplierId) {
    where.AND.push({
      PurchaseOrder: { supplierId },
    });
  }

  if (startDate) {
    const startOfDay = new Date(startDate);

    where.AND.push({
      returnDate: {
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
      returnDate: {
        lte: endOfDay,
      },
    });
  }

  if (poCode) {
    where.AND.push({
      PurchaseOrder: {
        code: {
          contains: poCode,
          mode: 'insensitive',
        },
      },
    });
  }

  if (status) {
    where.AND.push({ status });
  }
  // ----------------

  let orderBy;
  if (sortColumn === 'supplierName') {
    orderBy = {
      PurchaseOrder: {
        Supplier: {
          name: sortOrder as Prisma.SortOrder,
        },
      },
    };
  } else if (sortColumn === 'poCode') {
    orderBy = {
      PurchaseOrder: {
        code: sortOrder as Prisma.SortOrder,
      },
    };
  } else {
    orderBy = { [sortColumn]: sortOrder };
  }

  try {
    const purchaseReturns = await db.purchaseReturns.findMany({
      orderBy,
      where,
      select: {
        code: true,
        returnDate: true,
        PurchaseOrder: {
          select: {
            code: true,
            Supplier: {
              select: { name: true },
            },
          },
        },
        returnType: true,
        grandTotal: true,
        status: true,
        PurchaseReturnDetails: {
          select: {
            PurchaseOrderDetail: {
              select: {
                Product: {
                  select: {
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
      },
    });

    const formattedPurchaseReturns = purchaseReturns.map((pr) => {
      const formattedPrDetail = pr.PurchaseReturnDetails.map((d) => ({
        ...d,
        productName: d.PurchaseOrderDetail.Product.name,
        uom: d.PurchaseOrderDetail.Product.uom,
        returnPrice: d.returnPrice.toNumber(),
        returnQuantity: d.returnQuantity.toNumber(),
        totalPrice: d.returnPrice.times(d.returnQuantity).toNumber(),
        PurchaseOrderDetail: undefined,
      }));

      return {
        ...pr,
        returnDate: isoStringToReadableDate(pr.returnDate.toISOString()),
        poCode: pr.PurchaseOrder.code,
        supplierName: pr.PurchaseOrder.Supplier.name,
        grandTotal: Number(pr.grandTotal),
        details: formattedPrDetail,
        PurchaseReturnDetails: undefined,
        PurchaseOrder: undefined,
      };
    });

    const buffer = await exportPurchaseReturnsToExcel(startDate, endDate, formattedPurchaseReturns);

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

async function exportPurchaseReturnsToExcel(startDate: string, endDate: string, data: any[]) {
  const wb = new Workbook();
  const ws = wb.addWorksheet('Laporan Retur Pembelian');

  const reportDateText = startDate
    ? `${isoStringToReadableDate(new Date(startDate).toISOString())} - ${isoStringToReadableDate(
        endDate ? new Date(endDate).toISOString() : isoStringToReadableDate(new Date().toISOString())
      )}`
    : `Hingga ${isoStringToReadableDate(new Date().toISOString())}`;

  ws.mergeCells('A1:C1');
  const titleCell = ws.getCell('A1');
  titleCell.value = 'Laporan Retur Pembelian';
  titleCell.style = STYLES.title;

  ws.mergeCells('A2:C2');
  const dateCell = ws.getCell('A2');
  dateCell.value = reportDateText;

  ws.addRow([]);

  // --- Header Tabel ---
  const headerRow = ws.addRow([
    'Kode PR',
    'Tanggal Retur',
    'Kode PO yang Diretur',
    'Supplier',
    'Tipe Retur',
    'Grand Total',
    'Status',
    'Barang',
    'Qty',
    'Satuan',
    'Harga Retur',
    'Total Harga',
    'Alasan',
  ]);
  headerRow.eachCell((cell) => {
    cell.style = STYLES.header;
  });
  headerRow.height = 33;

  // --- Content ---
  data.forEach((pr) => {
    let statusFill: Fill | undefined = undefined;
    if (pr.status === 'Selesai') {
      statusFill = STYLES.greenFill;
    } else if (pr.status === 'Dalam Proses') {
      statusFill = STYLES.biruFill;
    } else if (pr.status === 'Batal') {
      statusFill = STYLES.grayFill;
    }

    const masterRow = ws.addRow([
      pr.code,
      pr.returnDate,
      pr.poCode,
      pr.supplierName,
      pr.returnType,
      pr.grandTotal,
      pr.status,
      ...Array(6).fill(''),
    ]);

    masterRow.eachCell((cell, colNumber) => {
      cell.alignment = STYLES.defaultAlignment;
      cell.border = STYLES.topBorder;
      if (statusFill) {
        cell.fill = statusFill;
      }
      if (colNumber === 6) {
        cell.numFmt = EXCEL_MONEY_FMT;
      }
    });

    const applyDetailRowStyle = (row: any) => {
      row.eachCell({ includeEmpty: true }, (cell: any, colNumber: number) => {
        if (colNumber >= 8) {
          cell.border = { ...STYLES.fullBorder };
        }
        if (colNumber === 11 || colNumber === 12) {
          cell.numFmt = EXCEL_MONEY_FMT;
        }
      });
    };

    pr.details.forEach((detail: any) => {
      const detailRow = ws.addRow([
        ...Array(7).fill(''),
        detail.productName,
        detail.returnQuantity,
        detail.uom,
        detail.returnPrice,
        detail.totalPrice,
        detail.reason,
      ]);

      applyDetailRowStyle(detailRow);
    });

    const lastDetailRow = ws.lastRow ? ws.lastRow.number : masterRow.number;
    if (lastDetailRow > masterRow.number) {
      for (let i = 1; i <= 7; i++) {
        ws.mergeCells(masterRow.number, i, lastDetailRow, i);
      }
    }
  });

  const columnWidths = [15, 20, 15, 25, 20, 18, 18, 30, 10, 10, 18, 18, 40];
  columnWidths.forEach((width, idx) => {
    ws.getColumn(idx + 1).width = width;
  });

  return await wb.xlsx.writeBuffer();
}
