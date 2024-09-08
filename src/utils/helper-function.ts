/**
 * Returns the number in Indonesian currency format.
 * @param value a numeric value.
 */
export const formatToCurrency = (numericValue: number) => (
  new Intl.NumberFormat('id-ID').format(numericValue)
);

/**
 * Returns string into number.
 * @param value a string value.
 */
export const parseNumber = (value: string) => (
  parseFloat(value.replace(/[^0-9,]+/g, '')) || 0
)
