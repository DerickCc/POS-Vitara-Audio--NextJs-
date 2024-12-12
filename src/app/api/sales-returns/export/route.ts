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
        returnPrice: Number(d.returnPrice),
        returnQuantity: Number(d.returnQuantity),
        totalPrice: d.returnPrice.times(d.returnQuantity),
        SalesOrderProductDetail: undefined,
      }));

      const formattedSrServiceDetails = sr.SalesReturnServiceDetails.map((d) => ({
        ...d,
        returnQuantity: Number(d.returnQuantity),
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
    'Kode SR',
    'Tanggal Retur',
    'No. Invoice yang Diretur',
    'Pelanggan',
    'Grand Total',
    'Status',
    'Barang / Jasa',
    'Harga Retur',
    'Qty',
    'Total Harga',
    'Alasan',
  ]);

  headerRow.font = { bold: true, size: 12 };
  headerRow.alignment = {
    horizontal: 'center',
    vertical: 'middle',
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

  data.forEach((sr, i) => {
    // sr row
    ws.addRow([
      sr.code,
      sr.returnDate,
      sr.soCode,
      sr.customerName,
      'Rp ' + formatToReadableNumber(sr.grandTotal),
      sr.status,
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

      if (colNum < 7) {
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

    // product detail rows
    sr.productDetails.forEach((detail: any, j: number) => {
      ws.addRow([
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

        if (colNum >= 7) {
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
          colNum < 11 &&
          i == data.length - 1 &&
          j == sr.productDetails.length - 1 &&
          sr.serviceDetails.length == 0
        ) {
          cell.border = {
            bottom: { style: 'thin' },
          };
        }
      });
    });

    // service detail rows
    sr.serviceDetails.forEach((detail: any, k: number) => {
      ws.addRow(['', '', '', '', '', '', detail.serviceName, '-', detail.returnQuantity, '-', detail.reason]).eachCell(
        (cell, colNum) => {
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

          if (colNum >= 7) {
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
          else if (colNum < 11 && i == data.length - 1 && k == sr.serviceDetails.length - 1) {
            cell.border = {
              bottom: { style: 'thin' },
            };
          }
        }
      );
    });
  });

  ws.getColumn(1).width = 15;
  ws.getColumn(2).width = 20;
  ws.getColumn(3).width = 15;
  ws.getColumn(4).width = 25;
  ws.getColumn(5).width = 15;
  ws.getColumn(6).width = 15;
  // detail
  ws.getColumn(7).width = 30;
  ws.getColumn(8).width = 15;
  ws.getColumn(9).width = 15;
  ws.getColumn(10).width = 15;
  ws.getColumn(11).width = 40;

  return await wb.xlsx.writeBuffer();
}
