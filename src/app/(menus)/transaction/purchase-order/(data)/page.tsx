'use client';

import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import Link from 'next/link';
import { PiArrowLineUpBold, PiPlusBold } from 'react-icons/pi';
import { Button } from 'rizzui';
import PurchaseOrderFilter, { PurchaseOrderTableFilters } from './filters';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { OnChangeFn, SortingState } from '@tanstack/react-table';
import { PurchaseOrderModel } from '@/models/purchase-order.model';
import { columns } from './columns';
import BasicTable from '@/components/tables/basic-table';
import { browsePo, cancelPo, deletePo, exportPo, finishPo } from '@/services/purchase-order-service';
import Spinner from '@/components/spinner';
import { useOverlayLoading } from '@/hooks/use-overlay-loading';
import { handleTableAction } from '@/utils/handle-table-action';
import cn from '@/utils/class-names';
import { baseButtonClass, buttonColorClass } from '@/config/tailwind-classes';
import { useAuth } from '@/hooks/use-auth';

const pageHeader = {
  title: 'Pembelian',
  breadcrumb: [
    {
      name: 'Transaksi',
    },
    {
      href: routes.transaction.purchaseOrder.data,
      name: 'Pembelian',
    },
  ],
};

export default function PurchaseOrderDataPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderModel[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [localFilters, setLocalFilters] = useState<PurchaseOrderTableFilters>({
    startDate: null,
    endDate: null,
  });
  const [filters, setFilters] = useState<PurchaseOrderTableFilters>({
    startDate: null,
    endDate: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { showOverlayLoading, hideOverlayLoading } = useOverlayLoading();
  const [totalRowCount, setTotalRowCount] = useState(0);
  const { user } = useAuth();

  const fetchPurchaseOrders = useCallback(async () => {
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

      const { result, recordsTotal } = await browsePo({ pageSize, pageIndex, sortColumn, sortOrder, filters });

      setPurchaseOrders(result);
      setTotalRowCount(recordsTotal);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, pageIndex, sorting, filters]);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

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
    if (isLoading) return;

    if (pageIndex === 0 && localFilters === filters) {
      fetchPurchaseOrders();
    } else {
      setPageIndex(0);
      setFilters(localFilters);
    }
  };

  const handleExportExcel = async () => {
    if (user?.role !== "Admin") return;

    try {      
      setIsExporting(true);
      showOverlayLoading('Sedang meng-export data...');

      const sortColumn = sorting.length > 0 ? sorting[0].id : null;
      const sortOrder = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : null;

      await exportPo({ sortColumn, sortOrder, filters });
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    } finally {
      hideOverlayLoading();
      setIsExporting(false);
    }
  };

  const actionHandlers: any = {
    finish: (id: string) => handleTableAction(finishPo, fetchPurchaseOrders, id),
    delete: (id: string) => handleTableAction(deletePo, fetchPurchaseOrders, id),
    cancel: (id: string) => handleTableAction(cancelPo, fetchPurchaseOrders, id),
    fetchData: () => fetchPurchaseOrders(),
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
          <Link href={routes.transaction.purchaseOrder.add} className='w-full sm:w-auto'>
            <Button className={cn(buttonColorClass.green, baseButtonClass, 'w-full sm:w-auto')}>
              <PiPlusBold className='me-1.5 h-[17px] w-[17px]' />
              Tambah
            </Button>
          </Link>
        </div>
      </PageHeader>

      <PurchaseOrderFilter
        localFilters={localFilters}
        setLocalFilters={setLocalFilters}
        handleSearch={() => handleSearch()}
      />

      <BasicTable<PurchaseOrderModel>
        data={purchaseOrders}
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
