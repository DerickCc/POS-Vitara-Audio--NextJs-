'use server';

import { db } from '@/utils/prisma';
import { Decimal } from '@prisma/client/runtime/library';

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

const encodingMap: { [key: string]: string } = {
  '1': 'T',
  '2': 'A',
  '3': 'N',
  '4': 'G',
  '5': 'W',
  '6': 'E',
  '7': 'K',
  '8': 'C',
  '9': 'U',
  '0': 'I'
}

export async function encodePurchasePrice(value: number | Decimal) {
  return `${value}`.split('').map(digit => encodingMap[digit] ?? digit).join('');
}
