import { LoginModel } from "@/types/login.type";
import { db } from "@/utils/prisma";
import { saveSession } from "@/utils/sessionlib";
import { compare } from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const data: LoginModel = new LoginModel(await request.json());
  // const hashPassword = await hash(data.password, 10);

  // await db.user.create({
  //   data: {
  //     username: 'admin123',
  //     name: 'Derick',
  //     password: hashPassword,
  //     role: 'Admin'
  //   }
  // })

  const validatedData = data.validate();

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
    const user = await db.user.findUnique({
      where: { username: data.username },
    });

    // if username not found on db
    if (!user) {
      return NextResponse.json(
        { message: "Username tidak ditemukan." },
        { status: 404 }
      );
    }

    // compare plain input password with hashed db password
    const passwordMatch = await compare(data.password, user.password);

    // if password doesn't match
    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Password Anda salah." },
        { status: 401 }
      );
    }

    // if account status is not active
    if (!user.accountStatus) {
      return NextResponse.json(
        { message: "Akun telah di-nonaktifkan." },
        { status: 401 }
      );
    }

    await saveSession({
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
    });
    return NextResponse.json({ message: "Credentials valid" }, { status: 200 });
  } catch (e) {
    console.log("checkCredential Error: " + e);
    return NextResponse.json(
      { message: "Internal Server Error." },
      { status: 500 }
    );
  }
}
