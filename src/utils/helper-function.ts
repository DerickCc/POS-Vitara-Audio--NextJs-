import { TIMEZONE } from "@/config/global-variables";

export const formatToCurrency = (numericValue: number): string => (
  new Intl.NumberFormat('id-ID').format(numericValue)
);

export const parseNumber = (value: string): number => (
  parseFloat(value.replace(/[^0-9,]+/g, '')) || 0
);

export const formatToDecimal = (value: any): string => {
  if (typeof value !== 'number') {
    value = parseFloat(value)
  }

  return value.toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

export const parseDecimal = (value: string): number => {
  const normalizedValue = value.replace(/\./g, '').replace(/,/g, '.');
  return parseFloat(normalizedValue) || 0
};

// Date Time Stuff
/**
 * Get current Jakarta (WIB) date
 * Res Exp: 1 Januari 2024
 */
export const getCurrDate = () => {
  const jakartaDate = new Date().toLocaleString('id-ID', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour12: false,
  });

  return jakartaDate;
}

/**
 * Format isoString date to normal (indonesian) date
 * Res Exp: 1 Januari 2024
 */
export const isoStringToReadableDate = (isoStirng: string) => {
  const date = new Date(isoStirng).toLocaleString('id-ID', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour12: false,
  });

  return date;
}

// export const isoStringToReadableDateTime = (isoStirng: string) => {
//   const datetime = new Date(isoStirng).toLocaleString('id-ID', {
//     timeZone: 'Asia/Jakarta',
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit',
//     second: '2-digit',
//     hour12: false,
//   });

//   const [date, time] = datetime.split(' pukul ');

//   return `${date} ${time.replaceAll('.', ':')}`;
// }