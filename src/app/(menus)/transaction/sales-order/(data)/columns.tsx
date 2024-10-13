import { routes } from '@/config/routes';
import { Colors, TableColumnProps } from '@/models/global.model';
import { createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';
import { LuEye, LuMoreVertical, LuCircleSlash } from 'react-icons/lu';
import { formatToCurrency, isoStringToReadableDate } from '@/utils/helper-function';
import cn from '@/utils/class-names';
import { mapSoStatusToColor } from '@/config/global-variables';
import { badgeColorClass, baseBadgeClass } from '@/utils/tailwind-classes';
import { FaRegTrashAlt } from 'react-icons/fa';
import { ActionIcon, Dropdown } from 'rizzui';
import { IoCheckmarkDoneSharp } from 'react-icons/io5';
import { SalesOrderModel } from '@/models/sales-order';

const columnHelper = createColumnHelper<SalesOrderModel>();

export const columns = ({ actions, openModal, ConfirmationModalComponent, role }: TableColumnProps) => [
  columnHelper.display({
    id: 'actions',
    size: 60,
    header: () => 'Aksi',
    cell: ({ row }) => {
      return (
        <>
          <Dropdown>
            <Dropdown.Trigger>
              <ActionIcon as='span' variant='outline' rounded='full' className='p-0'>
                <LuMoreVertical className='size-5 text-primary' />
              </ActionIcon>
            </Dropdown.Trigger>

            <Dropdown.Menu style={{ fontSize: 15 }}>
              <Link href={routes.transaction.salesOrder.view(row.original.id)}>
                <Dropdown.Item>
                  <LuEye className='text-blue-500 w-5 h-5 cursor-pointer mr-3' /> Detail
                </Dropdown.Item>
              </Link>
              {actions
                .filter((action) => {
                  // Filter logic:
                  // Hide 'Selesai' and 'Hapus' if status is not 'Dalam Proses'

                  // Hide 'Batal' if the role is not 'Admin' or status is not 'Selesai'
                  if (action.label === 'Batal' && role !== 'Admin') {
                    return false;
                  }
                  return true;
                })
                .map((action) => {
                  return (
                    <Dropdown.Item
                      key={action.label}
                      onClick={() => {
                        openModal({
                          title: action.title,
                          description: action.description,
                          handleConfirm: () => action.handler(row.original.id),
                        });
                      }}
                    >
                      {action.label === 'Selesai' && (
                        <IoCheckmarkDoneSharp className='text-green-500 w-5 h-5 cursor-pointer mr-3' />
                      )}
                      {action.label === 'Hapus' && (
                        <FaRegTrashAlt className='text-red-500 w-5 h-4 cursor-pointer mr-3' />
                      )}
                      {action.label === 'Batal' && (
                        <LuCircleSlash className='text-red-500 w-5 h-5 cursor-pointer mr-3' />
                      )}
                      {action.label}
                    </Dropdown.Item>
                  );
                })}
            </Dropdown.Menu>
          </Dropdown>

          <ConfirmationModalComponent />
        </>
      );
    },
  }),
  columnHelper.accessor('code', {
    id: 'code',
    size: 120,
    header: () => 'No. Invoice',
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('salesDate', {
    id: 'salesDate',
    size: 170,
    header: () => 'Tanggal Penjualan',
    cell: (info) => isoStringToReadableDate(info.getValue()),
    enableSorting: true,
  }),
  columnHelper.accessor('customerName', {
    id: 'customerName',
    size: 180,
    header: () => 'Pelanggan',
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('subTotal', {
    id: 'subTotal',
    size: 130,
    header: () => 'Sub Total',
    cell: (info) => `Rp ${formatToCurrency(info.getValue())}`,
    enableSorting: true,
  }),
  columnHelper.accessor('discount', {
    id: 'discount',
    size: 130,
    header: () => 'Diskon',
    cell: (info) => `Rp ${formatToCurrency(info.getValue())}`,
    enableSorting: true,
  }),
  columnHelper.accessor('grandTotal', {
    id: 'grandTotal',
    size: 130,
    header: () => 'Grand Total',
    cell: (info) => `Rp ${formatToCurrency(info.getValue())}`,
    enableSorting: true,
  }),
  columnHelper.accessor('paidAmount', {
    id: 'paidAmount',
    size: 130,
    header: () => 'Dibayar',
    cell: (info) => `Rp ${formatToCurrency(info.getValue())}`,
    enableSorting: true,
  }),
  columnHelper.accessor('status', {
    id: 'status',
    size: 150,
    header: () => 'Status',
    cell: (info) => {
      const status = info.getValue();
      const color = mapSoStatusToColor[status] as Colors;
      return <span className={cn(badgeColorClass[color], baseBadgeClass)}>{status}</span>;
    },
    enableSorting: true,
  }),
  columnHelper.accessor('cashier', {
    id: 'cashier',
    size: 100,
    header: () => 'Kasir',
    cell: (info) => info.getValue(),
    enableSorting: false,
  }),
  columnHelper.accessor('remarks', {
    id: 'remarks',
    size: 250,
    header: () => 'Keterangan',
    cell: (info) => info.getValue() || '-',
    enableSorting: false,
  }),
];
