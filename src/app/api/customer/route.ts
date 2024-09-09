import { CustomerTableFilters } from "@/app/(menus)/master/customer/(data)/filter";
import { CustomerModel } from "@/models/customer.model";
import { db } from "@/utils/prisma";
import { getSession } from "@/utils/sessionlib";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);

  const pageIndex = Number(queryParams.get('pageIndex')) ?? 0;
  const pageSize = Number(queryParams.get('pageSize')) ?? 10;
  const sortOrder = queryParams.get('sortOrder') ?? 'desc';
  const sortColumn = queryParams.get('sortColumn') ?? 'createdAt';

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

  try {
    const customers = await db.customer.findMany({
      skip: pageIndex * pageSize,
      take: pageSize,
      orderBy: {
        [sortColumn]: sortOrder
      },
      where,
    });
    
    const recordsTotal = await db.customer.count({ where });

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

export async function POST(request: Request) {
  const data: CustomerModel = new CustomerModel(await request.json());

  const validatedData = data.validate();

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

    // retreive last customer code
    const lastCustomer = await db.customer.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { code: true}
    });

    let newCode = 'CUS00000001'; // default code

    if (lastCustomer) {
      const lastCodeNumber = parseInt(lastCustomer.code.replace('CUS', ''), 10);
      newCode = 'CUS' + (lastCodeNumber + 1).toString().padStart(8, '0');
    }

    const customer = await db.customer.create({
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