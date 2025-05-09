'use client';

import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { OnChangeFn, SortingState } from '@tanstack/react-table';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { PiPlusBold } from 'react-icons/pi';
import { Button } from 'rizzui';
import SupplierFilter, { SupplierTableFilters } from './filters';
import toast from 'react-hot-toast';
import BasicTable from '@/components/tables/basic-table';
import { columns } from './columns';
import { SupplierModel } from '@/models/supplier.model';
import { browseSupplier, deleteSupplier } from '@/services/supplier-service';
import cn from '@/utils/class-names';
import { baseButtonClass, buttonColorClass } from '@/config/tailwind-classes';

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
  const [suppliers, setSuppliers] = useState<SupplierModel[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [localFilters, setLocalFilters] = useState<SupplierTableFilters>({
    name: '',
    pic: '',
    phoneNo: '',
    receivablesOperator: 'gte',
    receivables: 0,
  });
  const [filters, setFilters] = useState<SupplierTableFilters>({
    name: '',
    pic: '',
    phoneNo: '',
    receivablesOperator: 'gte',
    receivables: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [totalRowCount, setTotalRowCount] = useState(0);

  const fetchSuppliers = useCallback(async () => {
    try {
      setIsLoading(true);

      const sortColumn = sorting.length > 0 ? sorting[0].id : null;
      const sortOrder = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : null;

      const { result, recordsTotal } = await browseSupplier({ pageSize, pageIndex, sortColumn, sortOrder, filters });

      setSuppliers(result);
      setTotalRowCount(recordsTotal);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, pageIndex, sorting, filters]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

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
      fetchSuppliers();
    } else {
      setPageIndex(0);
      setFilters(localFilters);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await deleteSupplier(id);
      toast.success(response, { duration: 5000 });

      fetchSuppliers();
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  };

  const actionHandlers = {
    delete: (id: string) => handleDelete(id),
  };

  return (
    <>
      <PageHeader {...pageHeader}>
        <div className='flex items-center gap-3 mt-4 sm:mt-0'>
          <Link href={routes.master.supplier.add} className='w-full sm:w-auto'>
            <Button className={cn(buttonColorClass.green, baseButtonClass, 'w-full sm:w-auto')}>
              <PiPlusBold className='me-1.5 h-[17px] w-[17px]' />
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

      <BasicTable<SupplierModel>
        data={suppliers}
        columns={columns(actionHandlers)}
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
