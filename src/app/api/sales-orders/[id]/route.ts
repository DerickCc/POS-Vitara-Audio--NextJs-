import { SalesOrderSchema } from "@/models/sales-order";
import { db } from "@/utils/prisma";
import { getSession } from "@/utils/sessionlib";
import { Decimal } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";

// GetSalesOrderById
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json(
      { message: "Unauthorized, mohon melakukan login ulang", result: null, recordsTotal: 0 },
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
      return NextResponse.json({ message: "Transaksi Penjualan tidak ditemukan" }, { status: 404 });
    }

    const formattedSoProductDetail = so.SalesOrderProductDetails.map((d) => ({
      ...d,
      productName: d.Product.name,
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

    return NextResponse.json({ message: "Success", result: formattedSo }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: "Internal Server Error: " + e }, { status: 500 });
  }
}

// UpdateSalesOrder
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json({ message: "Unauthorized, mohon melakukan login ulang" }, { status: 401 });
  }

  const { id } = params;

  const validationRes = SalesOrderSchema.safeParse(await request.json());

  // if validation failed
  if (!validationRes.success) {
    return NextResponse.json(
      {
        message: "Terdapat kesalahan pada data yang dikirim",
        error: validationRes.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const data = validationRes.data;

  const userId = session.id;

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
          throw new Error("Barang yang ingin di-update tidak ditemukan");
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

    const paymentStatus = grandTotal.equals(new Decimal(data.paidAmount)) ? "Lunas" : "Belum Lunas";

    await prisma.salesOrders.update({
      where: { id },
      data: {
        entryDate: data.entryDate,
        Customer: {
          connect: { id: data.customerId },
        },
        paymentType: data.paymentType,
        remarks: data.remarks,
        subTotal,
        discount,
        grandTotal,
        paymentStatus,
        UpdatedBy: {
          connect: { id: userId },
        },
      },
    });

    // Fetch existing product details
    const existingProductDetails = await prisma.salesOrderProductDetails.findMany({
      where: { soId: id },
      select: { id: true },
    });

    const updatedProductDetailIds = data.productDetails.map((detail) => detail.id);
    const productDetailIdsToDelete = existingProductDetails.map((d) => d.id).filter((id) => !updatedProductDetailIds.includes(id));

    // Delete product details that are no longer present in the update
    if (productDetailIdsToDelete.length > 0) {
      await prisma.purchaseOrderDetails.deleteMany({
        where: { id: { in: productDetailIdsToDelete } },
      });
    }

    const productPromises = data.productDetails.map(async (d) => {
      const product = await prisma.products.findUniqueOrThrow({
        where: { id: d.productId },
      });

      if (d.id) {
        // update if there is id
        return prisma.salesOrderProductDetails.update({
          where: { id: d.id },
          data: {
            Product: {
              connect: { id: d.productId },
            },
            costPrice: product.costPrice,
            oriSellingPrice: product.sellingPrice,
            sellingPrice: d.sellingPrice,
            quantity: d.quantity,
            totalPrice: d.sellingPrice * d.quantity,
            UpdatedBy: {
              connect: { id: userId },
            },
          },
        });
      } else {
        // create if id is null
        return prisma.salesOrderProductDetails.create({
          data: {
            SalesOrder: {
              connect: { id },
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
        });
      }
    });
    await Promise.all(productPromises);

    // Fetch existing service details
    const existingServiceDetails = await prisma.salesOrderServiceDetails.findMany({
      where: { soId: id },
      select: { id: true },
    });

    const updatedServiceDetailIds = data.serviceDetails.map((detail) => detail.id);
    const serviceDetailIdsToDelete = existingServiceDetails.map((d) => d.id).filter((id) => !updatedServiceDetailIds.includes(id));

    // Delete Service details that are no longer present in the update
    if (serviceDetailIdsToDelete.length > 0) {
      await prisma.purchaseOrderDetails.deleteMany({
        where: { id: { in: serviceDetailIdsToDelete } },
      });
    }

    const servicePromises = data.serviceDetails.map(async (d) => {
      if (d.id) {
        // update if there is id
        return prisma.salesOrderServiceDetails.update({
          where: { id: d.id },
          data: {
            serviceName: d.serviceName,
            sellingPrice: d.sellingPrice,
            quantity: d.quantity,
            totalPrice: d.sellingPrice * d.quantity,
            UpdatedBy: {
              connect: { id: userId },
            },
          },
        });
      } else {
        // create if id is null
        return prisma.salesOrderServiceDetails.create({
          data: {
            SalesOrder: {
              connect: { id },
            },
            serviceName: d.serviceName,
            sellingPrice: d.sellingPrice,
            quantity: d.quantity,
            totalPrice: d.sellingPrice * d.quantity,
            CreatedBy: {
              connect: { id: userId },
            },
          },
        });
      }
    });
    await Promise.all(servicePromises);

    // delete all related salesOrderPaymentHistories
    // if new grandtotal higher than total amount that has been paid
    if (new Decimal(data.paidAmount).greaterThan(grandTotal)) {
      await prisma.salesOrderPaymentHistories.deleteMany({
        where: { soId: id },
      });
    }
  });

  try {
    return NextResponse.json({ message: "Transaksi Penjualan berhasil diupdate" }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: "Internal Server Error: " + e }, { status: 500 });
  }
}

// DeleteSalesOrder
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json(
      { message: "Unauthorized, mohon melakukan login ulang", result: null, recordsTotal: 0 },
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
      return NextResponse.json({ message: "Transaksi Penjualan tidak ditemukan" }, { status: 404 });
    } else if (so.progressStatus !== "Belum Dikerjakan") {
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

    return NextResponse.json({ message: "Transaksi Penjualan berhasil dihapus" }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: "Internal Server Error: " + e }, { status: 500 });
  }
}
