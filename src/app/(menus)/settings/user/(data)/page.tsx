'use client';

import PageHeader from '@/components/page-header';
import BasicTable from '@/components/tables/basic-table';
import { routes } from '@/config/routes';
import { OnChangeFn, SortingState } from '@tanstack/react-table';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiPlusBold } from 'react-icons/pi';
import { Button } from 'rizzui';
import UserFilter, { UserTableFilters } from './filters';
import { columns } from './columns';
import { UserModel } from '@/models/user.model';
import { TableAction } from '@/models/global.model';
import { changeUserStatus, browseUser } from '@/services/user-service';

const pageHeader = {
  title: 'User',
  breadcrumb: [
    {
      name: 'Pengaturan',
    },
    {
      href: routes.settings.user.data,
      name: 'User',
    },
  ],
};

export default function UserDataPage() {
  const [users, setUsers] = useState<UserModel[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [localFilters, setLocalFilters] = useState<UserTableFilters>({
    name: '',
    accountStatus: '',
    role: '',
  });
  const [filters, setFilters] = useState<UserTableFilters>({
    name: '',
    accountStatus: '',
    role: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [totalRowCount, setTotalRowCount] = useState(0);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);

      const sortColumn = sorting.length > 0 ? sorting[0].id : null;
      const sortOrder = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : null;

      const response = await browseUser({ pageSize, pageIndex, sortColumn, sortOrder, filters });

      setUsers(response.result);
      setTotalRowCount(response.recordsTotal);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, pageIndex, sorting, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
      fetchUsers();
    } else {
      setPageIndex(0);
      setFilters(localFilters);
    }
  };

  const handleChangeStatus = async (id: string) => {
    try {
      const message = await changeUserStatus(id);
      toast.success(message, { duration: 5000 });

      fetchUsers();
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  };

  const actionHandlers = {
    changeStatus: (id: string) => handleChangeStatus(id),
  };

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <div className='flex items-center gap-3 mt-4 sm:mt-0'>
          <Link href={routes.settings.user.add} className='w-full sm:w-auto'>
            <Button className='w-full sm:w-auto'>
              <PiPlusBold className='me-1.5 h-[17px] w-[17px]' />
              Tambah
            </Button>
          </Link>
        </div>
      </PageHeader>

      <UserFilter localFilters={localFilters} setLocalFilters={setLocalFilters} handleSearch={() => handleSearch()} />

      <BasicTable<UserModel>
        data={users}
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
