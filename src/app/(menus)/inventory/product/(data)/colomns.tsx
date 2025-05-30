import { routes } from '@/config/routes';
import { formatToReadableNumber, formatToDecimal } from '@/utils/helper-function';
import { ColumnDef, createColumnHelper, Row } from '@tanstack/react-table';
import Link from 'next/link';
import { LuEye, LuPencil } from 'react-icons/lu';
import { ActionIcon, Tooltip, cn } from 'rizzui';
import { ProductModel } from '@/models/product.model';
import { actionIconColorClass } from '@/config/tailwind-classes';
import { FaRegTrashAlt } from 'react-icons/fa';
import { useConfirmationModal } from '@/hooks/use-confirmation-modal';

function ActionColumn({ row, actionHandlers }: { row: Row<ProductModel>; actionHandlers: any }) {
  const { openConfirmationModal, ConfirmationModalComponent } = useConfirmationModal();

  return (
    <>
      <div className='flex items-center justify-center gap-3'>
        <Tooltip size='sm' content='Detail' color='invert'>
          <Link href={routes.inventory.product.detail(row.original.id)} aria-label='ke halaman detail barang'>
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

        <Tooltip size='sm' content='Edit' color='invert'>
          <Link href={routes.inventory.product.edit(row.original.id)} aria-label='ke halaman edit barang'>
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
                title: 'Hapus Barang',
                description: 'Barang yang sudah dihapus tidak dapat dikembalikan lagi. Apakah Anda yakin?',
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

const columnHelper = createColumnHelper<ProductModel>();

export const columns = (actionHandlers: any): ColumnDef<ProductModel, any>[] => [
  columnHelper.display({
    id: 'actions',
    size: 100,
    header: () => 'Aksi',
    cell: ({ row }) => <ActionColumn row={row} actionHandlers={actionHandlers} />,
  }),
  columnHelper.accessor('name', {
    id: 'name',
    size: 200,
    header: () => 'Nama',
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('type', {
    id: 'type',
    size: 130,
    header: () => 'Tipe',
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('stock', {
    id: 'stock',
    size: 100,
    header: () => 'Stok',
    cell: (info) => formatToDecimal(info.getValue()),
    enableSorting: true,
  }),
  columnHelper.accessor('uom', {
    id: 'uom',
    size: 150,
    header: () => 'Satuan',
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('restockThreshold', {
    id: 'restockThreshold',
    size: 100,
    header: () => 'Batas Restok',
    cell: (info) => formatToDecimal(info.getValue()),
    enableSorting: true,
  }),
  columnHelper.accessor('purchasePriceCode', {
    id: 'purchasePriceCode',
    size: 150,
    header: () => 'Harga Kode',
    cell: (info) => info.getValue() || '-',
    enableSorting: false,
  }),
  columnHelper.accessor('sellingPrice', {
    id: 'sellingPrice',
    size: 160,
    header: () => 'Harga Jual',
    cell: ({ row }) =>
      row.original.type === 'Barang Jadi' ? `Rp ${formatToReadableNumber(row.original.sellingPrice)}` : '-',
    enableSorting: true,
  }),
  columnHelper.accessor('remarks', {
    id: 'remarks',
    size: 300,
    header: () => 'Keterangan',
    cell: (info) => info.getValue() || '-',
    enableSorting: false,
  }),
];
