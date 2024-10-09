import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { NextResponse } from 'next/server';

// ChangeUserStatus
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  const { id } = params;

  try {
    const updatedUser = await db.users.update({
      where: { id },
      data: {
        accountStatus: {
          set: !(
            await db.users.findUnique({
              where: { id },
              select: { accountStatus: true },
            })
          )?.accountStatus,
        },
      },
    });

    if (!updatedUser) {
      return NextResponse.json({ message: 'Status Akun Gagal Diupdate Karena Tidak Ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Status Akun Berhasil Diupdate' }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
