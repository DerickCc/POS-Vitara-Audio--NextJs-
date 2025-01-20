import BasicTable from '@/components/tables/basic-table';
import { mapTrxStatusToColor } from '@/config/global-variables';
import { badgeColorClass, baseBadgeClass } from '@/config/tailwind-classes';
import { CustomerHistoryModel } from '@/models/customer.model';
import { browseCustomerHistories } from '@/services/customer-service';
import { formatToReadableNumber, isoStringToReadableDate, mapTrxToRoute } from '@/utils/helper-function';
import { ColumnDef, createColumnHelper, OnChangeFn, SortingState } from '@tanstack/react-table';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiFileTextDuotone } from 'react-icons/pi';
import { cn } from 'rizzui';

const columnHelper = createColumnHelper<CustomerHistoryModel>();
const columns = (): ColumnDef<CustomerHistoryModel, any>[] => [
  columnHelper.accessor('date', {
    id: 'createdAt',
    size: 120,
    header: () => 'Tanggal',
    cell: (info) => isoStringToReadableDate(info.getValue()),
    enableSorting: true,
  }),
  columnHelper.accessor('code', {
    id: 'code',
    size: 100,
    header: 'Kode',
    cell: ({ row }) => (
      <Link href={mapTrxToRoute(row.original.type, row.original.id)}>
        <span className='text-primary'>{row.original.code}</span>
      </Link>
    ),
    enableSorting: false,
  }),
  columnHelper.accessor('type', {
    id: 'type',
    size: 140,
    header: () => 'Tipe',
    cell: (info) => info.getValue(),
    enableSorting: false,
  }),
  columnHelper.accessor('progressStatus', {
    id: 'progressStatus',
    size: 100,
    header: () => 'Status Progres',
    cell: (info) => {
      const status = info.getValue();
      const color = mapTrxStatusToColor[status];
      return <span className={cn(badgeColorClass[color], baseBadgeClass)}>{status}</span>;
    },
    enableSorting: false,
  }),
  columnHelper.accessor('paymentStatus', {
    id: 'paymentStatus',
    size: 100,
    header: () => 'Status Pembayaran',
    cell: (info) => {
      const status = info.getValue();
      if (!status) return '-';
      
      const color = mapTrxStatusToColor[status];
      return <span className={cn(badgeColorClass[color], baseBadgeClass)}>{status}</span>;
    },
    enableSorting: false,
  }),
  columnHelper.accessor('grandTotal', {
    id: 'grandTotal',
    size: 130,
    header: () => 'Grand Total',
    cell: (info) => (info.getValue() === 0 ? '-' : `Rp ${formatToReadableNumber(info.getValue())}`),
    enableSorting: false,
  }),
];

export default function CustomerHistoryTable({ customerId }: { customerId: string }) {
  const [customerHistories, setCustomerHistories] = useState<CustomerHistoryModel[]>([]);
  const [pageSize, setPageSize] = useState(5);
  const [pageIndex, setPageIndex] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalRowCount, setTotalRowCount] = useState(0);

  const fetchCustomerHistories = useCallback(async () => {
    try {
      setIsLoading(true);

      const sortColumn = sorting.length > 0 ? sorting[0].id : null;
      const sortOrder = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : null;

      const { result, recordsTotal } = await browseCustomerHistories({
        filters: { customerId },
        pageSize,
        pageIndex,
        sortColumn,
        sortOrder,
      });

      setCustomerHistories(result);
      setTotalRowCount(recordsTotal);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, pageIndex, sorting]);

  useEffect(() => {
    fetchCustomerHistories();
  }, [fetchCustomerHistories]);

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
    <BasicTable<CustomerHistoryModel>
      header={tableHeader()}
      data={customerHistories}
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
      <PiFileTextDuotone className='size-6 me-2 text-primary' />
      <h5 className='font-medium'>Riwayat Pelanggan</h5>
    </div>
  );
}
