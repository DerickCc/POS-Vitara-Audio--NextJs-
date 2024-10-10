import { routes } from '@/config/routes';
import { formatToCurrency, formatToDecimal } from '@/utils/helper-function';
import { createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';
import { LuPencil } from 'react-icons/lu';
import { ActionIcon, Tooltip, cn } from 'rizzui';
import Image from 'next/image';
import imgPlaceholder from '@public/image-placeholder.png';
import { ProductModel } from '@/models/product.model';
import { TableColumnProps } from '@/models/global.model';
import { actionIconColorClass } from '@/utils/tailwind-classes';
import { FaRegTrashAlt } from 'react-icons/fa';

const columnHelper = createColumnHelper<ProductModel>();

export const columns = ({ actions, openModal, ConfirmationModalComponent }: TableColumnProps) => [
  columnHelper.display({
    id: 'actions',
    size: 100,
    header: () => 'Aksi',
    cell: ({ row }) => (
      <>
        <div className='flex items-center justify-center gap-3'>
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
                {action.label === 'Hapus' && <FaRegTrashAlt className='h-4 w-4' />}
              </ActionIcon>
            </Tooltip>
          ))}
        </div>
        <ConfirmationModalComponent />
      </>
    ),
  }),
  columnHelper.accessor('photo', {
    id: 'photo',
    size: 200,
    header: () => 'Foto',
    cell: (info) => (
      <Image
        src={info.getValue() ? `/product-photo/${info.getValue()}` : imgPlaceholder}
        alt='Foto Barang'
        width={150}
        height={150}
      />
    ),
    enableSorting: false,
  }),
  columnHelper.accessor('name', {
    id: 'name',
    size: 200,
    header: () => 'Nama',
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
  columnHelper.accessor('costPriceCode', {
    id: 'costPriceCode',
    size: 160,
    header: () => 'Harga Modal (Kode)',
    cell: (info) => info.getValue() || '-',
    enableSorting: false,
  }),
  columnHelper.accessor('purchasePrice', {
    id: 'purchasePrice',
    size: 160,
    header: () => 'Harga Beli',
    cell: (info) => `Rp ${formatToCurrency(info.getValue())}`,
    enableSorting: true,
  }),
  columnHelper.accessor('sellingPrice', {
    id: 'sellingPrice',
    size: 160,
    header: () => 'Harga Jual',
    cell: (info) => `Rp ${formatToCurrency(info.getValue())}`,
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
