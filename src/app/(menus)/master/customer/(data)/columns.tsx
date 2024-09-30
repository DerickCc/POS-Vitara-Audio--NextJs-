import ActionPopover from '@/components/action-popover';
import { routes } from '@/config/routes';
import { CustomerModel } from '@/models/customer.model';
import { TableAction } from '@/models/global.model';
import { createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';
import { LuPencil } from 'react-icons/lu';
import { ActionIcon, Tooltip } from 'rizzui';

const columnHelper = createColumnHelper<CustomerModel>();

export const columns = (actions: TableAction[]) => [
  columnHelper.display({
    id: 'actions',
    size: 100,
    header: () => 'Aksi',
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-3">
        <Tooltip size="sm" content="Edit" color="invert">
          <Link href={routes.master.customer.edit(row.original.id)} aria-label="ke halaman edit pelanggan">
            <ActionIcon
              as="span"
              size="sm"
              variant="outline"
              className="text-yellow-500 hover:border-yellow-600 hover:text-yellow-600"
            >
              <LuPencil className="size-4" />
            </ActionIcon>
          </Link>
        </Tooltip>
        {actions.map((action) => (
          <ActionPopover
            key={action.label}
            label={action.label}
            title={action.title}
            description={action.description}
            color={action.color}
            handler={() => action.handler(row.original.id)}
          />
        ))}
      </div>
    ),
  }),
  columnHelper.accessor('code', {
    id: 'code',
    size: 130,
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
    size: 160,
    header: () => 'No. Telepon',
    cell: (info) => info.getValue(),
    enableSorting: false,
  }),
  columnHelper.accessor('address', {
    id: 'address',
    size: 250,
    header: () => 'Alamat',
    cell: (info) => info.getValue() || '-',
    enableSorting: false,
  }),
];
