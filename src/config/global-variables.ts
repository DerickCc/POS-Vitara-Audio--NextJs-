import { Colors } from "@/models/global.model";

export const TIMEZONE = 'Asia/Jakarta';
export const CURRENCY_CODE = 'IDR';
export const LOCALE = 'id';
export const CURRENCY_OPTIONS = {
  formation: 'id-ID',
  fractions: 2,
};

export const mapTrxStatusToColor: { [key: string]: Colors } = {
  'Dalam Proses': 'blue',
  'Belum Lunas': 'blue',
  Selesai: 'green',
  Lunas: 'green',
  Batal: 'red',
};

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

export const topProductLimitOptions = [
  { label: '5', value: 5 },
  { label: '6', value: 6 },
  { label: '7', value: 7 },
  { label: '8', value: 8 },
];

export const topProductPeriodOptions = [
  { label: 'Sepanjang Masa', value: 'all-time' },
  { label: 'Tahun Ini', value: 'year' },
  { label: 'Bulan Ini', value: 'month' },
  { label: 'Hari Ini', value: 'day' },
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

export const poPrStatusOptions = [
  { label: 'Dalam Proses', value: 'Dalam Proses' },
  { label: 'Selesai', value: 'Selesai' },
  { label: 'Batal', value: 'Batal' },
];

export const purchaseReturnTypeOptions = [
  { label: 'Penggantian Barang', value: 'Penggantian Barang' },
  { label: 'Pengembalian Dana', value: 'Pengembalian Dana' },
  { label: 'Piutang', value: 'Piutang' },
];

export const soStatusOptions = [
  { label: 'Belum Lunas', value: 'Belum Lunas' },
  { label: 'Lunas', value: 'Lunas' },
  { label: 'Batal', value: 'Batal' },
];

export const srStatusOptions = [
  { label: 'Lunas', value: 'Lunas' },
  { label: 'Batal', value: 'Batal' },
];
