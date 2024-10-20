import { PrismaClient } from '@prisma/client'
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
      CreatedBy: { connect: { id: user.id }}
    },
  });

  const supplier = await prisma.suppliers.create({
    data: {
      code: 'SUP00000001',
      name: 'PT. ABC Indonesia',
      pic: 'John Doe',
      phoneNo: '081234567890',
      address: 'Jakarta, Indonesia',
      remarks: 'Supplier of best audio products',
      receivablesLimit: 10000000,
      CreatedBy: { connect: { id: user.id }}
    },
  });

  const product = await prisma.products.create({
    data: {
      code: 'PRD00000001',
      name: 'Stir Mobil',
      restockThreshold: 10,
      uom: 'Pcs',
      purchasePrice: 50,
      sellingPrice: 100,
      CreatedBy: { connect: { id: user.id }}
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
