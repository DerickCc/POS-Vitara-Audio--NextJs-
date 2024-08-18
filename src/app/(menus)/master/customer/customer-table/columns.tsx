import { createColumnHelper } from '@tanstack/react-table';

// export const columns = [
//   { title: "Kode", dataIndex: "code", key: "code", width: 120 },
//   { title: "Nama", dataIndex: "name", key: "name", width: 200 },
//   { title: "No. Plat", dataIndex: "licensePlate", key: "licensePlate", width: 120 },
//   { title: "No. Telepon", dataIndex: "phoneNo", key: "phoneNo", width: 140 },
//   { title: "Alamat", dataIndex: "address", key: "address", width: 200 },
//   { title: "Alamat", dataIndex: "address", key: "address1", width: 200 },
//   { title: "Alamat", dataIndex: "address", key: "address2", width: 200 },
//   { title: "Alamat", dataIndex: "address", key: "address3", width: 200 },
//   { title: "Alamat", dataIndex: "address", key: "address4", width: 200 },
//   { title: "Alamat", dataIndex: "address", key: "address5", width: 200 },
//   { title: "Alamat", dataIndex: "address", key: "address6", width: 200 },
//   { title: "Alamat", dataIndex: "address", key: "address7", width: 200 },
// ];

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
