import { db } from "@/utils/prisma";
import { compare, hash } from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const data: { username: string; password: string } = await request.json();
  // const hashPassword = await hash(data.password, 10);

  // await db.user.create({
  //   data: {
  //     username: 'admin123',
  //     name: 'Derick',
  //     password: hashPassword,
  //     role: 'Admin'
  //   }
  // })

  // if username or password is empty
  if (!data.username || !data.password) {
    return NextResponse.json(
      { message: "Username dan Password harus diisi" },
      { status: 400 }
    );
  }

  try {
    const user = await db.user.findUnique({
      where: { username: data.username },
    });

    // if username not found on db
    if (!user) {
      return NextResponse.json(
        { message: "Username tidak ditemukan" },
        { status: 404 }
      );
    }

    // compare plain input password with hashed db password
    const passwordMatch = await compare(data.password, user.password);

    // if password doesn't match
    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Password Anda salah" },
        { status: 401 }
      );
    }

    // if account status is not active
    if (!user.accountStatus) {
      return NextResponse.json(
        { message: "Akun telah di-nonaktifkan" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: "Credentials valid", 
        result: {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
        } 
      }, 
      { status: 200 },
    );
  } catch (e) {
    console.log("checkCredential Error: " + e);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 200 }
    );
  }
}
