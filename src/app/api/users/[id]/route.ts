import { UpdateUserModel } from "@/models/user.model";
import { db } from "@/utils/prisma";
import { NextResponse } from "next/server";

// GetUserById
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const user = await db.users.findUnique({
      where: { id: id },
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
  const { id } = params;
  const data: UpdateUserModel = new UpdateUserModel(await request.json());
  
  try {
    const user = await db.users.findUnique({
      where: { id },
      select: { password: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });
    }

    const currPassword = user.password;

    if (currPassword !== data.oldPassword) {
      return NextResponse.json(
        { message: "Password Lama tidak sesuai" },
        { status: 401 }
      );
    }
    
    const updatedUser = await db.users.update({
      where: { id: id },
      data: {
        name: data.name,
        username: data.username,
        password: data.newPassword,
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
