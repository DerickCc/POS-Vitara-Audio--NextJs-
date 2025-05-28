import { LoginSchema } from '@/models/session.model';
import { db } from '@/utils/prisma';
import { saveSession } from '@/utils/sessionlib';
import { compare } from 'bcryptjs';
import { NextResponse } from 'next/server';

// CheckCredentials
export async function POST(request: Request) {
  const validationRes = LoginSchema.safeParse(await request.json());
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
      where: { username: data.username },
    });

    // if username not found on db
    if (!user) {
      return NextResponse.json({ message: 'Username tidak ditemukan.' }, { status: 404 });
    }

    // compare plain input password with hashed db password
    const passwordMatched = await compare(data.password, user.password);

    // if password doesn't match
    if (!passwordMatched) {
      return NextResponse.json({ message: 'Password Anda salah.' }, { status: 401 });
    }

    // if account status is not active
    if (!user.accountStatus) {
      return NextResponse.json({ message: 'Akun telah di-nonaktifkan.' }, { status: 401 });
    }

    await saveSession({
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
    });
    return NextResponse.json({ message: 'Login berhasil! Selamat datang, ' + user.name + '.' }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
