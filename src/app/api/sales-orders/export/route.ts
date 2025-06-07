import { Fill, Workbook } from 'exceljs';
import { isoStringToReadableDate } from '@/utils/helper-function';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { Decimal } from '@prisma/client/runtime/library';
import { EXCEL_MONEY_FMT, PPN_RATE, STYLES } from '@/config/excel-variables';

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
    where.AND.push({ customerId });
  }

  if (startDate) {
    const startOfDay = new Date(startDate);

    where.AND.push({
      salesDate: {
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
      salesDate: {
        lte: endOfDay,
      },
    });
  }

  if (status) {
    where.AND.push({ status });
  }
  // ----------------

  try {
    const salesOrders = await db.salesOrders.findMany({
      orderBy:
        sortColumn === 'customerName'
          ? {
              Customer: { name: sortOrder as Prisma.SortOrder },
            }
          : {
              [sortColumn]: sortOrder,
            },
      where,
      select: {
        code: true,
        salesDate: true,
        Customer: {
          select: { name: true, licensePlate: true },
        },
        paymentType: true,
        subTotal: true,
        discount: true,
        grandTotal: true,
        SalesOrderPaymentHistories: {
          select: { amount: true },
        },
        CreatedBy: {
          select: { name: true },
        },
        progressStatus: true,
        paymentStatus: true,
        SalesOrderProductDetails: {
          select: {
            Product: {
              select: {
                name: true,
                uom: true,
              },
            },
            oriSellingPrice: true,
            sellingPrice: true,
            quantity: true,
            returnedQuantity: true,
            totalPrice: true,
            costPrice: true,
          },
        },
        SalesOrderServiceDetails: {
          select: {
            serviceName: true,
            sellingPrice: true,
            quantity: true,
            totalPrice: true,
          },
        },
      },
    });

    const formattedSalesOrders = salesOrders.map((so) => {
      const formattedSoProductDetails = so.SalesOrderProductDetails.map((d) => {
        const netQuantity = d.quantity.minus(d.returnedQuantity);
        const netTotalPrice = d.sellingPrice.times(netQuantity);
        const grossProfit = d.sellingPrice.minus(d.costPrice).times(netQuantity);
        const ppn = netTotalPrice.times(PPN_RATE);
        const netProfit = grossProfit.minus(ppn);

        return {
          ...d,
          productName: d.Product.name,
          uom: d.Product.uom,
          sellingPrice: d.sellingPrice.toNumber(),
          netQuantity: netQuantity.toNumber(),
          netTotalPrice: netTotalPrice.toNumber(),
          grossProfit: grossProfit.toNumber(),
          ppn: ppn.toNumber(),
          netProfit: netProfit.toNumber(),
          Product: undefined,
        };
      });

      const formattedSoServiceDetails = so.SalesOrderServiceDetails.map((d) => {
        const netTotalPrice = d.totalPrice;
        const ppn = d.totalPrice.times(PPN_RATE);
        const netProfit = d.totalPrice.minus(ppn);

        return {
          ...d,
          uom: 'PCS',
          sellingPrice: d.sellingPrice.toNumber(),
          netQuantity: d.quantity.toNumber(),
          netTotalPrice: netTotalPrice.toNumber(),
          grossProfit: netTotalPrice.toNumber(),
          ppn: ppn.toNumber(),
          netProfit: netProfit.toNumber(),
        };
      });

      const allDetails = [...formattedSoProductDetails, ...formattedSoServiceDetails];

      return {
        ...so,
        salesDate: isoStringToReadableDate(so.salesDate.toISOString()),
        subTotal: so.subTotal.toNumber(),
        discount: so.discount.toNumber(),
        grandTotal: so.grandTotal.toNumber(),
        paidAmount: so.SalesOrderPaymentHistories.reduce((acc, p) => acc.plus(p.amount), new Decimal(0)).toNumber(),
        customerName: so.Customer.name + ' (' + so.Customer.licensePlate + ')',
        productDetails: formattedSoProductDetails,
        serviceDetails: formattedSoServiceDetails,
        totalNetProfit: allDetails.reduce((acc, d) => acc + d.netProfit, 0),
        cashier: so.CreatedBy.name,
        Customer: undefined,
        SalesOrderProductDetails: undefined,
        SalesOrderServiceDetails: undefined,
        CreatedBy: undefined,
      };
    });

    const buffer = await exportSalesOrdersToExcel(startDate, endDate, formattedSalesOrders);

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="LaporanTransaksiPenjualan.xlsx"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}

async function exportSalesOrdersToExcel(startDate: string, endDate: string, data: any[]) {
  const wb = new Workbook();
  const ws = wb.addWorksheet('Laporan Penjualan');

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
    'Kode',
    'Kasir',
    'Tanggal Penjualan',
    'Pelanggan',
    'Jenis Pembayaran',
    'Sub Total',
    'Diskon',
    'Grand Total',
    'Status Pengerjaan',
    'Status Pembayaran',
    'Sisa Bayar',
    'Barang / Jasa',
    'Qty Bersih',
    'Satuan',
    'Harga Jual',
    'Total Harga Jual',
    'Laba Kotor',
    'PPN (11%)',
    'Laba Bersih',
    'Total Laba Bersih',
  ]);
  headerRow.eachCell((cell) => {
    cell.style = STYLES.header;
  });
  headerRow.height = 33;

  // --- Content ---
  data.forEach((so) => {
    let statusFill: Fill | undefined = undefined;
    if (so.paymentStatus === 'Lunas') {
      statusFill = STYLES.greenFill;
    } else if (so.paymentStatus === 'Belum Lunas') {
      statusFill = STYLES.redFill;
    } else if (so.paymentStatus === 'Batal') {
      statusFill = STYLES.grayFill;
    }

    const masterRow = ws.addRow([
      so.code,
      so.cashier,
      so.salesDate,
      so.customerName,
      so.paymentType,
      so.subTotal,
      so.discount,
      so.grandTotal,
      so.progressStatus,
      so.paymentStatus,
      so.grandTotal - so.paidAmount,
      ...Array(8).fill(''),
      so.totalNetProfit,
    ]);

    masterRow.eachCell((cell, colNumber) => {
      cell.alignment = STYLES.defaultAlignment;
      cell.border = STYLES.topBorder;
      if (statusFill) {
        cell.fill = statusFill;
      }
      if ([6, 7, 8, 11, 20].includes(colNumber)) {
        cell.numFmt = EXCEL_MONEY_FMT;
      }
    });

    const applyDetailRowStyle = (row: any) => {
      row.eachCell({ includeEmpty: true }, (cell: any, colNumber: number) => {
        if (colNumber >= 12 && colNumber < 20) {
          cell.border = { ...STYLES.fullBorder };
        }
        if (colNumber >= 15) {
          cell.numFmt = EXCEL_MONEY_FMT;
        }
      });
    };

    so.productDetails.forEach((detail: any) => {
      const detailRow = ws.addRow([
        ...Array(11).fill(''),
        detail.productName,
        detail.netQuantity,
        detail.uom,
        detail.sellingPrice,
        detail.netTotalPrice,
        detail.grossProfit,
        detail.ppn,
        detail.netProfit,
      ]);
      applyDetailRowStyle(detailRow);
    });

    so.serviceDetails.forEach((detail: any) => {
      const detailRow = ws.addRow([
        ...Array(11).fill(''),
        detail.serviceName,
        detail.netQuantity,
        detail.uom,
        detail.sellingPrice,
        detail.netTotalPrice,
        detail.grossProfit,
        detail.ppn,
        detail.netProfit,
      ]);
      applyDetailRowStyle(detailRow);
    });

    const lastDetailRow = ws.lastRow ? ws.lastRow.number : masterRow.number;
    if (lastDetailRow > masterRow.number) {
      for (let i = 1; i <= 11; i++) {
        ws.mergeCells(masterRow.number, i, lastDetailRow, i);
      }
      ws.mergeCells(masterRow.number, 20, lastDetailRow, 20);
    }
  });

  const columnWidths = [15, 20, 20, 25, 15, 18, 18, 18, 16, 16, 18, 35, 10, 10, 18, 18, 18, 18, 18, 18];
  columnWidths.forEach((width, idx) => {
    ws.getColumn(idx + 1).width = width;
  });

  return await wb.xlsx.writeBuffer();
}
