import { UpdateSalesOrderSchema } from '@/models/sales-order';
import { db } from '@/utils/prisma';
import { getSession } from '@/utils/sessionlib';
import { Decimal } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server';

// GetSalesOrderById
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json(
      { message: 'Unauthorized, mohon melakukan login ulang', result: null, recordsTotal: 0 },
      { status: 401 }
    );
  }

  const { id } = params;

  try {
    const so = await db.salesOrders.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        salesDate: true,
        entryDate: true,
        customerId: true,
        Customer: {
          select: {
            name: true,
            licensePlate: true,
            phoneNo: true,
            address: true,
          },
        },
        paymentType: true,
        SalesOrderPaymentHistories: {
          select: { amount: true },
        },
        subTotal: true,
        discount: true,
        grandTotal: true,
        progressStatus: true,
        paymentStatus: true,
        remarks: true,
        SalesOrderProductDetails: {
          select: {
            id: true,
            soId: true,
            productId: true,
            Product: {
              select: { name: true, uom: true, type: true },
            },
            oriSellingPrice: true,
            sellingPrice: true,
            quantity: true,
            totalPrice: true,
          },
        },
        SalesOrderServiceDetails: {
          select: {
            id: true,
            soId: true,
            serviceName: true,
            sellingPrice: true,
            quantity: true,
            totalPrice: true,
          },
        },
        CreatedBy: {
          select: { name: true },
        },
      },
    });

    if (!so) {
      return NextResponse.json({ message: 'Transaksi Penjualan tidak ditemukan' }, { status: 404 });
    }

    const formattedSoProductDetail = so.SalesOrderProductDetails.map((d) => ({
      ...d,
      productName: d.Product.name,
      oriSellingPrice: Number(d.oriSellingPrice),
      sellingPrice: Number(d.sellingPrice),
      quantity: Number(d.quantity),
      totalPrice: Number(d.totalPrice),
      uom: d.Product.uom,
      type: d.Product.type,
      Product: undefined,
    }));

    const formattedSoServiceDetail = so.SalesOrderServiceDetails.map((d) => ({
      ...d,
      sellingPrice: Number(d.sellingPrice),
      quantity: Number(d.quantity),
      totalPrice: Number(d.totalPrice),
    }));

    const cashier = so.CreatedBy.name;

    const paidAmount = so.SalesOrderPaymentHistories.reduce((acc, p) => acc.plus(p.amount), new Decimal(0));

    const formattedSo = {
      ...so,
      subTotal: Number(so.subTotal),
      discount: Number(so.discount),
      grandTotal: Number(so.grandTotal),
      paidAmount: Number(paidAmount),
      customerName: so.Customer.name,
      customerLicensePlate: so.Customer.licensePlate,
      customerAddress: so.Customer.address,
      customerPhoneNo: so.Customer.phoneNo,
      productDetails: formattedSoProductDetail,
      serviceDetails: formattedSoServiceDetail,
      cashier,
      Customer: undefined,
      SalesOrderPaymentHistories: undefined,
      SalesOrderProductDetails: undefined,
      SalesOrderServiceDetails: undefined,
      CreatedBy: undefined,
    };

    return NextResponse.json({ message: 'Success', result: formattedSo }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}

// UpdateSalesOrder
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json({ message: 'Unauthorized, mohon melakukan login ulang' }, { status: 401 });
  }

  const { id } = params;

  const validationRes = UpdateSalesOrderSchema.safeParse(await request.json());

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

  const userId = session.id;

  try {
    await db.$transaction(
      async (prisma) => {
        let subTotal = new Decimal(0);
        let discount = new Decimal(0);

        // fetch all required product details in one query
        const productIds = data.productDetails.map((d) => d.productId);
        const products = await prisma.products.findMany({
          where: { id: { in: productIds } },
          select: { id: true, sellingPrice: true, costPrice: true },
        });

        const productMap = new Map(products.map((p) => [p.id, p]));

        // process products
        for (const d of data.productDetails) {
          const product = productMap.get(d.productId);
          if (!product) throw new Error('Barang yang ingin di-update tidak ditemukan');

          // calculate subTotal
          // check if price is getting discount or marked up
          const priceAdjustment = new Decimal(d.sellingPrice).minus(product.sellingPrice);
          const totalPrice = (
            priceAdjustment.greaterThan(0) ? new Decimal(d.sellingPrice) : product.sellingPrice
          ).times(d.quantity);
          subTotal = subTotal.plus(totalPrice);

          // calculate discount
          // priceAdjusment negative means discount
          if (priceAdjustment.lessThan(0)) discount = discount.plus(priceAdjustment.negated().times(d.quantity));
        }

        // process services
        const subTotalService = data.serviceDetails.reduce(
          (acc, d) => acc.plus(d.sellingPrice * d.quantity),
          new Decimal(0)
        );
        subTotal = subTotal.plus(subTotalService);

        const grandTotal = subTotal.minus(discount);
        const isPaidInFull = grandTotal.equals(new Decimal(data.paidAmount));
        const paymentType = isPaidInFull ? 'Lunas' : 'DP';
        const paymentStatus = isPaidInFull ? 'Lunas' : 'Belum Lunas';

        await prisma.salesOrders.update({
          where: { id },
          data: {
            entryDate: data.entryDate,
            Customer: { connect: { id: data.customerId } },
            remarks: data.remarks,
            subTotal,
            discount,
            grandTotal,
            paymentType,
            paymentStatus,
            UpdatedBy: { connect: { id: userId } },
          },
        });

        // Fetch existing product details
        const existingProductDetailsIds = await prisma.salesOrderProductDetails
          .findMany({
            where: { soId: id },
            select: { id: true },
          })
          .then((res) => res.map((d) => d.id));

        const updatedProductDetailIds = data.productDetails.map((d) => d.id);
        const productDetailIdsToDelete = existingProductDetailsIds.filter(
          (id) => !updatedProductDetailIds.includes(id)
        );

        // Delete product details that are no longer present in the update
        if (productDetailIdsToDelete.length) {
          await prisma.salesOrderProductDetails.deleteMany({
            where: { id: { in: productDetailIdsToDelete } },
          });
        }

        const productDetailsPromises = data.productDetails.map(async (d) => {
          const product = productMap.get(d.productId);
          if (!product) throw new Error('Produk tidak ditemukan');

          return d.id
            ? // update if there is id
              prisma.salesOrderProductDetails.update({
                where: { id: d.id },
                data: {
                  Product: { connect: { id: d.productId } },
                  costPrice: product.costPrice,
                  oriSellingPrice: product.sellingPrice,
                  sellingPrice: d.sellingPrice,
                  quantity: d.quantity,
                  totalPrice: d.sellingPrice * d.quantity,
                  UpdatedBy: { connect: { id: userId } },
                },
              })
            : // create if id is null
              prisma.salesOrderProductDetails.create({
                data: {
                  SalesOrder: { connect: { id } },
                  Product: { connect: { id: d.productId } },
                  costPrice: product.costPrice,
                  oriSellingPrice: product.sellingPrice,
                  sellingPrice: d.sellingPrice,
                  quantity: d.quantity,
                  totalPrice: d.sellingPrice * d.quantity,
                  CreatedBy: { connect: { id: userId } },
                },
              });
        });
        await Promise.all(productDetailsPromises);

        // Fetch existing service details
        const existingServiceDetailsIds = await prisma.salesOrderServiceDetails
          .findMany({
            where: { soId: id },
            select: { id: true },
          })
          .then((res) => res.map((d) => d.id));

        const updatedServiceDetailIds = data.serviceDetails.map((d) => d.id);
        const serviceDetailIdsToDelete = existingServiceDetailsIds.filter(
          (id) => !updatedServiceDetailIds.includes(id)
        );

        // Delete Service details that are no longer present in the update
        if (serviceDetailIdsToDelete.length > 0) {
          await prisma.salesOrderServiceDetails.deleteMany({
            where: { id: { in: serviceDetailIdsToDelete } },
          });
        }

        const serviceDetailsPromises = data.serviceDetails.map(async (d) => {
          return d.id
            ? // update if there is id
              prisma.salesOrderServiceDetails.update({
                where: { id: d.id },
                data: {
                  serviceName: d.serviceName,
                  sellingPrice: d.sellingPrice,
                  quantity: d.quantity,
                  totalPrice: d.sellingPrice * d.quantity,
                  UpdatedBy: { connect: { id: userId } },
                },
              })
            : // create if id is null
              prisma.salesOrderServiceDetails.create({
                data: {
                  SalesOrder: { connect: { id } },
                  serviceName: d.serviceName,
                  sellingPrice: d.sellingPrice,
                  quantity: d.quantity,
                  totalPrice: d.sellingPrice * d.quantity,
                  CreatedBy: { connect: { id: userId } },
                },
              });
        });
        await Promise.all(serviceDetailsPromises);

        // delete all related salesOrderPaymentHistories
        // if overpaid
        if (new Decimal(data.paidAmount).greaterThan(grandTotal)) {
          await prisma.salesOrderPaymentHistories.deleteMany({
            where: { soId: id },
          });
        }
      },
      {
        maxWait: 10000, // 10 seconds max wait to connect to prisma
        timeout: 20000, // 20 seconds
      }
    );
    return NextResponse.json({ message: 'Transaksi Penjualan berhasil diupdate' }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}

// DeleteSalesOrder
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json(
      { message: 'Unauthorized, mohon melakukan login ulang', result: null, recordsTotal: 0 },
      { status: 401 }
    );
  }

  const { id } = params;

  try {
    const so = await db.salesOrders.findUnique({
      where: { id },
      select: {
        progressStatus: true,
        customerId: true,
      },
    });

    if (!so) {
      return NextResponse.json({ message: 'Transaksi Penjualan tidak ditemukan' }, { status: 404 });
    } else if (so.progressStatus !== 'Belum Dikerjakan') {
      return NextResponse.json(
        { message: 'Hanya Transaksi Penjualan berstatus "Belum Dikerjakan" yang dapat dihapus' },
        { status: 403 } // 403 = Forbidden
      );
    }

    await db.$transaction(async (prisma) => {
      await prisma.salesOrders.delete({
        where: { id },
      });

      await prisma.salesOrderPaymentHistories.deleteMany({
        where: { soId: id },
      });
    });

    return NextResponse.json({ message: 'Transaksi Penjualan berhasil dihapus' }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Internal Server Error: ' + e }, { status: 500 });
  }
}
