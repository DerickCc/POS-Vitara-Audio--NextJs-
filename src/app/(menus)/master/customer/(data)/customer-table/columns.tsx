import { createColumnHelper } from '@tanstack/react-table';

type CustomerTableType = {
  id: number,
  code: string,
  name: string,
  licensePlate: string,
  phoneNo: string,
  address: string,
}

const columnHelper = createColumnHelper<CustomerTableType>();

export const columns = [
  columnHelper.accessor('code', {
    id: 'code',
    size: 120,
    header: () => 'Kode',
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('name', {
    id: 'name',
    size: 200,
    header: () => 'Nama',
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('licensePlate', {
    id: 'licensePlate',
    size: 120,
    header: () => 'No. Plat',
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('phoneNo', {
    id: 'phoneNo',
    size: 140,
    header: () => 'No. Telepon',
    cell: (info) => info.getValue(),
    enableSorting: false,
  }),
  columnHelper.accessor('address', {
    id: 'address',
    size: 200,
    header: () => 'Alamat',
    cell: (info) => info.getValue(),
    enableSorting: false,
  }),
]
