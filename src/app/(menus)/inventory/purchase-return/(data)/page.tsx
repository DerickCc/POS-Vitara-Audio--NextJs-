'use client';

import PageHeader from '@/components/page-header';
import BasicTable from '@/components/tables/basic-table';
import { routes } from '@/config/routes';
import { OnChangeFn, SortingState } from '@tanstack/react-table';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiArrowLineUpBold, PiPlusBold } from 'react-icons/pi';
import { Button } from 'rizzui';
import PurchaseReturnFilter, { PurchaseReturnTableFilters } from './filter';
import { PurchaseReturnModel } from '@/models/purchase-return.model';
import { browsePr, cancelPr, exportPr, finishPr } from '@/services/purchase-return-service';
import { columns } from './column';
import Spinner from '@/components/spinner';
import { useOverlayLoading } from '@/hooks/use-overlay-loading';
import cn from '@/utils/class-names';
import { baseButtonClass, buttonColorClass } from '@/config/tailwind-classes';
import { useAuth } from '@/hooks/use-auth';

const pageHeader = {
  title: 'Retur Pembelian',
  breadcrumb: [
    {
      name: 'Inventori',
    },
    {
      href: routes.inventory.purchaseReturn.data,
      name: 'Retur Pembelian',
    },
  ],
};

export default function PurchaseReturnDataPage() {
  const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturnModel[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [localFilters, setLocalFilters] = useState<PurchaseReturnTableFilters>({
    startDate: null,
    endDate: null,
  });
  const [filters, setFilters] = useState<PurchaseReturnTableFilters>({
    startDate: null,
    endDate: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { showOverlayLoading, hideOverlayLoading } = useOverlayLoading();
  const [totalRowCount, setTotalRowCount] = useState(0);
  const { user } = useAuth();

  const fetchPurchaseOrderReturns = useCallback(async () => {
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

      const { result, recordsTotal } = await browsePr({ pageSize, pageIndex, sortColumn, sortOrder, filters });

      setPurchaseReturns(result);
      setTotalRowCount(recordsTotal);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, pageIndex, sorting, filters]);

  useEffect(() => {
    fetchPurchaseOrderReturns();
  }, [fetchPurchaseOrderReturns]);

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
      fetchPurchaseOrderReturns();
    } else {
      setPageIndex(0);
      setFilters(localFilters);
    }
  };

  const handleExportExcel = async () => {
    if (user?.role !== 'Admin') return;

    try {
      setIsExporting(true);
      showOverlayLoading('Sedang meng-export data...');

      const sortColumn = sorting.length > 0 ? sorting[0].id : null;
      const sortOrder = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : null;

      await exportPr({ sortColumn, sortOrder, filters });
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    } finally {
      hideOverlayLoading();
      setIsExporting(false);
    }
  };

  const handleFinish = async (id: string) => {
    try {
      const message = await finishPr(id);
      toast.success(message, { duration: 5000 });

      fetchPurchaseOrderReturns();
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const message = await cancelPr(id);
      toast.success(message, { duration: 5000 });

      fetchPurchaseOrderReturns();
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  };

  const actionHandlers: any = {
    finish: (id: string) => handleFinish(id),
    cancel: (id: string) => handleCancel(id),
  };

  return (
    <>
      <PageHeader {...pageHeader}>
        <div className='flex items-center gap-3 mt-4 sm:mt-0'>
          {user?.role === 'Admin' && (
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
          )}
          <Link href={routes.inventory.purchaseReturn.add} className='w-full sm:w-auto'>
            <Button className={cn(buttonColorClass.green, baseButtonClass, 'w-full sm:w-auto')}>
              <PiPlusBold className='me-1.5 h-[17px] w-[17px]' />
              Tambah
            </Button>
          </Link>
        </div>
      </PageHeader>

      <PurchaseReturnFilter
        localFilters={localFilters}
        setLocalFilters={setLocalFilters}
        handleSearch={() => handleSearch()}
      />

      <BasicTable<PurchaseReturnModel>
        data={purchaseReturns}
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
