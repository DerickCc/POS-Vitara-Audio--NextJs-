import { CustomerModel, CustomerSchema } from '@/models/customer.model';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { NextResponse } from 'next/server';

// GetCustomerById
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  const { id } = params;

  try {
    const customer = await db.customers.findUnique({
      where: { id: id },
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

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  const data: CustomerModel = new CustomerModel(await request.json());

  const validatedData = CustomerSchema.safeParse(data);
  // if validation failed
  if (!validatedData.success) {
    return NextResponse.json(
      {
        message: "Terdapat kesalahan pada data yang dikirim.",
        error: validatedData.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }
  
  try {
    const userId = (await getSession()).id;
    
    const updatedCustomer = await db.customers.update({
      where: { id: id },
      data: {
        ...data,
        UpdatedBy: {
          connect: { id: userId }
        }
      },
    });
    
    if (!updatedCustomer) {
      return NextResponse.json({ message: 'Data Pelanggan Gagal Diupdate Karena Tidak Ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Data Pelanggan Berhasil Diupdate' }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}

// DeleteCustomer
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  
  try {
    const deletedCustomer = await db.customers.delete({
      where: { id: id }
    });

    if (!deletedCustomer) {
      return NextResponse.json({ message: 'Data Pelanggan Gagal Dihapus Karena Tidak Ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Data Pelanggan Berhasil Dihapus' }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
