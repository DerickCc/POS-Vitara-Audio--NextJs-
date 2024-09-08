import { SupplierTableFilters } from "@/app/(menus)/master/supplier/(data)/filters";
import { SupplierModel } from "@/models/supplier.model";
import { db } from "@/utils/prisma";
import { getSession } from "@/utils/sessionlib";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);

  const pageIndex = Number(queryParams.get('pageIndex')) ?? 0;
  const pageSize = Number(queryParams.get('pageSize')) ?? 10;
  const sortOrder  = queryParams.get('sortOrder') ?? 'desc';
  const sortColumn   = queryParams.get('sortColumn') ?? 'createdAt';

  const filters: SupplierTableFilters = {
    name: queryParams.get('name') ?? '',
    pic: queryParams.get('pic') ?? '',
    phoneNo: queryParams.get('phoneNo') ?? '',
    receivables: Number(queryParams.get('receivables')) ?? 0
  } as SupplierTableFilters

  const where = Object.entries(filters)
    .filter(([_, value]) => value)
    .reduce((acc, [key, value]) => {
      acc[key] = {
        contains: value,
        mode: 'insensitive'
      };

      return acc
    }, {} as any);

  try {
    const suppliers = await db.supplier.findMany({
      skip: pageIndex * pageSize,
      take: pageSize,
      orderBy: {
        [sortColumn]: sortOrder
      },
      where,
    });
    
    const recordsTotal = await db.supplier.count({ where });

    return NextResponse.json(
      { message: 'Success', result: suppliers, recordsTotal },
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
  const data: SupplierModel = new SupplierModel(await request.json());

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

    // retreive last supplier code
    const lastSupplier = await db.supplier.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { code: true}
    });

    let newCode = 'SUP00000001'; // default code

    if (lastSupplier) {
      const lastCodeNumber = parseInt(lastSupplier.code.replace('SUP', ''), 10);
      newCode = 'SUP' + (lastCodeNumber + 1).toString().padStart(8, '0');
    }

    const supplier = await db.supplier.create({
      data: {
        code: newCode,
        name: data.name,
        pic: data.pic,
        phoneNo: data.phoneNo,
        address: data.address,
        remarks: data.remarks,
        receivablesLimit: data.receivablesLimit,
        CreatedBy: {
          connect: { id: userId }
        }
      }
    });
    return NextResponse.json({ message: "Data Supplier Berhasil Disimpan" }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { message: "Internal Server Error: " + e },
      { status: 500 }
    );
  }
}