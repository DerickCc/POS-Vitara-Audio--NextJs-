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
}

main()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
