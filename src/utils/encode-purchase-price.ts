import { Decimal } from "@prisma/client/runtime/library";

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