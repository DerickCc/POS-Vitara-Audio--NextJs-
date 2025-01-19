import { SalesOrderSchema } from '@/models/sales-order';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server';

// BrowseSalesOrders
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
  const progressStatus = queryParams.get('progressStatus') ?? '';
  const paymentStatus = queryParams.get('paymentStatus') ?? '';

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
    where.AND.push({ customerId });
  }

  if (startDate) {
    const startOfDay = new Date(startDate);

    where.AND.push({
      salesDate: {
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
      salesDate: {
        lte: endOfDay,
      },
    });
  }

  if (progressStatus) {
    where.AND.push({ progressStatus });
  }

  if (paymentStatus) {
    where.AND.push({ paymentStatus });
  }
  // ----------------

  try {
    const salesOrders = await db.salesOrders.findMany({
      skip: pageIndex * pageSize,
      take: pageSize,
      orderBy:
        sortColumn === 'customerName'
          ? {
              Customer: { name: sortOrder as Prisma.SortOrder },
            }
          : {
              [sortColumn]: sortOrder,
            },
      where,
      include: {
        Customer: {
          select: { name: true, licensePlate: true },
        },
        SalesOrderPaymentHistories: {
          select: { amount: true },
        },
        CreatedBy: {
          select: { name: true },
        },
      },
    });
    const recordsTotal = await db.salesOrders.count({ where });

    const mappedSalesOrders = salesOrders.map((so) => {
      const paidAmount = so.SalesOrderPaymentHistories.reduce((acc, p) => acc.plus(p.amount), new Decimal(0));

      return {
        ...so,
        customerName: so.Customer.name,
        customerLicensePlate: so.Customer.licensePlate,
        paidAmount,
        cashier: so.CreatedBy.name,
        Customer: undefined,
        SalesOrderPaymentHistories: undefined,
        CreatedBy: undefined,
      };
    });

    return NextResponse.json({ message: 'Success', result: mappedSalesOrders, recordsTotal }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { message: 'Internal Server Error: ' + e, result: null, recordsTotal: 0 },
      { status: 500 }
    );
  }
}

// CreateSalesOrder
export async function POST(request: Request) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json(
      { message: 'Unauthorized, mohon melakukan login ulang', result: null, recordsTotal: 0 },
      { status: 401 }
    );
  }

  const validationRes = SalesOrderSchema.safeParse(await request.json());

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

    // retreive last so code
    const lastSo = await db.salesOrders.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { code: true },
    });

    let newCode = 'SO00000001'; // default code

    if (lastSo) {
      const lastCodeNumber = parseInt(lastSo.code.replace('SO', ''), 10);
      newCode = 'SO' + (lastCodeNumber + 1).toString().padStart(8, '0');
    }

    const salesDate = new Date().toISOString();

    await db.$transaction(async (prisma) => {
      let subTotal = new Decimal(0);
      let discount = new Decimal(0);

      // calculate subTotal and discount
      if (data.productDetails.length > 0) {
        for (const d of data.productDetails) {
          const product = await prisma.products.findUnique({
            where: { id: d.productId },
            select: { sellingPrice: true },
          });

          if (!product) {
            throw new Error('Barang yang ingin di-update tidak ditemukan');
          }

          // calculate subTotal
          // check if price is getting discount or marked up
          const priceAdjustment = new Decimal(d.sellingPrice).minus(product.sellingPrice);

          // if marked up, calculate subtotal with the marked up selling price
          if (priceAdjustment?.greaterThan(0)) subTotal = subTotal.plus(d.sellingPrice * d.quantity);
          // if discount, calculate subtotal with the ori selling price
          else subTotal = subTotal.plus(product.sellingPrice.times(d.quantity));

          // calculate discount
          // priceAdjusment negative means discount
          if (priceAdjustment.lessThan(0)) discount = discount.plus(priceAdjustment.negated().times(d.quantity));
        }
      }

      // calculate subTotal
      if (data.serviceDetails.length > 0) {
        const subTotalService = data.serviceDetails.reduce(
          (acc, d) => acc.plus(d.sellingPrice * d.quantity),
          new Decimal(0)
        );
        subTotal = subTotal.plus(subTotalService);
      }

      const grandTotal = subTotal.minus(discount);

      const paymentStatus = grandTotal.equals(new Decimal(data.paidAmount)) ? 'Lunas' : 'Belum Lunas';

      // create so
      const so = await prisma.salesOrders.create({
        data: {
          code: newCode,
          salesDate,
          entryDate: data.entryDate,
          Customer: {
            connect: { id: data.customerId },
          },
          paymentType: data.paymentType,
          subTotal,
          discount,
          grandTotal,
          remarks: data.remarks,
          paymentStatus,
          CreatedBy: {
            connect: { id: userId },
          },
        },
      });

      const promises: any[] = [];
      if (data.productDetails.length > 0) {
        for (const d of data.productDetails) {
          const product = await prisma.products.findUnique({
            where: { id: d.productId },
            select: {
              costPrice: true,
              sellingPrice: true,
            },
          });

          if (!product) {
            throw new Error('Barang yang ingin di-update tidak ditemukan');
          }

          // create soProductDetail
          promises.push(
            prisma.salesOrderProductDetails.create({
              data: {
                SalesOrder: {
                  connect: { id: so.id },
                },
                Product: {
                  connect: { id: d.productId },
                },
                costPrice: product.costPrice,
                oriSellingPrice: product.sellingPrice,
                sellingPrice: d.sellingPrice,
                quantity: d.quantity,
                totalPrice: d.sellingPrice * d.quantity,
                CreatedBy: {
                  connect: { id: userId },
                },
              },
            })
          );
        }
      }

      await Promise.all(promises);

      // create soServiceDetail
      if (data.serviceDetails.length > 0) {
        await prisma.salesOrderServiceDetails.createMany({
          data: data.serviceDetails.map((d) => ({
            soId: so.id,
            serviceName: d.serviceName,
            sellingPrice: d.sellingPrice,
            quantity: d.quantity,
            totalPrice: d.sellingPrice * d.quantity,
            createdBy: userId,
          })),
        });
      }

      // create payment history
      await prisma.salesOrderPaymentHistories.create({
        data: {
          SalesOrder: {
            connect: { id: so.id },
          },
          paymentMethod: data.paymentMethod,
          amount: data.paidAmount,
          CreatedBy: {
            connect: { id: userId },
          },
        },
      });
    });

    return NextResponse.json({ message: 'Data Transaksi Penjualan berhasil disimpan' }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
