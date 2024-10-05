'use client';

import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import Link from 'next/link';
import { PiPlusBold } from 'react-icons/pi';
import { Button } from 'rizzui';
import PurchaseOrderFilter, { PurchaseOrderFilters } from './filters';
import { useCallback, useEffect, useState } from 'react';
import { TableAction } from '@/models/global.model';
import { apiFetch, toQueryString } from '@/utils/api';
import toast from 'react-hot-toast';
import { OnChangeFn, SortingState } from '@tanstack/react-table';
import { PurchaseOrderModel } from '@/models/purchase-order.model';
import BasicTable from '@/components/tables/basic-table';
import { columns } from './columns';

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
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [localFilters, setLocalFilters] = useState<PurchaseOrderFilters>({
    poCode: '',
    supplierId: null,
    startDate: null,
    endDate: null,
    status: '',
  });
  const [filters, setFilters] = useState<PurchaseOrderFilters>({
    poCode: '',
    supplierId: null,
    startDate: null,
    endDate: null,
    status: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [totalRowCount, setTotalRowCount] = useState(0);

  const [supplierList, setSupplierList] = useState([]);

  const browsePo = useCallback(async () => {
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

      const response = await apiFetch(
        `/api/purchase-orders${toQueryString({
          pageSize,
          pageIndex,
          sortColumn,
          sortOrder,
          ...filters,
        })}`,
        { method: 'GET' }
      );

      setPurchaseOrders(response.result);
      setTotalRowCount(response.recordsTotal);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, pageIndex, sorting, filters]);

  const searchSupplier = async (name: string = '') => {
    try {
      const response = await apiFetch(`/api/suppliers/search${toQueryString({ name })}`, { method: 'GET' });
      setSupplierList(response.result);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  };

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
      browsePo();
    } else {
      setPageIndex(0);
      setFilters(localFilters);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await apiFetch(`/api/suppliers/${id}`, { method: 'DELETE' });

      toast.success(response.message, { duration: 5000 });
      browsePo();
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  };

  const actions: TableAction[] = [
    {
      label: 'delete',
      title: 'Hapus Transaksi Pembelian',
      description: 'Apakah Anda yakin ingin menghapus transaksi pembelian ini?',
      color: 'red',
      handler: (id: string) => handleDelete(id),
    },
  ];

  useEffect(() => {
    browsePo();
  }, [browsePo]);

  useEffect(() => {
    searchSupplier();
  }, [])

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <div className='flex items-center gap-3 mt-4 sm:mt-0'>
          <Link href={routes.transaction.purchaseOrder.add} className='w-full sm:w-auto'>
            <Button className='w-full sm:w-auto'>
              <PiPlusBold className='me-1.5 h-[17px] w-[17px]' />
              Tambah
            </Button>
          </Link>
        </div>
      </PageHeader>

      <PurchaseOrderFilter
        supplierList={supplierList}
        localFilters={localFilters}
        setLocalFilters={setLocalFilters}
        handleSearch={() => handleSearch()}
      />

      <BasicTable<PurchaseOrderModel>
        data={purchaseOrders}
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
