'use client';

import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import Link from 'next/link';
import { PiPlusBold } from 'react-icons/pi';
import { Button } from 'rizzui';
import CustomerFilter, { CustomerTableFilters } from './filter';
import { useCallback, useEffect, useState } from 'react';
import { OnChangeFn, SortingState } from '@tanstack/react-table';
import toast from 'react-hot-toast';
import { columns } from './columns';
import BasicTable from '@/components/tables/basic-table';
import { CustomerModel } from '@/models/customer.model';
import { browseCustomer, deleteCustomer } from '@/services/customer-service';
import cn from '@/utils/class-names';
import { baseButtonClass, buttonColorClass } from '@/config/tailwind-classes';

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
  const [customers, setCustomers] = useState<CustomerModel[]>([]);
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

  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoading(true);

      const sortColumn = sorting.length > 0 ? sorting[0].id : null;
      const sortOrder = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : null;

      const { result, recordsTotal } = await browseCustomer({ pageSize, pageIndex, sortColumn, sortOrder, filters });

      setCustomers(result);
      setTotalRowCount(recordsTotal);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, pageIndex, sorting, filters]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

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
      fetchCustomers();
    } else {
      setPageIndex(0);
      setFilters(localFilters);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const message = await deleteCustomer(id);

      toast.success(message, { duration: 5000 });
      fetchCustomers();
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
          <Link href={routes.master.customer.add} className='w-full sm:w-auto'>
            <Button className={cn(buttonColorClass.green, baseButtonClass, 'w-full sm:w-auto')}>
              <PiPlusBold className='me-1.5 h-[17px] w-[17px]' />
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

      <BasicTable<CustomerModel>
        data={customers}
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
