import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashPassword = await hash('Aa123456', 10);

  const user = await prisma.users.create({
    data: {
      name: 'Derick',
      username: 'admin123',
      password: hashPassword,
      role: 'Admin',
    },
  });

  const customer = await prisma.customers.create({
    data: {
      code: 'CUS00000001',
      name: 'Agusto - Innova Zenix',
      licensePlate: 'BK 888 AA',
      phoneNo: '082112121212',
      address: 'Jalan Sumatra No 88, Medan',
      CreatedBy: { connect: { id: user.id } },
    },
  });

  const supplier1 = await prisma.suppliers.create({
    data: {
      code: 'SUP00000001',
      name: 'PT. ABC Indonesia',
      pic: 'John Doe',
      phoneNo: '081234567890',
      address: 'Jakarta, Indonesia',
      remarks: 'Supplier of best audio products',
      receivablesLimit: 10000000,
      CreatedBy: { connect: { id: user.id } },
    },
  });

  const supplier2 = await prisma.suppliers.create({
    data: {
      code: 'SUP00000002',
      name: 'PT. DEF China',
      pic: 'Ching Hua Chong',
      phoneNo: '081239876540',
      address: 'Chong Qing, China',
      remarks: 'Supplier kain dan kulit premium',
      receivablesLimit: 30000000,
      CreatedBy: { connect: { id: user.id } },
    },
  });

  const product1 = await prisma.products.create({
    data: {
      code: 'PRD00000001',
      name: 'Stir Mobil Universal',
      restockThreshold: 10,
      uom: 'Pcs',
      purchasePrice: 50000,
      sellingPrice: 100000,
      costPriceCode: 'I',
      CreatedBy: { connect: { id: user.id } },
    },
  });

  const product2 = await prisma.products.create({
    data: {
      code: 'PRD00000002',
      name: 'Ban Anti Bocor',
      restockThreshold: 30,
      uom: 'Pcs',
      purchasePrice: 300000,
      sellingPrice: 500000,
      costPriceCode: 'I',
      CreatedBy: { connect: { id: user.id } },
    },
  });

  const product3 = await prisma.products.create({
    data: {
      code: 'PRD00000003',
      name: 'Kain Sapi Wagyu',
      restockThreshold: 20,
      uom: 'Meter',
      purchasePrice: 100000,
      sellingPrice: 300000,
      costPriceCode: 'I',
      CreatedBy: { connect: { id: user.id } },
    },
  });
}

main()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
