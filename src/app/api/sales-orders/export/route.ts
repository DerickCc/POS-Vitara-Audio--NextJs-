import { Workbook } from 'exceljs';
import { formatToReadableNumber, isoStringToReadableDate } from '@/utils/helper-function';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { Decimal } from '@prisma/client/runtime/library';

export async function GET(request: Request) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json({ message: 'Unauthorized, mohon melakukan login ulang' }, { status: 401 });
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
          select: { name: true },
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
            sellingPrice: true,
            quantity: true,
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
      const formattedSoProductDetails = so.SalesOrderProductDetails.map((d) => ({
        ...d,
        productName: d.Product.name,
        uom: d.Product.uom,
        sellingPrice: Number(d.sellingPrice),
        quantity: Number(d.quantity),
        totalPrice: Number(d.totalPrice),
        profit: d.sellingPrice.minus(d.costPrice).times(d.quantity),
        Product: undefined,
      }));

      const formattedSoServiceDetails = so.SalesOrderServiceDetails.map((d) => ({
        ...d,
        sellingPrice: Number(d.sellingPrice),
        quantity: Number(d.quantity),
        totalPrice: Number(d.totalPrice),
      }));

      return {
        ...so,
        salesDate: isoStringToReadableDate(so.salesDate.toISOString()),
        subTotal: Number(so.subTotal),
        discount: Number(so.discount),
        grandTotal: Number(so.grandTotal),
        paidAmount: so.SalesOrderPaymentHistories.reduce((acc, p) => acc.plus(p.amount), new Decimal(0)),
        customerName: so.Customer.name,
        productDetails: formattedSoProductDetails,
        serviceDetails: formattedSoServiceDetails,
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
  const reportDate =
    startDate && endDate && `${new Date(startDate).toISOString()} - ${new Date(endDate).toISOString()}`;
  const title = `Laporan Transaksi Penjualan ${reportDate}`;

  const wb = new Workbook();
  const ws = wb.addWorksheet('Laporan');

  // title
  ws.addRow([title]).eachCell((cell) => {
    cell.font = {
      size: 16,
      bold: true,
      underline: true,
    };
  });

  ws.addRow([]);

  // headers
  const headerRow = ws.addRow([
    'Kode',
    'Kasir',
    'Tanggal Penjualan',
    'Pelanggan',
    'Jenis Pembayaran',
    'Sub Total',
    'Diskon',
    'Grand Total',
    'Telah Dibayar',
    'Status',
    'Barang / Jasa',
    'Harga Jual',
    'Qty',
    'Total Harga',
    'Keuntungan',
  ]);

  headerRow.font = { bold: true, size: 12 };
  headerRow.alignment = {
    horizontal: 'center',
    vertical: 'middle',
    wrapText: true,
  };
  headerRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF00' },
      bgColor: { argb: 'FF0000FF' },
    };
  });

  data.forEach((so, i) => {
    // so row
    ws.addRow([
      so.code,
      so.cashier,
      so.salesDate,
      so.customerName,
      so.paymentType,
      'Rp ' + formatToReadableNumber(so.subTotal),
      'Rp ' + formatToReadableNumber(so.discount),
      'Rp ' + formatToReadableNumber(so.grandTotal),
      'Rp ' + formatToReadableNumber(so.paidAmount),
      so.progressStatus,
      so.paymentStatus,
      '',
      '',
      '',
      '',
      '',
    ]).eachCell((cell, colNum) => {
      if (i % 2 == 0) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'fff2f2f2' },
        };
      } else {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'ffeeece1' },
        };
      }

      if (colNum < 12) {
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        };
      }
      // border for the rightmost side of table
      if (colNum == 16) {
        cell.border = {
          right: { style: 'thin' },
        };
      }
    });

    // product detail rows
    so.productDetails.forEach((detail: any, j: number) => {
      ws.addRow([
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        detail.productName,
        'Rp ' + formatToReadableNumber(detail.sellingPrice),
        detail.quantity + ' ' + detail.uom,
        'Rp ' + formatToReadableNumber(detail.totalPrice),
        'Rp ' + formatToReadableNumber(detail.profit),
      ]).eachCell((cell, colNum) => {
        if (i % 2 == 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'fff2f2f2' },
          };
        } else {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'ffeeece1' },
          };
        }

        if (colNum >= 12) {
          cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
          };


          cell.alignment = {
            wrapText: true,
            horizontal: 'left',
            vertical: 'middle',
          };
        }
        // border for the bottom of table
        else if (
          colNum < 12 &&
          i == data.length - 1 &&
          j == so.productDetails.length - 1 &&
          so.serviceDetails.length == 0
        ) {
          cell.border = {
            bottom: { style: 'thin' },
          };
        }
      });
    });

    // service detail rows
    so.serviceDetails.forEach((detail: any, k: number) => {
      ws.addRow([
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        detail.serviceName,
        'Rp ' + formatToReadableNumber(detail.sellingPrice),
        detail.quantity,
        'Rp ' + formatToReadableNumber(detail.totalPrice),
        'Rp ' + formatToReadableNumber(detail.totalPrice),
      ]).eachCell((cell, colNum) => {
        if (i % 2 == 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'fff2f2f2' },
          };
        } else {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'ffeeece1' },
          };
        }

        if (colNum >= 12) {
          cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
          };

          cell.alignment = {
            wrapText: true,
            horizontal: 'left',
            vertical: 'middle',
          };
        }
        // border for the bottom of table
        else if (colNum < 12 && i == data.length - 1 && k == so.serviceDetails.length - 1) {
          cell.border = {
            bottom: { style: 'thin' },
          };
        }
      });
    });
  });

  ws.getColumn(1).width = 13;
  ws.getColumn(2).width = 20;
  ws.getColumn(3).width = 20;
  ws.getColumn(4).width = 20;
  ws.getColumn(5).width = 18;
  ws.getColumn(6).width = 15;
  ws.getColumn(7).width = 15;
  ws.getColumn(8).width = 15;
  ws.getColumn(9).width = 15;
  ws.getColumn(10).width = 13;
  ws.getColumn(11).width = 13;
  // detail
  ws.getColumn(12).width = 20;
  ws.getColumn(13).width = 15;
  ws.getColumn(14).width = 12;
  ws.getColumn(15).width = 15;
  ws.getColumn(16).width = 15;

  return await wb.xlsx.writeBuffer();
}
