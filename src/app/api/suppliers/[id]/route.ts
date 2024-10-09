import { SupplierModel, SupplierSchema } from '@/models/supplier.model';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { NextResponse } from 'next/server';

// GetSupplierById
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const supplier = await db.suppliers.findUnique({
      where: { id: id },
    });

    if (!supplier) {
      return NextResponse.json({ message: 'Supplier tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Success', result: supplier }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}

// UpdateSupplier
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  const validationRes = SupplierSchema.safeParse(await request.json());
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
    if (data.receivables > data.receivablesLimit) {
      return NextResponse.json({ message: 'Piutang tidak boleh lebih besar dari Limit Piutang' }, { status: 400 });
    }

    const userId = (await getSession()).id;

    const updatedSupplier = await db.suppliers.update({
      where: { id },
      data: {
        ...data,
        UpdatedBy: {
          connect: { id: userId },
        },
      },
    });

    if (!updatedSupplier) {
      return NextResponse.json({ message: 'Data Supplier Gagal Diupdate Karena Tidak Ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Data Supplier Berhasil Diupdate' }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}

// DeleteSupplier
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const deletedSupplier = await db.suppliers.delete({
      where: { id: id },
    });

    if (!deletedSupplier) {
      return NextResponse.json({ message: 'Data Supplier Gagal Dihapus Karena Tidak Ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Data Supplier Berhasil Dihapus' }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
