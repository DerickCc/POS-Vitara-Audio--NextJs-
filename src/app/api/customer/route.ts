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
  const sortOrder  = queryParams.get('sortOrder') ?? 'desc';
  const sortColumn   = queryParams.get('sortColumn') ?? 'createdAt';

  const filters: CustomerTableFilters = {
    name: queryParams.get('name') ?? '',
    licensePlate: queryParams.get('licensePlate') ?? '',
    phoneNo: queryParams.get('phoneNo') ?? '',
  }

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
    const result = await db.customer.findMany({
      skip: pageIndex * pageSize,
      take: pageSize,
      orderBy: {
        [sortColumn]: sortOrder
      },
      where,
    });
    
    const recordsTotal = await db.customer.count({ where });

    return NextResponse.json(
      { message: 'Success', result, recordsTotal },
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
  console.log(data)
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
    // const customer = await db.customer.create({
    //   data: {
    //     name: data.name,
    //     licensePlate: data.licensePlate,
    //     phoneNo: data.phoneNo,
    //     address: data.address,
    //     User: 
    //   }
    // })
  } catch (e) {
    return NextResponse.json(
      { message: "Internal Server Error: " + e },
      { status: 500 }
    );
  }
}