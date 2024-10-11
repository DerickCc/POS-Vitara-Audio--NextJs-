import { routes } from '@/config/routes';
import { CustomerModel } from '@/models/customer.model';
import { TableColumnProps } from '@/models/global.model';
import { actionIconColorClass } from '@/utils/tailwind-classes';
import { createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';
import { FaRegTrashAlt } from 'react-icons/fa';
import { LuPencil } from 'react-icons/lu';
import { ActionIcon, Tooltip, cn } from 'rizzui';

const columnHelper = createColumnHelper<CustomerModel>();

export const columns = ({ actions, openModal, ConfirmationModalComponent }: TableColumnProps) => [
  columnHelper.display({
    id: 'actions',
    size: 100,
    header: () => 'Aksi',
    cell: ({ row }) => (
      <>
        <div className='flex items-center justify-center gap-3'>
          <Tooltip size='sm' content='Edit' color='invert'>
            <Link href={routes.master.customer.edit(row.original.id)} aria-label='ke halaman edit pelanggan'>
              <ActionIcon
                as='span'
                size='sm'
                variant='outline'
                className='text-yellow-500 hover:border-yellow-600 hover:text-yellow-600'
              >
                <LuPencil className='size-4' />
              </ActionIcon>
            </Link>
          </Tooltip>
          {actions.map((action) => (
            <Tooltip key={action.label} size='sm' content={action.title} color='invert'>
              <ActionIcon
                size='sm'
                variant='outline'
                className={cn(actionIconColorClass[action.color], 'cursor-pointer')}
                onClick={() => {
                  openModal({
                    title: action.title,
                    description: action.description,
                    handleConfirm: () => action.handler(row.original.id),
                  });
                }}
              >
                {action.label === 'Hapus' && <FaRegTrashAlt className='h-4 w-4' />}
              </ActionIcon>
            </Tooltip>
          ))}
        </div>

        <ConfirmationModalComponent />
      </>
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
