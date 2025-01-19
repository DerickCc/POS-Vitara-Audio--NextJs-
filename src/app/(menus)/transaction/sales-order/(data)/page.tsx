'use client';

import { routes } from '@/config/routes';
import { SalesOrderModel } from '@/models/sales-order';
import { browseSo, cancelSo, deleteSo, exportSo } from '@/services/sales-order-service';
import { OnChangeFn, SortingState } from '@tanstack/react-table';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import SalesOrderFilter, { SalesOrderFilters } from './filters';
import BasicTable from '@/components/tables/basic-table';
import PageHeader from '@/components/page-header';
import { Button } from 'rizzui';
import { PiArrowLineUpBold, PiPlusBold } from 'react-icons/pi';
import Link from 'next/link';
import { columns } from './columns';
import Spinner from '@/components/spinner';
import { useOverlayLoading } from '@/hooks/use-overlay-loading';
import { handleTableAction } from '@/utils/handle-table-action';

const pageHeader = {
  title: 'Penjualan',
  breadcrumb: [
    {
      name: 'Transaksi',
    },
    {
      href: routes.transaction.salesOrder.data,
      name: 'Penjualan',
    },
  ],
};

export default function SalesOrderDataPage() {
  const [salesOrders, setSalesOrders] = useState<SalesOrderModel[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [localFilters, setLocalFilters] = useState<SalesOrderFilters>({
    startDate: null,
    endDate: null,
  });
  const [filters, setFilters] = useState<SalesOrderFilters>({
    startDate: null,
    endDate: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { showOverlayLoading, hideOverlayLoading } = useOverlayLoading();
  const [totalRowCount, setTotalRowCount] = useState(0);

  const fetchSalesOrders = useCallback(async () => {
    try {
      setIsLoading(true);

      const sortColumn = sorting.length > 0 ? sorting[0].id : null;
      const sortOrder = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : null;

      if (filters.startDate && typeof filters.startDate === 'object') {
        filters.startDate = filters.startDate.toISOString();
      }
      if (filters.endDate && typeof filters.endDate === 'object') {
        filters.endDate = filters.endDate.toISOString();
      }

      const { result, recordsTotal } = await browseSo({ pageSize, pageIndex, sortColumn, sortOrder, filters });

      setSalesOrders(result);
      setTotalRowCount(recordsTotal);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, pageIndex, sorting, filters]);

  useEffect(() => {
    fetchSalesOrders();
  }, [fetchSalesOrders]);

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

  const handleSearch = () => {
    if (pageIndex === 0 && localFilters === filters) {
      fetchSalesOrders();
    } else {
      setPageIndex(0);
      setFilters(localFilters);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      showOverlayLoading('Sedang meng-export data...');

      const sortColumn = sorting.length > 0 ? sorting[0].id : null;
      const sortOrder = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : null;

      await exportSo({ sortColumn, sortOrder, filters });
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    } finally {
      hideOverlayLoading();
      setIsExporting(false);
    }
  };

  const actionHandlers: any = {
    cancel: (id: string) => handleTableAction(cancelSo, fetchSalesOrders, id),
    delete: (id: string) => handleTableAction(deleteSo, fetchSalesOrders, id),
    fetchData: () => fetchSalesOrders(),
  };

  return (
    <>
      <PageHeader {...pageHeader}>
        <div className='flex items-center gap-3 mt-4 sm:mt-0'>
          <Button
            variant='outline'
            className='w-full sm:w-auto'
            disabled={isExporting}
            onClick={() => handleExportExcel()}
          >
            {isExporting ? (
              <>
                <Spinner className='mr-2' /> Sedang Meng-export
              </>
            ) : (
              <>
                <PiArrowLineUpBold className='me-1.5 h-[17px] w-[17px]' /> Export Excel
              </>
            )}
          </Button>
          <Link href={routes.transaction.salesOrder.add} className='w-full sm:w-auto'>
            <Button className='w-full sm:w-auto'>
              <PiPlusBold className='me-1.5 h-[17px] w-[17px]' />
              Tambah
            </Button>
          </Link>
        </div>
      </PageHeader>

      <SalesOrderFilter
        localFilters={localFilters}
        setLocalFilters={setLocalFilters}
        handleSearch={() => handleSearch()}
      />

      <BasicTable<SalesOrderModel>
        data={salesOrders}
        columns={columns({ actionHandlers })}
        pageSize={pageSize}
        setPageSize={handlePageSizeChange}
        pageIndex={pageIndex}
        setPageIndex={handlePageIndexChange}
        sorting={sorting}
        setSorting={handleSortingChange}
        isLoading={isLoading}
        totalRowCount={totalRowCount}
      />
    </>
  );
}
