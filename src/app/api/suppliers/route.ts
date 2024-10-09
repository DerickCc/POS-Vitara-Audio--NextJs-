import { SupplierModel, SupplierSchema } from "@/models/supplier.model";
import { db } from "@/utils/prisma";
import { getSession } from "@/utils/sessionlib";
import { NextResponse } from "next/server";

// BrowseSupplier
export async function GET(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized', result: null, recordsTotal: 0 }, { status: 401 });
  }

  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);

  const pageIndex = Number(queryParams.get('pageIndex')) ?? 0;
  const pageSize = Number(queryParams.get('pageSize')) ?? 10;
  const sortOrder  = queryParams.get('sortOrder') ?? 'desc';
  const sortColumn   = queryParams.get('sortColumn') ?? 'createdAt';

  // filters
  const name = queryParams.get('name') ?? '';
  const pic =  queryParams.get('pic') ?? '';
  const phoneNo =  queryParams.get('phoneNo') ?? '';
  const receivablesOperator =  queryParams.get('receivablesOperator') ?? 'gte';
  const receivables =  Number(queryParams.get('receivables')) ?? 0;

  const where: any = {};
  if (name) { // full text search
    const searchTerm = name.split(' ').filter(term => term);

    if (searchTerm.length > 0) {
      where['AND'] = searchTerm.map(term => ({
        name: {
          contains: term,
          mode: 'insensitive',
        },
      }));
    }
  }

  if (pic) { // full text search
    const searchTerm = pic.split(' ').filter(term => term);

    if (searchTerm.length > 0) {
      where['AND'] = searchTerm.map(term => ({
        pic: {
          contains: term,
          mode: 'insensitive',
        },
      }));
    }
  }

  if (phoneNo) {
    where['AND'] = [
      ...(where['AND'] || []),
      {
        phoneNo: {
          contains: phoneNo,
          mode: 'insensitive',
        }
      }
    ];
  }

  if (receivables > 0) {
    where['AND'] = [
      ...(where['AND'] || []),
      {
        receivables: {
          [receivablesOperator]: receivables // gte: xxx or let: xxx
        }
      }
    ]
  }
  // ----------------

  try {
    const suppliers = await db.suppliers.findMany({
      skip: pageIndex * pageSize,
      take: pageSize,
      orderBy: {
        [sortColumn]: sortOrder
      },
      where,
    });
    
    const recordsTotal = await db.suppliers.count({ where });

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

// CreateSupplier
export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const validationRes = SupplierSchema.safeParse(await request.json());
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
    if (data.receivables > data.receivablesLimit) {
      return NextResponse.json(
        { message: "Piutang tidak boleh lebih besar dari Limit Piutang" },
        { status: 400 }
      );
    }

    const userId = session.id;

    // retreive last supplier code
    const lastSupplier = await db.suppliers.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { code: true}
    });

    let newCode = 'SUP00000001'; // default code

    if (lastSupplier) {
      const lastCodeNumber = parseInt(lastSupplier.code.replace('SUP', ''), 10);
      newCode = 'SUP' + (lastCodeNumber + 1).toString().padStart(8, '0');
    }

    const supplier = await db.suppliers.create({
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