import { mapPoPrStatusToColor } from "@/config/global-variables";
import { useConfirmationModal } from "@/hooks/use-confirmation-modal";
import { Colors, PoPrStatusType } from "@/models/global.model";
import { PurchaseReturnModel } from "@/models/purchase-return.model";
import { formatToCurrency, isoStringToReadableDate } from "@/utils/helper-function";
import { badgeColorClass, baseBadgeClass } from "@/utils/tailwind-classes";
import { ColumnDef, Row, createColumnHelper } from "@tanstack/react-table";
import { FaRegTrashAlt } from 'react-icons/fa';
import { ActionIcon, Dropdown } from 'rizzui';
import { IoCheckmarkDoneSharp } from 'react-icons/io5';
import cn from '@/utils/class-names';
import { LuCircleSlash, LuEye, LuMoreVertical, LuPencil } from "react-icons/lu";
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
          <Link href={routes.transaction.purchaseOrder.view(row.original.id)}>
            <Dropdown.Item>
              <LuEye className='text-blue-500 w-5 h-5 cursor-pointer mr-3' /> Detail
            </Dropdown.Item>
          </Link>

          {/* edit */}
          {row.original.status === 'Dalam Proses' && (
            <Link href={routes.transaction.purchaseOrder.edit(row.original.id)}>
              <Dropdown.Item>
                <LuPencil className='text-yellow-500 w-5 h-5 cursor-pointer mr-3' /> Edit
              </Dropdown.Item>
            </Link>
          )}

          {/* finish */}
          {row.original.status === 'Dalam Proses' && (
            <Dropdown.Item
              onClick={() => {
                openConfirmationModal({
                  title: 'Selesaikan Transaksi Pembelian',
                  description:
                    'Transaksi yang sudah diselesaikan tidak dapat diedit atau dihapus lagi. Apakah Anda yakin?',
                  handleConfirm: () => actionHandlers.finish(row.original.id),
                });
              }}
            >
              <IoCheckmarkDoneSharp className='text-green-500 w-5 h-5 cursor-pointer mr-3' /> Selesai
            </Dropdown.Item>
          )}

          {/* delete */}
          {row.original.status === 'Dalam Proses' && (
            <Dropdown.Item
              onClick={() => {
                openConfirmationModal({
                  title: 'Hapus Transaksi Pembelian',
                  description: 'Transaksi yang sudah dihapus tidak dapat dikembalikan lagi. Apakah Anda yakin?',
                  handleConfirm: () => actionHandlers.delete(row.original.id),
                });
              }}
            >
              <FaRegTrashAlt className='text-red-500 w-5 h-4 cursor-pointer mr-3' /> Hapus
            </Dropdown.Item>
          )}

          {/* cancel */}
          {role === 'Admin' && row.original.status === 'Selesai' && (
            <Dropdown.Item
              onClick={() => {
                openConfirmationModal({
                  title: 'Batalkan Transaksi Pembelian',
                  description:
                    'Stok barang akan dikurangi dengan stok dari detail transaksi pembelian ini. Apakah Anda yakin?',
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
    cell: (info) => `Rp ${formatToCurrency(info.getValue())}`,
    enableSorting: true,
  }),
  columnHelper.accessor('status', {
    id: 'status',
    size: 150,
    header: () => 'Status',
    cell: (info) => {
      const status = info.getValue() as PoPrStatusType;
      const color = mapPoPrStatusToColor[status] as Colors;
      return <span className={cn(badgeColorClass[color], baseBadgeClass)}>{status}</span>;
    },
    enableSorting: true,
  }),
];
