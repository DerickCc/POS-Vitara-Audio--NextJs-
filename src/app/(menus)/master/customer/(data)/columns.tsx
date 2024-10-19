import { routes } from '@/config/routes';
import { useConfirmationModal } from '@/hooks/use-confirmation-modal';
import { CustomerModel } from '@/models/customer.model';
import { actionIconColorClass } from '@/utils/tailwind-classes';
import { ColumnDef, createColumnHelper, Row } from '@tanstack/react-table';
import Link from 'next/link';
import { FaRegTrashAlt } from 'react-icons/fa';
import { LuPencil } from 'react-icons/lu';
import { ActionIcon, Tooltip, cn } from 'rizzui';

function ActionColumn({ row, actionHandlers }: { row: Row<CustomerModel>; actionHandlers: any }) {
  const { openConfirmationModal, ConfirmationModalComponent } = useConfirmationModal();

  return (
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

        <Tooltip size='sm' content='Hapus' color='invert'>
          <ActionIcon
            size='sm'
            variant='outline'
            className={cn(actionIconColorClass.red, 'cursor-pointer')}
            onClick={() => {
              openConfirmationModal({
                title: 'Hapus Pelanggan',
                description: 'Transaksi yang sudah dihapus tidak dapat dikembalikan lagi. Apakah Anda yakin?',
                handleConfirm: () => actionHandlers.delete(row.original.id),
              });
            }}
          >
            <FaRegTrashAlt className='h-4 w-4' />
          </ActionIcon>
        </Tooltip>
      </div>

      <ConfirmationModalComponent />
    </>
  );
}

const columnHelper = createColumnHelper<CustomerModel>();

export const columns = (actionHandlers: any): ColumnDef<CustomerModel, any>[] => [
  columnHelper.display({
    id: 'actions',
    size: 100,
    header: () => 'Aksi',
    cell: ({ row }) => <ActionColumn row={row} actionHandlers={actionHandlers} />,
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
