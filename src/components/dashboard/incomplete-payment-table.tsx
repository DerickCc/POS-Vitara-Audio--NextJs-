'use client';

import BasicTable from '@/components/tables/basic-table';
import { routes } from '@/config/routes';
import { IncompletePaymentModel } from '@/models/dashboard.model';
import { browseIncompletePayment } from '@/services/dashboard-service';
import { formatToReadableNumber } from '@/utils/helper-function';
import { ColumnDef, OnChangeFn, SortingState, createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiCashRegisterDuotone } from 'react-icons/pi';

const columnHelper = createColumnHelper<IncompletePaymentModel>();
const columns = (): ColumnDef<IncompletePaymentModel, any>[] => [
  columnHelper.accessor('soCode', {
    id: 'code',
    size: 100,
    header: 'Kode',
    cell: ({ row }) => (
      <Link href={routes.transaction.salesOrder.detail(row.original.soId)}>
        <span className='text-primary'>{row.original.soCode}</span>
      </Link>
    ),
    enableSorting: true,
  }),
  columnHelper.accessor('customerName', {
    id: 'customerName',
    size: 160,
    header: () => 'Pelanggan',
    cell: ({ row }) => (
      <>
        <span>{row.original.customerName}</span>
        <br/>
        <span>({row.original.customerLicensePlate})</span>
      </>
    ),
    enableSorting: true,
  }),
  columnHelper.accessor('grandTotal', {
    id: 'grandTotal',
    size: 100,
    header: () => 'Grand Total',
    cell: (info) => `Rp ${formatToReadableNumber(info.getValue())}`,
    enableSorting: true,
  }),
  columnHelper.accessor('paidAmount', {
    id: 'paidAmount',
    size: 100,
    header: () => 'Dibayar',
    cell: (info) => `Rp ${formatToReadableNumber(info.getValue())}`,
    enableSorting: false,
  }),
];

export default function IncompletePaymentTable() {
  const [incompletePayments, setIncompletePayments] = useState<IncompletePaymentModel[]>([]);
  const [pageSize, setPageSize] = useState(5);
  const [pageIndex, setPageIndex] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalRowCount, setTotalRowCount] = useState(0);

  const fetchIncompletePayments = useCallback(async () => {
    try {
      setIsLoading(true);

      const sortColumn = sorting.length > 0 ? sorting[0].id : null;
      const sortOrder = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : null;

      const { result, recordsTotal } = await browseIncompletePayment({ pageSize, pageIndex, sortColumn, sortOrder });

      setIncompletePayments(result);
      setTotalRowCount(recordsTotal);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, pageIndex, sorting]);

  useEffect(() => {
    fetchIncompletePayments();
  }, [fetchIncompletePayments]);

  const handlePageSizeChange = (newPageSize: number) => {
    setPageIndex(0);
    setPageSize(newPageSize);
  };

  const handlePageIndexChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  };

  const handleSortingChange: OnChangeFn<SortingState> = (newSorting) => {
    setPageIndex(0);
    setSorting(newSorting);
  };

  return (
    <BasicTable<IncompletePaymentModel>
      header={tableHeader()}
      data={incompletePayments}
      columns={columns()}
      pageSize={pageSize}
      setPageSize={handlePageSizeChange}
      pageIndex={pageIndex}
      setPageIndex={handlePageIndexChange}
      sorting={sorting}
      setSorting={handleSortingChange}
      isLoading={isLoading}
      totalRowCount={totalRowCount}
    />
  );
}

function tableHeader() {
  return (
    <div className='m-4 flex items-center'>
      <PiCashRegisterDuotone className='size-6 me-2 text-red' />
      <h5 className='font-medium'>Transaksi Penjualan Belum Lunas</h5>
    </div>
  );
}
