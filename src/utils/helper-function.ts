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

/**
 * Get current Jakarta (WIB) datetime
 * Exp: 1 Januari 2024
 */
export const getCurrDatetime = () => {
  const jakartaDate = new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    // hour: '2-digit',
    // minute: '2-digit',
    // second: '2-digit',
    hour12: false,
  });

  return jakartaDate;
}

/**
 * Get current Jakarta (WIB) date
 * Exp: 1 Januari 2024
 */
export const getCurrDate = () => {
  const jakartaDate = new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    // hour: '2-digit',
    // minute: '2-digit',
    // second: '2-digit',
    hour12: false,
  });

  return jakartaDate;
}