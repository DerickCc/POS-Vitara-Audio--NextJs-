import DeletePopover from '@/components/delete-popover';
import { routes } from '@/config/routes';
import { formatToCurrency, formatToDecimal } from '@/utils/helper-function';
import { createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';
import { LuPencil } from 'react-icons/lu';
import { ActionIcon, Tooltip } from 'rizzui';
import Image from 'next/image';
import imgPlaceholder from '@public/image-placeholder.png';

export type ProductTableType = {
  id: string;
  photo: string;
  name: string;
  stock: number;
  uom: string;
  restockThreshold: number;
  costPriceCode: string;
  purchasePrice: number;
  sellingPrice: number;
  remarks: string;
};

const columnHelper = createColumnHelper<ProductTableType>();

export const columns = (handleDelete: (id: string) => void) => [
  columnHelper.display({
    id: 'actions',
    size: 100,
    header: () => 'Aksi',
    cell: ({ row }) => (
      <>
        <div className="flex items-center justify-center gap-3">
          <Tooltip size="sm" content="Edit" color="invert">
            <Link href={routes.inventory.product.edit(row.original.id)} aria-label="ke halaman edit barang">
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
          <DeletePopover
            title="Hapus Barang"
            description={`Apakah Anda yakin ingin menghapus '${row.original.name}'?`}
            onDelete={() => handleDelete(row.original.id)}
          />
        </div>
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
        alt="Foto Barang"
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
