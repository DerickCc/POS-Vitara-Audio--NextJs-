import { ProductSchema } from '@/models/product.model';
import { encodePurchasePrice } from '@/utils/encode-purchase-price';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { NextResponse } from 'next/server';

// BrowseProduct
export async function GET(request: Request) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json(
      { message: 'Unauthorized, mohon melakukan login ulang', result: null, recordsTotal: 0 },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);

  const pageIndex = Number(queryParams.get('pageIndex')) ?? 0;
  const pageSize = Number(queryParams.get('pageSize')) ?? 10;
  const sortOrder = queryParams.get('sortOrder') ?? 'desc';
  const sortColumn = queryParams.get('sortColumn') ?? 'createdAt';

  // filters
  const name = queryParams.get('name') ?? '';
  const stockOperator = queryParams.get('stockOperator') ?? 'gte';
  const stock = Number(queryParams.get('stock')) ?? 0;
  const uom = queryParams.get('uom') ?? '';

  const where: any = {};
  if (name) {
    const searchTerms = name.trim().split(' ').filter(term => term);
    const formattedQuery = searchTerms.map(term => term + ':*').join(' & ');

    if (formattedQuery) {
      where.name = {
        search: formattedQuery,
      };
    }
  }

  if (stock > 0) {
    where['AND'] = [
      ...(where['AND'] || []),
      {
        stock: {
          [stockOperator]: stock, // gte: xx or lte: xx
        },
      },
    ];
  }

  if (uom) {
    where['AND'] = [
      ...(where['AND'] || []),
      {
        uom: {
          contains: uom,
          mode: 'insensitive',
        },
      },
    ];
  }
  // ----------------

  try {
    const [products, recordsTotal] = await Promise.all([
      db.products.findMany({
        skip: pageIndex * pageSize,
        take: pageSize,
        orderBy: {
          [sortColumn]: sortOrder,
        },
        where,
      }),
      await db.products.count({ where }),
    ]);

    return NextResponse.json({ message: 'Success', result: products, recordsTotal }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { message: 'Internal Server Error: ' + e, result: null, recordsTotal: 0 },
      { status: 500 }
    );
  }
}

// CreateProduct
export async function POST(request: Request) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json({ message: 'Unauthorized, mohon melakukan login ulang' }, { status: 401 });
  }

  const validationRes = ProductSchema.safeParse(await request.json());
  // if validation failed
  if (!validationRes.success) {
    return NextResponse.json(
      {
        message: 'Terdapat kesalahan pada data yang dikirim',
        error: validationRes.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const data = validationRes.data;

  try {
    const userId = session.id;

    // retreive last product code
    const lastProduct = await db.products.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { code: true },
    });

    let newCode = 'PRD00000001'; // default code

    if (lastProduct) {
      const lastCodeNumber = parseInt(lastProduct.code.replace('PRD', ''), 10);
      newCode = 'PRD' + (lastCodeNumber + 1).toString().padStart(8, '0');
    }

    const product = await db.products.create({
      data: {
        ...data,
        code: newCode,
        purchasePriceCode: await encodePurchasePrice(data.purchasePrice),
        CreatedBy: {
          connect: { id: userId },
        },
      },
    });

    return NextResponse.json({ message: 'Data Barang Berhasil Disimpan' }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
