import { formatToReadableNumber } from '@/utils/helper-function';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Workbook } from 'exceljs';
import { NextResponse } from 'next/server';

// ExportProductExcel
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

  const type = queryParams.get('type') ?? 'excel';

  if (type !== 'excel' && type !== 'csv') {
    return NextResponse.json({ message: 'Tipe export tidak valid' }, { status: 401 });
  }

  const sortOrder = queryParams.get('sortOrder') ?? 'desc';
  const sortColumn = queryParams.get('sortColumn') ?? 'createdAt';

  // filters
  const name = queryParams.get('name') ?? '';
  const stockOperator = queryParams.get('stockOperator') ?? 'gte';
  const stock = Number(queryParams.get('stock')) ?? 0;
  const uom = queryParams.get('uom') ?? '';

  const where: any = { AND: [] };
  if (name) {
    // full text search
    const searchTerm = name.split(' ').filter((term) => term);

    if (searchTerm.length > 0) {
      searchTerm.forEach((term) => {
        where.AND.push({
          name: {
            contains: term,
            mode: 'insensitive',
          },
        });
      });
    }
  }

  if (stock > 0) {
    where.AND.push({
      stock: {
        [stockOperator]: stock,
      },
    });
  }

  if (uom) {
    where.AND.push({
      uom: {
        contains: uom,
        mode: 'insensitive',
      },
    });
  }
  // ----------------

  try {
    const products = await db.products.findMany({
      orderBy: {
        [sortColumn]: sortOrder,
      },
      where,
      select: {
        code: true,
        name: true,
        type: true,
        stock: true,
        restockThreshold: true,
        uom: true,
        costPrice: true,
        purchasePrice: true,
        purchasePriceCode: true,
        sellingPrice: true,
        remarks: true,
      },
    });

    const isExcel = type === 'excel';
    const buffer = isExcel ? await exportProductsToExcel(products) : exportProductsToCSV(products);

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': isExcel ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv',
        'Content-Disposition': `attachment; filename="DaftarBarang.${isExcel ? 'xlsx' : 'csv'}"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}

async function exportProductsToExcel(data: any[]) {
  const title = `Daftar Barang`;

  const wb = new Workbook();
  const ws = wb.addWorksheet('Daftar Barang');

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
    'Nama',
    'Tipe',
    'Stok',
    'Batas Ambang Restok',
    'Satuan',
    'Harga Model',
    'Harga Beli',
    'Kode Harga Beli',
    'Harga Jual',
    'Keterangan',
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

  data.forEach((d, i) => {
    ws.addRow([
      d.code,
      d.name,
      d.type,
      Number(d.stock),
      Number(d.restockThreshold),
      d.uom,
      'Rp ' + formatToReadableNumber(d.costPrice),
      'Rp ' + formatToReadableNumber(d.purchasePrice),
      d.purchasePriceCode,
      'Rp ' + formatToReadableNumber(d.sellingPrice),
      d.remarks || '-',
    ]).eachCell((cell) => {
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

      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  ws.getColumn(1).width = 20;
  ws.getColumn(2).width = 40;
  ws.getColumn(3).width = 15;
  ws.getColumn(4).width = 15;
  ws.getColumn(5).width = 15;
  ws.getColumn(6).width = 15;
  ws.getColumn(7).width = 20;
  ws.getColumn(8).width = 20;
  ws.getColumn(9).width = 15;
  ws.getColumn(10).width = 20;
  ws.getColumn(11).width = 50;

  return await wb.xlsx.writeBuffer();
}

function exportProductsToCSV(data: any[]) {
  const headers = [
    'Kode',
    'Nama',
    'Tipe',
    'Stok',
    'Batas Ambang Restok',
    'Satuan',
    'Harga Model',
    'Harga Beli',
    'Kode Harga Beli',
    'Harga Jual',
    'Keterangan',
  ];

  const rows = data.map((d) => [
    d.code,
    d.name,
    d.type,
    d.stock,
    d.restockThreshold,
    d.uom,
    `Rp ${formatToReadableNumber(d.costPrice)}`,
    `Rp ${formatToReadableNumber(d.purchasePrice)}`,
    d.purchasePriceCode,
    `Rp ${formatToReadableNumber(d.sellingPrice)}`,
    d.remarks || '-',
  ]);

  return [headers, ...rows].map((row) => row.join(',')).join('\n');
}
