import { CustomerTableFilters } from "@/app/(menus)/master/customer/(data)/filter";
import { db } from "@/utils/prisma";
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