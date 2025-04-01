import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { Workbook } from 'exceljs';
import { formatToReadableNumber, isoStringToReadableDate } from '@/utils/helper-function';

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
        Product: undefined,
      }));

      return {
        ...po,
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
  const reportDate =
    startDate && endDate && `${new Date(startDate).toISOString()} - ${new Date(endDate).toISOString()}`;
  const title = `Laporan Transaksi Pembelian ${reportDate}`;

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
    'Kode PO',
    'Tanggal Pembelian',
    'Supplier',
    'Sub Total',
    'Potong Piutang',
    'Grand Total',
    'Item',
    'Status Pengiriman',
    'Status Pembayaran',
    'Barang',
    'Harga Beli',
    'Qty',
    'Total Harga',
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

  data.forEach((po, i) => {
    ws.addRow([
      po.code,
      po.purchaseDate,
      po.supplierName,
      'Rp ' + formatToReadableNumber(po.subTotal),
      'Rp ' + formatToReadableNumber(po.appliedReceivables),
      'Rp ' + formatToReadableNumber(po.grandTotal),
      po.totalItem,
      po.progressStatus,
      po.paymentStatus,
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

      if (colNum < 10) {
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        };
      }

      if (colNum == 7) {
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
        };
      }

      // border for the rightmost side of table
      if (colNum == 13) {
        cell.border = {
          right: { style: 'thin' },
        };
      }
    });

    // detail rows
    po.details.forEach((detail: any, j: number) => {
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
        detail.productName,
        'Rp ' + formatToReadableNumber(detail.purchasePrice),
        detail.quantity + ' ' + detail.uom,
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

        if (colNum >= 10) {
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
        else if (colNum < 10 && i == data.length - 1 && j == po.details.length - 1) {
          cell.border = {
            bottom: { style: 'thin' },
          };
        }
      });
    });
  });

  ws.getColumn(1).width = 13;
  ws.getColumn(2).width = 20;
  ws.getColumn(3).width = 25;
  ws.getColumn(4).width = 15;
  ws.getColumn(5).width = 17;
  ws.getColumn(6).width = 15;
  ws.getColumn(7).width = 7;
  ws.getColumn(8).width = 15;
  ws.getColumn(9).width = 15;
  // detail
  ws.getColumn(10).width = 30;
  ws.getColumn(11).width = 15;
  ws.getColumn(12).width = 15;
  ws.getColumn(13).width = 15;

  return await wb.xlsx.writeBuffer();
}
