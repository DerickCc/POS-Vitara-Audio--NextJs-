import { Fill, Workbook } from 'exceljs';
import { formatToReadableNumber, isoStringToReadableDate } from '@/utils/helper-function';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { EXCEL_MONEY_FMT, STYLES } from '@/config/excel-variables';

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
  const customerId = queryParams.get('customerId') ?? 0;
  const startDate = queryParams.get('startDate') ?? '';
  const endDate = queryParams.get('endDate') ?? '';
  const soCode = queryParams.get('soCode') ?? '';
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

  if (customerId) {
    where.AND.push({
      SalesOrder: { customerId },
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

  if (soCode) {
    where.AND.push({
      SalesOrder: {
        code: {
          contains: soCode,
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
  if (sortColumn === 'customerName') {
    orderBy = {
      SalesOrder: {
        Customer: {
          name: sortOrder as Prisma.SortOrder,
        },
      },
    };
  } else if (sortColumn === 'soCode') {
    orderBy = {
      SalesOrder: {
        code: sortOrder as Prisma.SortOrder,
      },
    };
  } else {
    orderBy = { [sortColumn]: sortOrder };
  }

  try {
    const salesReturns = await db.salesReturns.findMany({
      orderBy,
      where,
      select: {
        code: true,
        returnDate: true,
        SalesOrder: {
          select: {
            code: true,
            Customer: {
              select: { name: true },
            },
          },
        },
        grandTotal: true,
        status: true,
        SalesReturnProductDetails: {
          select: {
            SalesOrderProductDetail: {
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
        SalesReturnServiceDetails: {
          select: {
            serviceName: true,
            returnQuantity: true,
            reason: true,
          },
        },
      },
    });

    const formattedSalesReturns = salesReturns.map((sr) => {
      const formattedSrProductDetails = sr.SalesReturnProductDetails.map((d) => ({
        ...d,
        productName: d.SalesOrderProductDetail.Product.name,
        uom: d.SalesOrderProductDetail.Product.uom,
        returnPrice: d.returnPrice.toNumber(),
        returnQuantity: d.returnQuantity.toNumber(),
        totalPrice: d.returnPrice.times(d.returnQuantity).toNumber(),
        SalesOrderProductDetail: undefined,
      }));

      const formattedSrServiceDetails = sr.SalesReturnServiceDetails.map((d) => ({
        ...d,
        uom: 'PCS',
        returnQuantity: d.returnQuantity.toNumber(),
      }));

      return {
        ...sr,
        returnDate: isoStringToReadableDate(sr.returnDate.toISOString()),
        soCode: sr.SalesOrder.code,
        customerName: sr.SalesOrder.Customer.name,
        grandTotal: Number(sr.grandTotal),
        productDetails: formattedSrProductDetails,
        serviceDetails: formattedSrServiceDetails,
        SalesReturnProductDetails: undefined,
        SalesReturnServiceDetails: undefined,
        SalesOrder: undefined,
      };
    });

    const buffer = await exportSalesReturnsToExcel(startDate, endDate, formattedSalesReturns);

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="LaporanReturPenjualan.xlsx"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}

async function exportSalesReturnsToExcel(startDate: string, endDate: string, data: any[]) {
  const wb = new Workbook();
  const ws = wb.addWorksheet('Laporan Retur Penjualan');

  const reportDateText = startDate
    ? `${isoStringToReadableDate(new Date(startDate).toISOString())} - ${isoStringToReadableDate(
        endDate ? new Date(endDate).toISOString() : isoStringToReadableDate(new Date().toISOString())
      )}`
    : `Hingga ${isoStringToReadableDate(new Date().toISOString())}`;

  ws.mergeCells('A1:C1');
  const titleCell = ws.getCell('A1');
  titleCell.value = 'Laporan Transaksi Penjualan';
  titleCell.style = STYLES.title;

  ws.mergeCells('A2:C2');
  const dateCell = ws.getCell('A2');
  dateCell.value = reportDateText;

  ws.addRow([]);

  // --- Header Tabel ---
  const headerRow = ws.addRow([
    'Kode SR',
    'Tanggal Retur',
    'Kode SO yang Diretur',
    'Pelanggan',
    'Grand Total',
    'Status',
    'Barang / Jasa',
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
  data.forEach((sr) => {
    let statusFill: Fill | undefined = undefined;
    if (sr.status === 'Selesai') {
      statusFill = STYLES.greenFill;
    } else if (sr.status === 'Batal') {
      statusFill = STYLES.grayFill;
    }

    const masterRow = ws.addRow([
      sr.code,
      sr.returnDate,
      sr.soCode,
      sr.customerName,
      sr.grandTotal,
      sr.status,
      ...Array(6).fill(''),
    ]);

    masterRow.eachCell((cell, colNumber) => {
      cell.alignment = STYLES.defaultAlignment;
      cell.border = STYLES.topBorder;
      if (statusFill) {
        cell.fill = statusFill;
      }
      if (colNumber === 5) {
        cell.numFmt = EXCEL_MONEY_FMT;
      }
    });

    const applyDetailRowStyle = (row: any) => {
      row.eachCell({ includeEmpty: true }, (cell: any, colNumber: number) => {
        if (colNumber >= 7) {
          cell.border = { ...STYLES.fullBorder };
        }
        if (colNumber === 10 || colNumber === 11) {
          cell.numFmt = EXCEL_MONEY_FMT;
        }
      });
    };

    sr.productDetails.forEach((detail: any) => {
      const detailRow = ws.addRow([
        ...Array(6).fill(''),
        detail.productName,
        detail.returnQuantity,
        detail.uom,
        detail.returnPrice,
        detail.totalPrice,
        detail.reason,
      ]);
      applyDetailRowStyle(detailRow);
    });

    sr.serviceDetails.forEach((detail: any, k: number) => {
      const detailRow = ws.addRow([
        ...Array(6).fill(''),
        detail.serviceName,
        detail.returnQuantity,
        detail.uom,
        0,
        0,
        detail.reason,
      ]);
      applyDetailRowStyle(detailRow);
    });

    const lastDetailRow = ws.lastRow ? ws.lastRow.number : masterRow.number;
    if (lastDetailRow > masterRow.number) {
      for (let i = 1; i <= 6; i++) {
        ws.mergeCells(masterRow.number, i, lastDetailRow, i);
      }
    }
  });

  const columnWidths = [15, 20, 15, 25, 18, 18, 35, 10, 10, 15, 18, 18, 40];
  columnWidths.forEach((width, idx) => {
    ws.getColumn(idx + 1).width = width;
  });

  return await wb.xlsx.writeBuffer();
}
