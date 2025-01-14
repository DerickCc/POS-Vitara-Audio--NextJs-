'use server';

import { db } from '@/utils/prisma';

// for checking if there are related records which contains cancelled products
export async function checkForRelatedRecords(
  entity: 'purchaseOrders' | 'salesOrders' | 'purchaseReturns' | 'salesReturns',
  cancelledProducts: string[],
  createdAt: Date,
  errorMessage: string,
  relationPath: string,
  additionalPath: string = '', // for purchase and sales return
) {
  // @ts-ignore
  const affectedRecords = await db[entity].findMany({
    where: {
      [relationPath]: {
        some: additionalPath
          ? {
              [additionalPath]: {
                productId: { in: cancelledProducts },
              },
            }
          : {
              productId: { in: cancelledProducts },
            },
      },
      createdAt: { gt: createdAt },
      status: { not: 'Batal' },
    },
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  });

  if (affectedRecords.length > 0) {
    throw new Error(errorMessage);
  }
}
