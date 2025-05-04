'use client';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { formatToReadableNumber, isoStringToReadableDate } from '@/utils/helper-function';
import cn from '@/utils/class-names';
import { mapTrxStatusToColor } from '@/config/global-variables';
import { badgeColorClass, baseBadgeClass } from '@/config/tailwind-classes';
import { SalesOrderModel } from '@/models/sales-order';
import { ActionIcon, Dropdown } from 'rizzui';
import { routes } from '@/config/routes';
import Link from 'next/link';
import { LuEye, LuCircleSlash, LuPrinter, LuPencil } from 'react-icons/lu';
import { FiMoreVertical } from 'react-icons/fi';
import { Row } from '@tanstack/react-table';
import { useConfirmationModal } from '@/hooks/use-confirmation-modal';
import { FaRegMoneyBillAlt, FaRegTrashAlt } from 'react-icons/fa';
import { usePaymentModal } from '@/hooks/use-payment-modal';
import { IoCheckmarkDoneSharp } from 'react-icons/io5';
import { useAuth } from '@/hooks/use-auth';
import PaymentHistoryPopover from '@/components/payment-history-popover';

function ActionColumn({ row, actionHandlers }: { row: Row<SalesOrderModel>; actionHandlers: any }) {
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
          <Link href={routes.transaction.salesOrder.detail(row.original.id)}>
            <Dropdown.Item>
              <LuEye className='text-blue-500 w-5 h-5 cursor-pointer mr-3' /> Detail
            </Dropdown.Item>
          </Link>

          {/* edit */}
          {row.original.progressStatus === 'Belum Dikerjakan' && (
            <Link href={routes.transaction.salesOrder.edit(row.original.id)}>
              <Dropdown.Item>
                <LuPencil className='text-yellow-500 w-5 h-5 cursor-pointer mr-3' /> Edit
              </Dropdown.Item>
            </Link>
          )}

          {/* finish */}
          {user?.role === 'Admin' && row.original.progressStatus === 'Belum Dikerjakan' && (
            <Dropdown.Item
              onClick={() => {
                openConfirmationModal({
                  title: 'Selesaikan Transaksi Penjualan',
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
                  type: 'so',
                  grandTotal: row.original.grandTotal,
                  paidAmount: row.original.paidAmount,
                  fetchData: actionHandlers.fetchData,
                });
              }}
            >
              <FaRegMoneyBillAlt className='text-green-500 size-5 cursor-pointer mr-3' /> Bayar
            </Dropdown.Item>
          )}

          {/* print */}
          {row.original.progressStatus !== 'Batal' && (
            <Link href={routes.transaction.salesOrder.print(row.original.id)}>
              <Dropdown.Item>
                <LuPrinter className='text-purple-500 size-5 cursor-pointer mr-3' /> Print
              </Dropdown.Item>
            </Link>
          )}

          {/* delete */}
          {row.original.progressStatus === 'Belum Dikerjakan' && (
            <Dropdown.Item
              onClick={() => {
                openConfirmationModal({
                  title: 'Hapus Transaksi Penjualan',
                  description: 'Transaksi yang sudah dihapus tidak dapat dikembalikan lagi. Apakah Anda yakin?',
                  handleConfirm: () => actionHandlers.delete(row.original.id),
                });
              }}
            >
              <FaRegTrashAlt className='text-red-500 w-5 h-4 cursor-pointer mr-3' /> Hapus
            </Dropdown.Item>
          )}

          {/* cancel */}
          {user?.role === 'Admin' && row.original.progressStatus === 'Selesai' && (
            <Dropdown.Item
              onClick={() => {
                openConfirmationModal({
                  title: 'Batalkan Transaksi Penjualan',
                  description:
                    'Stok barang akan ditambah dengan stok dari detail transaksi penjualan ini. Apakah Anda yakin?',
                  handleConfirm: () => actionHandlers.cancel(row.original.id),
                });
              }}
            >
              <LuCircleSlash className='text-red-500 size-5 cursor-pointer mr-3' /> Batal
            </Dropdown.Item>
          )}
        </Dropdown.Menu>
      </Dropdown>

      <ConfirmationModalComponent />
      <PaymentModalComponent />
    </>
  );
}

const columnHelper = createColumnHelper<SalesOrderModel>();

export const columns = ({ actionHandlers }: { actionHandlers: any }): ColumnDef<SalesOrderModel, any>[] => [
  columnHelper.display({
    id: 'actions',
    size: 60,
    header: () => 'Aksi',
    cell: ({ row }) => <ActionColumn row={row} actionHandlers={actionHandlers} />,
  }),
  columnHelper.accessor('code', {
    id: 'code',
    size: 120,
    header: () => 'Kode',
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('salesDate', {
    id: 'salesDate',
    size: 170,
    header: () => 'Tanggal Penjualan',
    cell: (info) => isoStringToReadableDate(info.getValue()),
    enableSorting: true,
  }),
  columnHelper.accessor('customerName', {
    id: 'customerName',
    size: 200,
    header: () => 'Pelanggan',
    cell: ({ row }) => (
      <>
        <span>{row.original.customerName}</span>
        <br />
        <span>({row.original.customerLicensePlate})</span>
      </>
    ),
    enableSorting: true,
  }),
  columnHelper.accessor('grandTotal', {
    id: 'grandTotal',
    size: 130,
    header: () => 'Grand Total',
    cell: (info) => `Rp ${formatToReadableNumber(info.getValue())}`,
    enableSorting: true,
  }),
  columnHelper.accessor('progressStatus', {
    id: 'progressStatus',
    size: 170,
    header: () => 'Status Pengerjaan',
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
          {row.original.paymentHistory.length > 0 ? (
            <PaymentHistoryPopover row={row.original} color={color} />
          ) : (
            <span className={cn(badgeColorClass[color], baseBadgeClass)}>{status}</span>
          )}
          {status === 'Belum Lunas' && (
            <div className='mt-2'>Sisa: {`Rp ${formatToReadableNumber(remainingAmount)}`}</div>
          )}
        </>
      );
    },
    enableSorting: true,
  }),
  columnHelper.accessor('cashier', {
    id: 'cashier',
    size: 100,
    header: () => 'Kasir',
    cell: (info) => info.getValue(),
    enableSorting: false,
  }),
  columnHelper.accessor('remarks', {
    id: 'remarks',
    size: 350,
    header: () => 'Keterangan',
    cell: (info) => info.getValue() || '-',
    enableSorting: false,
  }),
];
