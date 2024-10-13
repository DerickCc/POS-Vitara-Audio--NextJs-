'use client';

import { routes } from '@/config/routes';
import { TableAction } from '@/models/global.model';
import { SalesOrderModel } from '@/models/sales-order';
import { browseSo, cancelSo } from '@/services/sales-order-service';
import { OnChangeFn, SortingState } from '@tanstack/react-table';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import SalesOrderFilter, { SalesOrderFilters } from './filters';
import BasicTable from '@/components/tables/basic-table';
import PageHeader from '@/components/page-header';
import { Button } from 'rizzui';
import { PiPlusBold } from 'react-icons/pi';
import Link from 'next/link';
import { columns } from './columns';

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
    code: '',
    customerId: null,
    startDate: null,
    endDate: null,
    status: '',
  });
  const [filters, setFilters] = useState<SalesOrderFilters>({
    code: '',
    customerId: null,
    startDate: null,
    endDate: null,
    status: '',
  });
  const [isLoading, setIsLoading] = useState(false);
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

      const response = await browseSo({ pageSize, pageIndex, sortColumn, sortOrder, filters });

      setSalesOrders(response.result);
      setTotalRowCount(response.recordsTotal);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, pageIndex, sorting, filters]);

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

  const handleCancel = async (id: string) => {
    try {
      const message = await cancelSo(id);
      toast.success(message, { duration: 5000 });

      fetchSalesOrders();
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  };

  const actions: TableAction[] = [
    {
      label: 'Batal',
      title: 'Batalkan Transaksi Pembelian',
      description: 'Stok barang akan dikurangi dengan stok dari detail transaksi pembelian ini. Apakah Anda yakin?',
      color: 'red',
      handler: (id: string) => handleCancel(id),
    },
  ];

  useEffect(() => {
    fetchSalesOrders();
  }, [fetchSalesOrders]);

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <div className='flex items-center gap-3 mt-4 sm:mt-0'>
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
        columns={columns}
        pageSize={pageSize}
        setPageSize={handlePageSizeChange}
        pageIndex={pageIndex}
        setPageIndex={handlePageIndexChange}
        sorting={sorting}
        setSorting={handleSortingChange}
        isLoading={isLoading}
        totalRowCount={totalRowCount}
        actions={actions}
      />
    </>
  );
}
