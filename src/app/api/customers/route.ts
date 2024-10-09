import { CustomerModel, CustomerSchema } from "@/models/customer.model";
import { db } from "@/utils/prisma";
import { getSession } from "@/utils/sessionlib";
import { NextResponse } from "next/server";

// BrowseCustomer
export async function GET(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);

  const pageIndex = Number(queryParams.get('pageIndex')) ?? 0;
  const pageSize = Number(queryParams.get('pageSize')) ?? 10;
  const sortOrder = queryParams.get('sortOrder') ?? 'desc';
  const sortColumn = queryParams.get('sortColumn') ?? 'createdAt';

  // filters
  const name = queryParams.get('name') ?? '';
  const licensePlate = queryParams.get('licensePlate') ?? '';
  const phoneNo = queryParams.get('phoneNo') ?? '';

  const where: any = {};
  if (name) { // full text search
    const searchTerm = name.split(' ').filter(term => term);

    if (searchTerm.length > 0) {
      where["AND"] = searchTerm.map(term => ({
        name: {
          contains: term,
          mode: 'insensitive',
        },
      }));
    }
  }

  if (licensePlate) {
    where["AND"] = [
      ...(where["AND"] || []),
      {
        licensePlate: {
          contains: licensePlate,
          mode: 'insensitive',
        }
      }
    ];
  }

  if (phoneNo) {
    where["AND"] = [
      ...(where["AND"] || []),
      {
        phoneNo: {
          contains: phoneNo,
          mode: 'insensitive',
        }
      }
    ];
  }
  // ----------------

  try {
    const customers = await db.customers.findMany({
      skip: pageIndex * pageSize,
      take: pageSize,
      orderBy: {
        [sortColumn]: sortOrder
      },
      where,
    });
    
    const recordsTotal = await db.customers.count({ where });

    return NextResponse.json(
      { message: 'Success', result: customers, recordsTotal },
      { status: 200 }
    )
  } catch (e) {
    return NextResponse.json(
      { message: "Internal Server Error: " + e, result: null, recordsTotal: 0 },
      { status: 500 }
    );
  }
}

// CreateCustomer
export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const validationRes = CustomerSchema.safeParse(await request.json());
  // if validation failed
  if (!validationRes.success) {
    return NextResponse.json(
      {
        message: "Terdapat kesalahan pada data yang dikirim.",
        error: validationRes.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const data = validationRes.data;

  try {
    const userId = (await getSession()).id;

    // retreive last customer code
    const lastCustomer = await db.customers.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { code: true}
    });

    let newCode = 'CUS00000001'; // default code

    if (lastCustomer) {
      const lastCodeNumber = parseInt(lastCustomer.code.replace('CUS', ''), 10);
      newCode = 'CUS' + (lastCodeNumber + 1).toString().padStart(8, '0');
    }

    const customer = await db.customers.create({
      data: {
        code: newCode,
        name: data.name,
        licensePlate: data.licensePlate,
        phoneNo: data.phoneNo,
        address: data.address,
        CreatedBy: {
          connect: { id: userId }
        }
      }
    });
    return NextResponse.json({ message: "Data Pelanggan Berhasil Disimpan" }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { message: "Internal Server Error: " + e },
      { status: 500 }
    );
  }
}