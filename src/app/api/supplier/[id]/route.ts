import { SupplierModel } from '@/models/supplier.model';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const supplier = await db.supplier.findUnique({
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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const data: SupplierModel = new SupplierModel(await request.json());
  
  try {
    if (data.receivables > data.receivablesLimit) {
      return NextResponse.json(
        { message: "Piutang tidak boleh lebih besar dari Limit Piutang" },
        { status: 400 }
      );
    }
    
    const userId = (await getSession()).id;
    
    const updatedSupplier = await db.supplier.update({
      where: { id: id },
      data: {
        ...data,
        UpdatedBy: {
          connect: { id: userId }
        }
      },
    });
    
    if (!updatedSupplier) {
      return NextResponse.json({ message: 'Data Supplier Gagal Diupdate' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Data Supplier Berhasil Diupdate' }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  
  try {
    const deletedSupplier = await db.supplier.delete({
      where: { id: id }
    });

    if (!deletedSupplier) {
      return NextResponse.json({ message: 'Data Supplier Gagal Dihapus' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Data Supplier Berhasil Dihapus' }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
