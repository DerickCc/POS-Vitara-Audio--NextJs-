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
import { LuEye, LuCircleSlash } from 'react-icons/lu';
import { FiMoreVertical } from 'react-icons/fi';
import { Row } from '@tanstack/react-table';
import { useConfirmationModal } from '@/hooks/use-confirmation-modal';
import { FaRegMoneyBillAlt } from 'react-icons/fa';
import { useSalesOrderPaymentModal } from '@/hooks/sales-order/use-payment-modal';
import { useAuth } from '@/hooks/use-auth';

function ActionColumn({
  row,
  actionHandlers,
  fetchSalesOrders,
}: {
  row: Row<SalesOrderModel>;
  actionHandlers: any;
  fetchSalesOrders: () => void;
}) {
  const { openConfirmationModal, ConfirmationModalComponent } = useConfirmationModal();
  const { openPaymentModal, SalesOrderPaymentModalComponent } = useSalesOrderPaymentModal();
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

          {/* pay */}
          {row.original.status === 'Belum Lunas' && (
            <Dropdown.Item
              onClick={() => {
                openPaymentModal({
                  soId: row.original.id,
                  soCode: row.original.code,
                  grandTotal: row.original.grandTotal,
                  paidAmount: row.original.paidAmount,
                  fetchSalesOrders,
                });
              }}
            >
              <FaRegMoneyBillAlt className='text-green-500 w-5 h-5 cursor-pointer mr-3' /> Bayar
            </Dropdown.Item>
          )}

          {/* cancel */}
          {user?.role === 'Admin' && row.original.status !== 'Batal' && (
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
              <LuCircleSlash className='text-red-500 w-5 h-5 cursor-pointer mr-3' /> Batal
            </Dropdown.Item>
          )}
        </Dropdown.Menu>
      </Dropdown>

      <ConfirmationModalComponent />
      <SalesOrderPaymentModalComponent />
    </>
  );
}

const columnHelper = createColumnHelper<SalesOrderModel>();

export const columns = ({
  actionHandlers,
  fetchSalesOrders,
}: {
  actionHandlers: any;
  fetchSalesOrders: () => void;
}): ColumnDef<SalesOrderModel, any>[] => [
  columnHelper.display({
    id: 'actions',
    size: 60,
    header: () => 'Aksi',
    cell: ({ row }) => <ActionColumn row={row} actionHandlers={actionHandlers} fetchSalesOrders={fetchSalesOrders} />,
  }),
  columnHelper.accessor('code', {
    id: 'code',
    size: 120,
    header: () => 'No. Invoice',
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
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('subTotal', {
    id: 'subTotal',
    size: 130,
    header: () => 'Sub Total',
    cell: (info) => `Rp ${formatToReadableNumber(info.getValue())}`,
    enableSorting: true,
  }),
  columnHelper.accessor('discount', {
    id: 'discount',
    size: 130,
    header: () => 'Diskon',
    cell: (info) => `Rp ${formatToReadableNumber(info.getValue())}`,
    enableSorting: true,
  }),
  columnHelper.accessor('grandTotal', {
    id: 'grandTotal',
    size: 130,
    header: () => 'Grand Total',
    cell: (info) => `Rp ${formatToReadableNumber(info.getValue())}`,
    enableSorting: true,
  }),
  columnHelper.accessor('paidAmount', {
    id: 'paidAmount',
    size: 130,
    header: () => 'Dibayar',
    cell: (info) => `Rp ${formatToReadableNumber(info.getValue())}`,
    enableSorting: false,
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
