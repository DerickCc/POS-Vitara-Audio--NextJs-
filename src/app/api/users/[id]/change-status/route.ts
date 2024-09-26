import { UpdateAccountStatusSchema, UpdateUserModel } from "@/models/user.model";
import { db } from "@/utils/prisma";
import { NextResponse } from "next/server";

// ChangeUserStatus
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const data: { accountStatus: boolean } = await request.json();

  const validatedData = UpdateAccountStatusSchema.safeParse(data);
  
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
    const updatedUser = await db.users.update({
      where: { id: id },
      data: {
        accountStatus: data.accountStatus
      },
    });
    
    if (!updatedUser) {
      return NextResponse.json({ message: 'Status Akun User Gagal Diupdate Karena Tidak Ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Status Akun User Berhasil Diupdate' }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}