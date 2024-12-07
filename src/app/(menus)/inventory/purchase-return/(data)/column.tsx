import { mapTrxStatusToColor } from '@/config/global-variables';
import { useConfirmationModal } from '@/hooks/use-confirmation-modal';
import { Colors, PoPrSrStatusType } from '@/models/global.model';
import { PurchaseReturnModel } from '@/models/purchase-return.model';
import { formatToReadableNumber, isoStringToReadableDate } from '@/utils/helper-function';
import { badgeColorClass, baseBadgeClass } from '@/config/tailwind-classes';
import { ColumnDef, Row, createColumnHelper } from '@tanstack/react-table';
import { ActionIcon, Dropdown } from 'rizzui';
import { IoCheckmarkDoneSharp } from 'react-icons/io5';
import cn from '@/utils/class-names';
import { LuCircleSlash, LuEye, LuMoreVertical } from 'react-icons/lu';
import { routes } from '@/config/routes';
import Link from 'next/link';

function ActionColumn({
  row,
  actionHandlers,
  role,
}: {
  row: Row<PurchaseReturnModel>;
  actionHandlers: any;
  role: string;
}) {
  const { openConfirmationModal, ConfirmationModalComponent } = useConfirmationModal();

  return (
    <>
      <Dropdown>
        <Dropdown.Trigger>
          <ActionIcon as='span' variant='outline' rounded='full' className='p-0'>
            <LuMoreVertical className='size-5 text-primary' />
          </ActionIcon>
        </Dropdown.Trigger>

        <Dropdown.Menu style={{ fontSize: 15 }}>
          {/* detail */}
          <Link href={routes.inventory.purchaseReturn.view(row.original.id)}>
            <Dropdown.Item>
              <LuEye className='text-blue-500 w-5 h-5 cursor-pointer mr-3' /> Detail
            </Dropdown.Item>
          </Link>

          {/* finish */}
          {row.original.status === 'Dalam Proses' && (
            <Dropdown.Item
              onClick={() => {
                const note =
                  row.original.returnType === 'Penggantian Barang'
                    ? 'barang yang diretur telah diterima'
                    : 'dana telah dikembalikan oleh supplier dengan jumlah yang sesuai';

                openConfirmationModal({
                  title: 'Selesaikan Retur Pembelian',
                  description: `Mohon hanya selesaikan retur ini jika ${note}. Selesaikan retur?`,
                  handleConfirm: () => actionHandlers.finish(row.original.id),
                });
              }}
            >
              <IoCheckmarkDoneSharp className='text-green-500 w-5 h-5 cursor-pointer mr-3' /> Selesai
            </Dropdown.Item>
          )}

          {/* cancel */}
          {role === 'Admin' && (
            <Dropdown.Item
              onClick={() => {
                openConfirmationModal({
                  title: 'Batalkan Retur Pembelian',
                  description:
                    'Stok barang-barang yang diretur akan kembali ke stok semula sebelum diretur. Apakah Anda yakin?',
                  handleConfirm: () => actionHandlers.cancel(row.original.id),
                });
              }}
            >
              <LuCircleSlash className='text-red-500 w-5 h-5 cursor-pointer mr-3' /> Batal
            </Dropdown.Item>
          )}
        </Dropdown.Menu>
      </Dropdown>

      <ConfirmationModalComponent />
    </>
  );
}

const columnHelper = createColumnHelper<PurchaseReturnModel>();

export const columns = ({
  actionHandlers,
  role,
}: {
  actionHandlers: any;
  role: string;
}): ColumnDef<PurchaseReturnModel, any>[] => [
  columnHelper.display({
    id: 'actions',
    size: 60,
    header: () => 'Aksi',
    cell: ({ row }) => <ActionColumn row={row} actionHandlers={actionHandlers} role={role} />,
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
  columnHelper.accessor('poCode', {
    id: 'poCode',
    size: 150,
    header: () => 'Kode Transaksi Pembelian',
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('returnType', {
    id: 'returnType',
    size: 150,
    header: () => 'Tipe Retur',
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('supplierName', {
    id: 'supplierName',
    size: 150,
    header: () => 'Supplier',
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
      const status = info.getValue() as PoPrSrStatusType;
      const color = mapTrxStatusToColor[status] as Colors;
      return <span className={cn(badgeColorClass[color], baseBadgeClass)}>{status}</span>;
    },
    enableSorting: true,
  }),
];
