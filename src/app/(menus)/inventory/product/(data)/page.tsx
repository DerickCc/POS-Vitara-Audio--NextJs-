'use client';

import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import Link from 'next/link';
import { PiPlusBold } from 'react-icons/pi';
import { Button } from 'rizzui';
import ProductFilter, { ProductTableFilters } from './filter';
import { useCallback, useEffect, useState } from 'react';
import { OnChangeFn, SortingState } from '@tanstack/react-table';
import { apiFetch, toQueryString } from '@/utils/api';
import toast from 'react-hot-toast';
import BasicTable from '@/components/tables/basic-table';
import { columns } from './colomns';
import { TableAction } from '@/models/global.model';
import { ProductModel } from '@/models/product.model';
import { browseProduct, deleteProduct } from '@/services/product-service';

const pageHeader = {
  title: 'Barang',
  breadcrumb: [
    {
      name: 'Inventori',
    },
    {
      href: routes.inventory.product.data,
      name: 'Barang',
    },
  ],
};

export default function ProductDataPage() {
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [localFilters, setLocalFilters] = useState<ProductTableFilters>({
    name: '',
    stock: 0,
    stockOperator: 'gte',
    uom: '',
  });
  const [filters, setFilters] = useState<ProductTableFilters>({
    name: '',
    stock: 0,
    stockOperator: 'gte',
    uom: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [totalRowCount, setTotalRowCount] = useState(0);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);

      const sortColumn = sorting.length > 0 ? sorting[0].id : null;
      const sortOrder = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : null;

      const response = await browseProduct({ pageSize, pageIndex, sortColumn, sortOrder, filters })

      setProducts(response.result);
      setTotalRowCount(response.recordsTotal);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, pageIndex, sorting, filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
      fetchProducts();
    } else {
      setPageIndex(0);
      setFilters(localFilters);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const message = await deleteProduct(id);

      toast.success(message, { duration: 5000 });
      fetchProducts();
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  };

  const actionHandlers: any = {
    delete: (id: string) => handleDelete(id),
  };

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <div className='flex items-center gap-3 mt-4 sm:mt-0'>
          <Link href={routes.inventory.product.add} className='w-full sm:w-auto'>
            <Button className='w-full sm:w-auto'>
              <PiPlusBold className='me-1.5 h-[17px] w-[17px]' />
              Tambah
            </Button>
          </Link>
        </div>
      </PageHeader>

      <ProductFilter
        localFilters={localFilters}
        setLocalFilters={setLocalFilters}
        handleSearch={() => handleSearch()}
      />

      <BasicTable<ProductModel>
        data={products}
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
