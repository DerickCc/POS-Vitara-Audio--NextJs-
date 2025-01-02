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
    code: '',
    supplierId: null,
    startDate: null,
    endDate: null,
    status: '',
  });
  const [filters, setFilters] = useState<PurchaseOrderTableFilters>({
    code: '',
    supplierId: null,
    startDate: null,
    endDate: null,
    status: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { showOverlayLoading, hideOverlayLoading } = useOverlayLoading();
  const [totalRowCount, setTotalRowCount] = useState(0);

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
    if (pageIndex === 0 && localFilters === filters) {
      fetchPurchaseOrders();
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

      await exportPo({ sortColumn, sortOrder, filters });
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    } finally {
      hideOverlayLoading();
      setIsExporting(false);
    }
  };

  const handleFinish = async (id: string) => {
    try {
      const message = await finishPo(id);
      toast.success(message, { duration: 5000 });

      fetchPurchaseOrders();
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const message = await deletePo(id);
      toast.success(message, { duration: 5000 });

      fetchPurchaseOrders();
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const message = await cancelPo(id);
      toast.success(message, { duration: 5000 });

      fetchPurchaseOrders();
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  };

  const actionHandlers: any = {
    finish: (id: string) => handleFinish(id),
    delete: (id: string) => handleDelete(id),
    cancel: (id: string) => handleCancel(id),
    fetchData: () => fetchPurchaseOrders(),
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
          <Link href={routes.transaction.purchaseOrder.add} className='w-full sm:w-auto'>
            <Button className='w-full sm:w-auto'>
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
