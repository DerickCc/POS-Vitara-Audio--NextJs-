import { TIMEZONE } from '@/config/global-variables';
import { routes } from '@/config/routes';
import { Url } from 'next/dist/shared/lib/router/router';

export const formatToReadableNumber = (numericValue: number): string =>
  new Intl.NumberFormat('id-ID').format(numericValue);

export const parseNumber = (value: string): number => parseFloat(value.replace(/[^0-9,]+/g, '')) || 0;

export const formatToDecimal = (value: any): string => {
  if (typeof value !== 'number') {
    value = parseFloat(value);
  }

  return value.toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

export const parseDecimal = (value: string): number => {
  const normalizedValue = value.replace(/\./g, '').replace(/,/g, '.');
  return parseFloat(normalizedValue) || 0;
};

export const mapTrxToRoute = (type: string, id: string): Url => {
  if (type.includes('Retur Pembelian')) {
    return routes.inventory.purchaseReturn.detail(id);
  } else if (type.includes('Retur Penjualan')) {
    return routes.inventory.salesReturn.detail(id);
  } else if (type.includes('Pembelian')) {
    return routes.transaction.purchaseOrder.detail(id);
  } else if (type.includes('Penjualan')) {
    return routes.transaction.salesOrder.detail(id);
  } else {
    return routes.dashboard;
  }
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
};

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
};

export const isoStringToDateWithTime = (isoString: string) => {
  const dateTime = new Date(isoString).toLocaleString('id-ID', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const [date, time] = dateTime.split(', ');

  return `${date?.replaceAll('/', '-')} ${time?.replaceAll('.', ':')}`;
};
