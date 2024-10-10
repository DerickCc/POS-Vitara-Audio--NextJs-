import { actionIconColorClass, badgeColorClass, baseBadgeClass } from '@/utils/tailwind-classes';
import { routes } from '@/config/routes';
import { UserModel } from '@/models/user.model';
import cn from '@/utils/class-names';
import { createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';
import { LuPencil } from 'react-icons/lu';
import { ActionIcon, Tooltip } from 'rizzui';
import { TableColumnProps } from '@/models/global.model';
import { FiRefreshCcw } from 'react-icons/fi';

const columnHelper = createColumnHelper<UserModel>();

export const columns = ({ actions, openModal, ConfirmationModalComponent }: TableColumnProps) => [
  columnHelper.display({
    id: 'actions',
    size: 100,
    header: () => 'Aksi',
    cell: ({ row }) => (
      <>
        <div className='flex items-center justify-center gap-3'>
          <Tooltip size='sm' content='Edit' color='invert'>
            <Link href={routes.settings.user.edit(row.original.id)} aria-label='ke halaman edit pelanggan'>
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
            <Tooltip size='sm' content={action.title} color='invert'>
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
                {action.label === 'Ubah Status' && <FiRefreshCcw className='h-4 w-4' />}
              </ActionIcon>
            </Tooltip>
          ))}
        </div>

        <ConfirmationModalComponent />
      </>
    ),
  }),
  columnHelper.accessor('name', {
    id: 'name',
    size: 150,
    header: () => 'Nama',
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('username', {
    id: 'username',
    size: 150,
    header: () => 'Username',
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('accountStatus', {
    id: 'accountStatus',
    size: 100,
    header: () => 'Status Akun',
    cell: (info) => {
      const isActive = info.getValue();
      return (
        <span className={cn(isActive ? badgeColorClass.green : badgeColorClass.red, baseBadgeClass)}>
          {isActive ? 'Aktif' : 'Nonaktif'}
        </span>
      );
    },
    enableSorting: true,
  }),
  columnHelper.accessor('role', {
    id: 'role',
    size: 150,
    header: () => 'Role',
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
];
