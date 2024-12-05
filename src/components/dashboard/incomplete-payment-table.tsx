'use client';

import PaginationTable from '@/components/tables/pagination-table';
import { routes } from '@/config/routes';
import { IncompletePaymentModel } from '@/models/dashboard.model';
import { browseIncompletePayment } from '@/services/dashboard-service';
import { formatToCurrency } from '@/utils/helper-function';
import { ColumnDef, OnChangeFn, SortingState, createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const columnHelper = createColumnHelper<IncompletePaymentModel>();
const columns = (): ColumnDef<IncompletePaymentModel, any>[] => [
  columnHelper.accessor('soCode', {
    id: 'code',
    size: 100,
    header: 'No. Invoice',
    cell: ({ row }) => (
      <Link href={routes.transaction.salesOrder.view(row.original.soId)}>
        <span className='text-primary'>{row.original.soCode}</span>
      </Link>
    ),
    enableSorting: true,
  }),
  columnHelper.accessor('customerName', {
    id: 'customerName',
    size: 160,
    header: () => 'Pelanggan',
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('grandTotal', {
    id: 'grandTotal',
    size: 100,
    header: () => 'Grand Total',
    cell: (info) => `Rp ${formatToCurrency(info.getValue())}`,
    enableSorting: true,
  }),
  columnHelper.accessor('paidAmount', {
    id: 'paidAmount',
    size: 100,
    header: () => 'Dibayar',
    cell: (info) => `Rp ${formatToCurrency(info.getValue())}`,
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
    <PaginationTable<IncompletePaymentModel>
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
