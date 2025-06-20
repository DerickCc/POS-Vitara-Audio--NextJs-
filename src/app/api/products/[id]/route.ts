import { ProductSchema } from '@/models/product.model';
import { encodePurchasePrice } from '@/utils/encode-purchase-price';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

// GetProductById
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json({ message: 'Unauthorized, mohon melakukan login ulang' }, { status: 401 });
  }

  const { id } = params;

  try {
    const product = await db.products.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ message: 'Barang tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Success', result: product }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}

// UpdateProduct
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json(
      { message: 'Unauthorized, mohon melakukan login ulang', result: null, recordsTotal: 0 },
      { status: 401 }
    );
  }

  const { id } = params;

  const validationRes = ProductSchema.safeParse(await request.json());
  // if validation failed
  if (!validationRes.success) {
    return NextResponse.json(
      {
        message: 'Terdapat kesalahan pada data yang dikirim.',
        error: validationRes.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const data = validationRes.data;

  try {
    const userId = session.id;

    const updatedProduct = await db.products.update({
      where: { id: id },
      data: {
        ...data,
        purchasePriceCode: await encodePurchasePrice(data.purchasePrice),
        sellingPrice: data.type === 'Barang Jadi' ? data.sellingPrice : 0,
        UpdatedBy: {
          connect: { id: userId },
        },
      },
    });

    if (!updatedProduct) {
      return NextResponse.json({ message: 'Data Barang Gagal Diupdate Karena Tidak Ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Data Barang Berhasil Diupdate' }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}

// DeleteProduct
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json(
      { message: 'Unauthorized, mohon melakukan login ulang', result: null, recordsTotal: 0 },
      { status: 401 }
    );
  }

  const { id } = params;

  try {
    const deletedProduct = await db.products.delete({
      where: { id: id },
    });

    if (!deletedProduct) {
      return NextResponse.json({ message: 'Data Barang Gagal Dihapus Karena Tidak Ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Data Barang Berhasil Dihapus' }, { status: 200 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2003') {
        return NextResponse.json(
          { message: 'Barang tidak dapat dihapus karena telah memiliki transaksi terkait' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
