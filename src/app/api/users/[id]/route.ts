import { UpdateUserSchema } from '@/models/user.model';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { compare, hash } from 'bcryptjs';
import { NextResponse } from 'next/server';

// GetUserById
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
    const user = await db.users.findUnique({
      where: { id: id },
      select: {
        id: true,
        name: true,
        username: true,
        accountStatus: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Success', result: user }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}

// UpdateUser
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json(
      { message: 'Unauthorized, mohon melakukan login ulang', result: null, recordsTotal: 0 },
      { status: 401 }
    );
  }

  const { id } = params;

  const validationRes = UpdateUserSchema.safeParse(await request.json());
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
    const user = await db.users.findUnique({
      where: { id },
      select: { password: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });
    }

    // compare plain input password with hashed db password
    const passwordMatched = await compare(data.oldPassword, user.password);

    if (!passwordMatched) {
      return NextResponse.json({ message: 'Password Lama tidak sesuai' }, { status: 401 });
    }

    const hashedPassword = await hash(data.newPassword, 10);

    const updatedUser = await db.users.update({
      where: { id },
      data: {
        name: data.name,
        username: data.username,
        password: hashedPassword,
        role: data.role,
      },
    });

    if (!updatedUser) {
      return NextResponse.json({ message: 'Data User Gagal Diupdate Karena Tidak Ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Data User Berhasil Diupdate' }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
