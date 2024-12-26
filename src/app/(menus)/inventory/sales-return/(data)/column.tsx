import { mapTrxStatusToColor } from '@/config/global-variables';
import { useConfirmationModal } from '@/hooks/use-confirmation-modal';
import { formatToReadableNumber, isoStringToReadableDate } from '@/utils/helper-function';
import { actionIconColorClass, badgeColorClass, baseBadgeClass } from '@/config/tailwind-classes';
import { ColumnDef, Row, createColumnHelper } from '@tanstack/react-table';
import { ActionIcon, Tooltip } from 'rizzui';
import cn from '@/utils/class-names';
import { LuCircleSlash, LuEye } from 'react-icons/lu';
import { routes } from '@/config/routes';
import Link from 'next/link';
import { SalesReturnModel } from '@/models/sales-return.model';
import { useAuth } from '@/hooks/use-auth';

function ActionColumn({ row, actionHandlers }: { row: Row<SalesReturnModel>; actionHandlers: any }) {
  const { openConfirmationModal, ConfirmationModalComponent } = useConfirmationModal();
  const { user } = useAuth();

  return (
    <>
      <div className='flex items-center justify-center gap-3'>
        {/* detail */}
        <Tooltip size='sm' content='Detail' color='invert'>
          <Link
            href={routes.inventory.salesReturn.detail(row.original.id)}
            aria-label='ke halaman detail retur penjualan'
          >
            <ActionIcon
              as='span'
              size='sm'
              variant='outline'
              className='text-blue-500 hover:border-blue-600 hover:text-blue-600'
            >
              <LuEye className='size-4' />
            </ActionIcon>
          </Link>
        </Tooltip>

        {/* cancel */}
        {user?.role === 'Admin' && row.original.status === 'Selesai' && (
          <Tooltip size='sm' content='Batal' color='invert'>
            <ActionIcon
              size='sm'
              variant='outline'
              className={cn(actionIconColorClass.red, 'cursor-pointer')}
              onClick={() => {
                openConfirmationModal({
                  title: 'Batalkan Retur Penjualan',
                  description:
                    'Stok barang-barang yang diretur akan kembali ke stok semula sebelum diretur. Apakah Anda yakin?',
                  handleConfirm: () => actionHandlers.cancel(row.original.id),
                });
              }}
            >
              <LuCircleSlash className='h-4 w-4' />
            </ActionIcon>
          </Tooltip>
        )}
      </div>

      <ConfirmationModalComponent />
    </>
  );
}

const columnHelper = createColumnHelper<SalesReturnModel>();

export const columns = ({ actionHandlers }: { actionHandlers: any }): ColumnDef<SalesReturnModel, any>[] => [
  columnHelper.display({
    id: 'actions',
    size: 60,
    header: () => 'Aksi',
    cell: ({ row }) => <ActionColumn row={row} actionHandlers={actionHandlers} />,
  }),
  columnHelper.accessor('code', {
    id: 'code',
    size: 100,
    header: () => 'Kode',
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('returnDate', {
    id: 'returnDate',
    size: 160,
    header: () => 'Tanggal Retur',
    cell: (info) => isoStringToReadableDate(info.getValue()),
    enableSorting: true,
  }),
  columnHelper.accessor('soCode', {
    id: 'soCode',
    size: 150,
    header: () => 'Kode Transaksi Penjualan',
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('customerName', {
    id: 'customerName',
    size: 150,
    header: () => 'Pelanggan',
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('grandTotal', {
    id: 'grandTotal',
    size: 130,
    header: () => 'Grand Total Retur',
    cell: (info) => `Rp ${formatToReadableNumber(info.getValue())}`,
    enableSorting: true,
  }),
  columnHelper.accessor('status', {
    id: 'status',
    size: 150,
    header: () => 'Status',
    cell: (info) => {
      const status = info.getValue();
      const color = mapTrxStatusToColor[status];
      return <span className={cn(badgeColorClass[color], baseBadgeClass)}>{status}</span>;
    },
    enableSorting: true,
  }),
];
