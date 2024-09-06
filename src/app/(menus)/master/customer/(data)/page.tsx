'use client';

import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import Link from 'next/link';
import { PiArrowLineUpBold, PiPlusBold } from 'react-icons/pi';
import { Button } from 'rizzui';
import CustomerFilter, { CustomerTableFilters } from './filter';
import { useCallback, useEffect, useState } from 'react';
import { OnChangeFn, SortingState } from '@tanstack/react-table';
import toast from 'react-hot-toast';
import { apiFetch, toQueryString } from '@/utils/api';
import { columns } from './customer-table/columns';
import BasicTable from '@/components/tables/basic-table';

const pageHeader = {
  title: 'Pelanggan',
  breadcrumb: [
    {
      name: 'Master',
    },
    {
      href: routes.master.customer.data,
      name: 'Pelanggan',
    },
  ],
};

export default function CustomerDataPage() {
  const [customers, setCustomers] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [localFilters, setLocalFilters] = useState<CustomerTableFilters>({
    name: '',
    licensePlate: '',
    phoneNo: '',
  });
  const [filters, setFilters] = useState<CustomerTableFilters>({
    name: '',
    licensePlate: '',
    phoneNo: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [totalRowCount, setTotalRowCount] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      const sortColumn = sorting.length > 0 ? sorting[0].id : null;
      const sortOrder = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : null;

      const res = await apiFetch(
        `/api/customer${toQueryString({
          pageSize,
          pageIndex,
          sortColumn,
          sortOrder,
          ...filters,
        })}`,
        { method: 'GET' }
      );

      setCustomers(res.result);
      setTotalRowCount(res.recordsTotal);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, pageIndex, sorting, filters]);

  const handlePageSizeChange = (newPageSize: number) => {
    setPageIndex(0);
    setPageSize(newPageSize);
  }

  const handlePageIndexChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  }

  const handleSortingChange: OnChangeFn<SortingState> = (newSorting) => {
    setPageIndex(0);
    setSorting(newSorting);
  }

  const handleSearch = () => {
    setPageIndex(0);
    setFilters(localFilters);
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await apiFetch(`/api/customer/${id}`, { method: 'DELETE' });

      toast.success('Data Pelanggan Berhasil Dihapus', { duration: 5000 });
      fetchData();
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  }

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <Link href={routes.master.customer.add} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
              Tambah
            </Button>
          </Link>
        </div>
      </PageHeader>

      <CustomerFilter
        localFilters={localFilters}
        setLocalFilters={setLocalFilters}
        handleSearch={() => handleSearch()}
      />

      <BasicTable
        data={customers}
        columns={columns}
        pageSize={pageSize}
        setPageSize={handlePageSizeChange}
        pageIndex={pageIndex}
        setPageIndex={handlePageIndexChange}
        sorting={sorting}
        setSorting={handleSortingChange}
        isLoading={isLoading}
        totalRowCount={totalRowCount}
        onDelete={handleDelete}
      />
    </>
  );
}
