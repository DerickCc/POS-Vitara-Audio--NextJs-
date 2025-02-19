'use client';

import PageHeader from '@/components/page-header';
import BasicTable from '@/components/tables/basic-table';
import { routes } from '@/config/routes';
import { SalesReturnModel } from '@/models/sales-return.model';
import { browseSr, cancelSr, exportSr } from '@/services/sales-return-service';
import { OnChangeFn, SortingState } from '@tanstack/react-table';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiArrowLineUpBold, PiPlusBold } from 'react-icons/pi';
import { Button } from 'rizzui';
import { columns } from './column';
import SalesReturnFilter, { SalesReturnTableFilters } from './filter';
import { useOverlayLoading } from '@/hooks/use-overlay-loading';
import Spinner from '@/components/spinner';
import cn from '@/utils/class-names';
import { baseButtonClass, buttonColorClass } from '@/config/tailwind-classes';

const pageHeader = {
  title: 'Retur Penjualan',
  breadcrumb: [
    {
      name: 'Inventori',
    },
    {
      href: routes.inventory.salesReturn.data,
      name: 'Retur Penjualan',
    },
  ],
};

export default function SalesReturnDataPage() {
  const [salesReturns, setSalesReturns] = useState<SalesReturnModel[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [localFilters, setLocalFilters] = useState<SalesReturnTableFilters>({
    startDate: null,
    endDate: null,
  });
  const [filters, setFilters] = useState<SalesReturnTableFilters>({
    startDate: null,
    endDate: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { showOverlayLoading, hideOverlayLoading } = useOverlayLoading();
  const [totalRowCount, setTotalRowCount] = useState(0);

  const fetchSalesOrderReturns = useCallback(async () => {
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

      const { result, recordsTotal } = await browseSr({ pageSize, pageIndex, sortColumn, sortOrder, filters });

      setSalesReturns(result);
      setTotalRowCount(recordsTotal);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, pageIndex, sorting, filters]);

  useEffect(() => {
    fetchSalesOrderReturns();
  }, [fetchSalesOrderReturns]);

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
      fetchSalesOrderReturns();
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

      await exportSr({ sortColumn, sortOrder, filters });
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    } finally {
      hideOverlayLoading();
      setIsExporting(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const message = await cancelSr(id);
      toast.success(message, { duration: 5000 });

      fetchSalesOrderReturns();
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  };

  const actionHandlers: any = {
    cancel: (id: string) => handleCancel(id),
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
          <Link href={routes.inventory.salesReturn.add} className='w-full sm:w-auto'>
            <Button className={cn(buttonColorClass.green, baseButtonClass, 'w-full sm:w-auto')}>
              <PiPlusBold className='me-1.5 h-[17px] w-[17px]' />
              Tambah
            </Button>
          </Link>
        </div>
      </PageHeader>

      <SalesReturnFilter
        localFilters={localFilters}
        setLocalFilters={setLocalFilters}
        handleSearch={() => handleSearch()}
      />

      <BasicTable<SalesReturnModel>
        data={salesReturns}
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
