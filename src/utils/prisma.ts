import { PrismaClient } from '@prisma/client';

export let db: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  // In production, create a single instance of Prisma client
  db = new PrismaClient({
    transactionOptions: {
      isolationLevel: "ReadCommitted",
      timeout: 10000,
      maxWait: 10000,
    }
  });
}
else {
  // In development, use a global variable to store the Prisma client
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  db = (global as any).prisma;
}