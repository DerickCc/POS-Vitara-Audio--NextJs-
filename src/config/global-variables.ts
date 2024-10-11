export const CURRENCY_CODE = 'IDR';
export const LOCALE = 'id';
export const CURRENCY_OPTIONS = {
  formation: 'id-ID',
  fractions: 2,
};

export const mapTrxStatusToColor = { 'Dalam Proses': 'blue', Selesai: 'green', Batal: 'red' };

// select options
export const pageSizeOptions = [
  {
    value: 5,
    label: '5',
  },
  {
    value: 10,
    label: '10',
  },
  {
    value: 15,
    label: '15',
  },
  {
    value: 25,
    label: '25',
  },
  {
    value: 50,
    label: '50',
  },
];

export const filterOperatorOptions = [
  { label: '>=', value: 'gte' },
  { label: '<=', value: 'lte' },
];

export const accountStatusOptions = [
  { label: 'Aktif', value: true },
  { label: 'Nonaktif', value: false },
];

export const roleOptions = [
  { label: 'Admin', value: 'Admin' },
  { label: 'Kasir', value: 'Kasir' },
];

export const poStatusOptions = [
  { label: 'Dalam Proses', value: 'Dalam Proses' },
  { label: 'Selesai', value: 'Selesai' },
];
