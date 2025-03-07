import { routes } from '@/config/routes';
import { ColumnDef, createColumnHelper, Row } from '@tanstack/react-table';
import Link from 'next/link';
import { LuEye, LuPencil, LuCircleSlash } from 'react-icons/lu';
import { FiMoreVertical } from 'react-icons/fi';
import { PurchaseOrderModel } from '@/models/purchase-order.model';
import { formatToReadableNumber, isoStringToReadableDate } from '@/utils/helper-function';
import cn from '@/utils/class-names';
import { mapTrxStatusToColor } from '@/config/global-variables';
import { badgeColorClass, baseBadgeClass } from '@/config/tailwind-classes';
import { FaRegMoneyBillAlt, FaRegTrashAlt } from 'react-icons/fa';
import { ActionIcon, Dropdown } from 'rizzui';
import { IoCheckmarkDoneSharp } from 'react-icons/io5';
import { useConfirmationModal } from '@/hooks/use-confirmation-modal';
import { usePaymentModal } from '@/hooks/use-payment-modal';
import { useAuth } from '@/hooks/use-auth';

function ActionColumn({ row, actionHandlers }: { row: Row<PurchaseOrderModel>; actionHandlers: any }) {
  const { openConfirmationModal, ConfirmationModalComponent } = useConfirmationModal();
  const { openPaymentModal, PaymentModalComponent } = usePaymentModal();
  const { user } = useAuth();

  return (
    <>
      <Dropdown>
        <Dropdown.Trigger>
          <ActionIcon as='span' variant='outline' rounded='full' className='p-0'>
            <FiMoreVertical className='size-5 text-primary' />
          </ActionIcon>
        </Dropdown.Trigger>

        <Dropdown.Menu style={{ fontSize: 15 }}>
          {/* detail */}
          <Link href={routes.transaction.purchaseOrder.detail(row.original.id)}>
            <Dropdown.Item>
              <LuEye className='text-blue-500 w-5 h-5 cursor-pointer mr-3' /> Detail
            </Dropdown.Item>
          </Link>

          {/* edit */}
          {row.original.progressStatus === 'Dalam Proses' && (
            <Link href={routes.transaction.purchaseOrder.edit(row.original.id)}>
              <Dropdown.Item>
                <LuPencil className='text-yellow-500 w-5 h-5 cursor-pointer mr-3' /> Edit
              </Dropdown.Item>
            </Link>
          )}

          {/* finish */}
          {row.original.progressStatus === 'Dalam Proses' && (
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

          {/* pay */}
          {row.original.progressStatus !== 'Batal' && row.original.paymentStatus === 'Belum Lunas' && (
            <Dropdown.Item
              onClick={() => {
                openPaymentModal({
                  id: row.original.id,
                  code: row.original.code,
                  type: 'po',
                  grandTotal: row.original.grandTotal,
                  paidAmount: row.original.paidAmount,
                  fetchData: actionHandlers.fetchData,
                });
              }}
            >
              <FaRegMoneyBillAlt className='text-green-500 size-5 cursor-pointer mr-3' /> Bayar
            </Dropdown.Item>
          )}

          {/* delete */}
          {row.original.progressStatus === 'Dalam Proses' && (
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
          {user?.role === "Admin" && row.original.progressStatus === 'Selesai' && (
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
      <PaymentModalComponent />
    </>
  );
}

const columnHelper = createColumnHelper<PurchaseOrderModel>();

export const columns = ({ actionHandlers }: { actionHandlers: any }): ColumnDef<PurchaseOrderModel, any>[] => [
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
  columnHelper.accessor('purchaseDate', {
    id: 'purchaseDate',
    size: 170,
    header: () => 'Tanggal Pembelian',
    cell: (info) => isoStringToReadableDate(info.getValue()),
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
    size: 150,
    header: () => 'Grand Total',
    cell: (info) => `Rp ${formatToReadableNumber(info.getValue())}`,
    enableSorting: true,
  }),
  columnHelper.accessor('progressStatus', {
    id: 'progressStatus',
    size: 150,
    header: () => 'Status Pengiriman',
    cell: (info) => {
      const status = info.getValue();
      const color = mapTrxStatusToColor[status];
      return <span className={cn(badgeColorClass[color], baseBadgeClass)}>{status}</span>;
    },
    enableSorting: true,
  }),
  columnHelper.accessor('paymentStatus', {
    id: 'paymentStatus',
    size: 200,
    header: () => 'Status Pembayaran',
    cell: ({ row }) => {
      const status = row.original.paymentStatus;
      const remainingAmount = row.original.grandTotal - row.original.paidAmount;
      const color = mapTrxStatusToColor[status];
      return (
        <>
          <span className={cn(badgeColorClass[color], baseBadgeClass)}>{status}</span>
          {status === 'Belum Lunas' && (
            <div className='mt-2'>Sisa: {`Rp ${formatToReadableNumber(remainingAmount)}`}</div>
          )}
        </>
      );
    },
    enableSorting: true,
  }),
  columnHelper.accessor('remarks', {
    id: 'remarks',
    size: 250,
    header: () => 'Keterangan',
    cell: (info) => info.getValue() || '-',
    enableSorting: false,
  }),
];
