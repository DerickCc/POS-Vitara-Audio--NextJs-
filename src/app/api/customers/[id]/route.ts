import { CustomerModel, CustomerSchema } from '@/models/customer.model';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { NextResponse } from 'next/server';

// GetCustomerById
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json(
      { message: 'Unauthorized, mohon melakukan login ulang', result: null, recordsTotal: 0 },
      { status: 401 }
    );
  }

  const { id } = params;

  try {
    const customer = await db.customers.findUnique({
      where: { id },
    });

    if (!customer) {
      return NextResponse.json({ message: 'Pelanggan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Success', result: customer }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}

// UpdateCustomer
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json(
      { message: 'Unauthorized, mohon melakukan login ulang', result: null, recordsTotal: 0 },
      { status: 401 }
    );
  }

  const { id } = params;

  const validationRes = CustomerSchema.safeParse(await request.json());
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

    const updatedCustomer = await db.customers.update({
      where: { id },
      data: {
        ...data,
        UpdatedBy: {
          connect: { id: userId },
        },
      },
    });

    if (!updatedCustomer) {
      return NextResponse.json({ message: 'Data Pelanggan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Data Pelanggan berhasil diupdate' }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}

// DeleteCustomer
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const deletedCustomer = await db.customers.delete({
      where: { id },
    });

    if (!deletedCustomer) {
      return NextResponse.json({ message: 'Data Pelanggan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Data Pelanggan berhasil dihapus' }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
