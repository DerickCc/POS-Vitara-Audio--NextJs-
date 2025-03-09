import { SalesReturnSchema } from '@/models/sales-return.model';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server';

// BrowseSalesReturns
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
  const code = queryParams.get('code') ?? '';
  const customerId = queryParams.get('customerId') ?? 0;
  const startDate = queryParams.get('startDate') ?? '';
  const endDate = queryParams.get('endDate') ?? '';
  const soCode = queryParams.get('soCode') ?? '';
  const status = queryParams.get('status') ?? '';

  const where: any = { AND: [] };
  if (code) {
    where.AND.push({
      code: {
        contains: code,
        mode: 'insensitive',
      },
    });
  }

  if (customerId) {
    where.AND.push({
      SalesOrder: { customerId },
    });
  }

  if (startDate) {
    const startOfDay = new Date(startDate);

    where.AND.push({
      returnDate: {
        gte: startOfDay,
      },
    });
  }

  if (endDate) {
    const durationToEndOfDay =
      23 * 60 * 60 * 1000 + // Convert hours to milliseconds
      59 * 60 * 1000 + // Convert minutes to milliseconds
      59 * 1000 + // Convert seconds to milliseconds
      999;
    const endOfDay = new Date(new Date(endDate).getTime() + durationToEndOfDay);

    where.AND.push({
      returnDate: {
        lte: endOfDay,
      },
    });
  }

  if (soCode) {
    where.AND.push({
      SalesOrder: {
        code: {
          contains: soCode,
          mode: 'insensitive',
        },
      },
    });
  }

  if (status) {
    where.AND.push({ status });
  }
  // ----------------

  let orderBy;
  if (sortColumn === 'customerName') {
    orderBy = {
      SalesOrder: {
        Customer: {
          name: sortOrder as Prisma.SortOrder,
        },
      },
    };
  } else if (sortColumn === 'soCode') {
    orderBy = {
      SalesOrder: {
        code: sortOrder as Prisma.SortOrder,
      },
    };
  } else {
    orderBy = { [sortColumn]: sortOrder };
  }

  try {
    const [salesReturns, recordsTotal] = await Promise.all([
      db.salesReturns.findMany({
        skip: pageIndex * pageSize,
        take: pageSize,
        orderBy,
        where,
        include: {
          SalesOrder: {
            select: {
              Customer: {
                select: { name: true, licensePlate: true, },
              },
              code: true,
            },
          },
        },
      }),
      await db.salesReturns.count({ where }),
    ]);

    const mappedSalesReturns = salesReturns.map((pr) => ({
      ...pr,
      customerName: pr.SalesOrder.Customer.name,
      customerLicensePlate: pr.SalesOrder.Customer.licensePlate,
      soCode: pr.SalesOrder.code,
      SalesOrder: undefined,
    }));

    return NextResponse.json({ message: 'Success', result: mappedSalesReturns, recordsTotal }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { message: 'Internal Server Error: ' + e, result: null, recordsTotal: 0 },
      { status: 500 }
    );
  }
}

// CreateSalesReturn
export async function POST(request: Request) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json(
      { message: 'Unauthorized, mohon melakukan login ulang', result: null, recordsTotal: 0 },
      { status: 401 }
    );
  }

  const validationRes = SalesReturnSchema.safeParse(await request.json());

  // if validation failed
  if (!validationRes.success) {
    return NextResponse.json(
      {
        message: 'Terdapat kesalahan pada data yang dikirim',
        error: validationRes.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const data = validationRes.data;

  try {
    const userId = session.id;
    const grandTotal = data.productDetails.reduce((acc, d) => {
      return acc + d.returnPrice * d.returnQuantity;
    }, 0);

    // retreive last sr code
    const lastSr = await db.salesReturns.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { code: true },
    });

    let newCode = 'SR00000001'; // default code

    if (lastSr) {
      const lastCodeNumber = parseInt(lastSr.code.replace('SR', ''), 10);
      newCode = 'SR' + (lastCodeNumber + 1).toString().padStart(8, '0');
    }

    const returnDate = new Date().toISOString();

    await db.$transaction(async (prisma) => {
      const sr = await prisma.salesReturns.create({
        data: {
          code: newCode,
          SalesOrder: {
            connect: { id: data.soId },
          },
          returnDate,
          grandTotal,
          CreatedBy: {
            connect: { id: userId },
          },
        },
      });

      // handle productDetails
      if (data.productDetails.length > 0) {
        await prisma.salesReturnProductDetails.createMany({
          data: data.productDetails.map((d) => ({
            srId: sr.id,
            sopdId: d.sopdId,
            returnPrice: d.returnPrice,
            returnQuantity: d.returnQuantity,
            reason: d.reason,
            createdBy: userId,
          })),
        });
        
        const updatePromises: any[] = [];
        for (const d of data.productDetails) {
          const sopDetail = await prisma.salesOrderProductDetails.findUniqueOrThrow({
            where: { id: d.sopdId },
            select: {
              id: true,
              Product: {
                select: { id: true },
              },
            },
          });

          // update sop detail's returned qty
          updatePromises.push(
            prisma.salesOrderProductDetails.update({
              where: { id: sopDetail.id },
              data: {
                returnedQuantity: { increment: new Decimal(d.returnQuantity) },
                UpdatedBy: {
                  connect: { id: userId },
                },
              },
            })
          );

          // update product stock
          updatePromises.push(
            prisma.products.update({
              where: { id: sopDetail.Product.id },
              data: {
                stock: { decrement: new Decimal(d.returnQuantity) },
                UpdatedBy: {
                  connect: { id: userId },
                },
              },
            })
          );
        }

        await Promise.all(updatePromises);
      }

      // handle serviceDetails
      if (data.serviceDetails.length > 0) {
        await prisma.salesReturnServiceDetails.createMany({
          data: data.serviceDetails.map((d) => ({
            srId: sr.id,
            serviceName: d.serviceName,
            returnQuantity: d.returnQuantity,
            reason: d.reason,
            createdBy: userId,
          }))
        })
      }
    },
    {
      maxWait: 10000, // 10 seconds max wait to connect to prisma
      timeout: 20000, // 20 seconds
    });

    return NextResponse.json({ message: 'Data Retur Penjualan berhasil disimpan' }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
