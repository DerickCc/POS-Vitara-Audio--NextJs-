'use client';

import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { OnChangeFn, SortingState } from '@tanstack/react-table';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { PiPlusBold } from 'react-icons/pi';
import { Button } from 'rizzui';
import SupplierFilter, { SupplierTableFilters } from './filters';
import { apiFetch, toQueryString } from '@/utils/api';
import toast from 'react-hot-toast';
import BasicTable from '@/components/tables/basic-table';
import { columns } from './supplier-table/columns';

const pageHeader = {
  title: 'Supplier',
  breadcrumb: [
    {
      name: 'Master',
    },
    {
      href: routes.master.supplier.data,
      name: 'Supplier',
    },
  ],
};

export default function SupplierDataPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [localFilters, setLocalFilters] = useState<SupplierTableFilters>({
    name: '',
    pic: '',
    phoneNo: '',
    receivablesOperator: '>=',
    receivables: 0,
  });
  const [filters, setFilters] = useState<SupplierTableFilters>({
    name: '',
    pic: '',
    phoneNo: '',
    receivablesOperator: '>=',
    receivables: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [totalRowCount, setTotalRowCount] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      const sortColumn = sorting.length > 0 ? sorting[0].id : null;
      const sortOrder = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : null;

      const response = await apiFetch(
        `/api/supplier${toQueryString({
          pageSize,
          pageIndex,
          sortColumn,
          sortOrder,
         ...filters,
        })}`,
        { method: 'GET' }
      );

      setSuppliers(response.result);
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
  }

  const handlePageIndexChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  }

  const handleSortingChange: OnChangeFn<SortingState> = (newSorting) => {
    setPageIndex(0);
    setSorting(newSorting);
  }

  const handleSearch = () => {
    if (pageIndex === 0 && localFilters === filters) {
      fetchData();
    } else {
      setPageIndex(0);
      setFilters(localFilters);
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await apiFetch(`/api/supplier/${id}`, { method: 'DELETE' });

      toast.success('Data Supplier Berhasil Dihapus.', { duration: 5000 });
      fetchData();
    } catch (e) {
      toast.error(e + "", { duration: 5000});
    }
  }

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <Link href={routes.master.supplier.add} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
              Tambah
            </Button>
          </Link>
        </div>
      </PageHeader>

      <SupplierFilter
        localFilters={localFilters}
        setLocalFilters={setLocalFilters}
        handleSearch={() => handleSearch()}
      />

      <BasicTable
        data={suppliers}
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
