import { CreateUserSchema } from '@/models/user.model';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { hash } from 'bcryptjs';
import { NextResponse } from 'next/server';

// BrowseUser
export async function GET(request: Request) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json(
      { message: 'Unauthorized, mohon melakukan login ulang', result: null, recordsTotal: 0 },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);

  const pageIndex = Number(queryParams.get('pageIndex')) ?? 0;
  const pageSize = Number(queryParams.get('pageSize')) ?? 10;
  const sortOrder = queryParams.get('sortOrder') ?? 'desc';
  const sortColumn = queryParams.get('sortColumn') ?? 'createdAt';

  // filters
  const name = queryParams.get('name') ?? '';
  const accountStatus =
    queryParams.get('accountStatus') === 'true' ? true : queryParams.get('accountStatus') === 'false' ? false : null;
  const role = queryParams.get('role') ?? '';

  const where: any = {};
  if (name) {
    // full text search
    const searchTerm = name.split(' ').filter((term) => term);

    if (searchTerm.length > 0) {
      where['AND'] = searchTerm.map((term) => ({
        name: {
          contains: term,
          mode: 'insensitive',
        },
      }));
    }
  }

  if (accountStatus !== null) {
    where['AND'] = [
      ...(where['AND'] || []),
      {
        accountStatus,
      },
    ];
  }

  if (role) {
    where['AND'] = [
      ...(where['AND'] || []),
      {
        role: {
          contains: role,
          mode: 'insensitive',
        },
      },
    ];
  }
  // ----------------

  try {
    const [users, recordsTotal] = await Promise.all([
      db.users.findMany({
        skip: pageIndex * pageSize,
        take: pageSize,
        orderBy: {
          [sortColumn]: sortOrder,
        },
        where,
      }),
      await db.users.count({ where }),
    ]);

    return NextResponse.json({ message: 'Success', result: users, recordsTotal }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { message: 'Internal Server Error: ' + e, result: null, recordsTotal: 0 },
      { status: 500 }
    );
  }
}

// CreateUser
export async function POST(request: Request) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json(
      { message: 'Unauthorized, mohon melakukan login ulang', result: null, recordsTotal: 0 },
      { status: 401 }
    );
  }

  const validationRes = CreateUserSchema.safeParse(await request.json());
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
    const hashedPassword = await hash(data.password, 10);

    const user = await db.users.create({
      data: {
        name: data.name,
        username: data.username,
        password: hashedPassword,
        accountStatus: data.accountStatus,
        role: data.role,
      },
    });

    return NextResponse.json({ message: 'Data User Berhasil Disimpan' }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
