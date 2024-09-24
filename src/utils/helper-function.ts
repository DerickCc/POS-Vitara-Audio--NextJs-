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
