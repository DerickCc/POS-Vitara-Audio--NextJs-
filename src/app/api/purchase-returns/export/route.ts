import { formatToReadableNumber, isoStringToReadableDate } from '@/utils/helper-function';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Prisma } from '@prisma/client';
import { Workbook } from 'exceljs';
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
        returnPrice: Number(d.returnPrice),
        returnQuantity: Number(d.returnQuantity),
        totalPrice: d.returnPrice.times(d.returnQuantity),
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
  const reportDate =
    startDate && endDate && `${new Date(startDate).toISOString()} - ${new Date(endDate).toISOString()}`;
  const title = `Laporan Retur Pembelian ${reportDate}`;

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
    'Kode PR',
    'Tanggal Retur',
    'Kode PO yang Diretur',
    'Supplier',
    'Tipe Retur',
    'Grand Total',
    'Status',
    'Barang',
    'Harga Retur',
    'Qty',
    'Total Harga',
    'Alasan',
  ]);

  headerRow.font = { bold: true, size: 12 };
  headerRow.alignment = {
    horizontal: 'center',
    vertical: 'middle',
    wrapText: true,
  };
  headerRow.eachCell((cell, colNum) => {
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

  data.forEach((pr, i) => {
    ws.addRow([
      pr.code,
      pr.returnDate,
      pr.poCode,
      pr.supplierName,
      pr.returnType,
      'Rp ' + formatToReadableNumber(pr.grandTotal),
      pr.status,
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

      if (colNum < 8) {
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        };
      }

      // border for the rightmost side of table
      if (colNum == 12) {
        cell.border = {
          right: { style: 'thin' },
        };
      }
    });

    // detail rows
    pr.details.forEach((detail: any, j: number) => {
      ws.addRow([
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        detail.productName,
        'Rp ' + formatToReadableNumber(detail.returnPrice),
        detail.returnQuantity + ' ' + detail.uom,
        'Rp ' + formatToReadableNumber(detail.totalPrice),
        detail.reason,
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

        if (colNum >= 8) {
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
        else if (colNum < 8 && i == data.length - 1 && j == pr.details.length - 1) {
          cell.border = {
            bottom: { style: 'thin' },
          };
        }
      });
    });
  });

  ws.getColumn(1).width = 15;
  ws.getColumn(2).width = 20;
  ws.getColumn(3).width = 15;
  ws.getColumn(4).width = 25;
  ws.getColumn(5).width = 20;
  ws.getColumn(6).width = 15;
  ws.getColumn(7).width = 15;
  // detail
  ws.getColumn(8).width = 30;
  ws.getColumn(9).width = 15;
  ws.getColumn(10).width = 15;
  ws.getColumn(11).width = 15;
  ws.getColumn(12).width = 40;

  return await wb.xlsx.writeBuffer();
}
