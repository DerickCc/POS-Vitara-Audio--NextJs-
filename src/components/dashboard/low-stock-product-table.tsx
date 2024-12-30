'use client';

import BasicTable from '@/components/tables/basic-table';
import { routes } from '@/config/routes';
import { LowStockProductModel } from '@/models/dashboard.model';
import { browseLowStockProduct } from '@/services/dashboard-service';
import { ColumnDef, OnChangeFn, SortingState, createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiAlertTriangle } from 'react-icons/fi';

const columnHelper = createColumnHelper<LowStockProductModel>();
const columns = (): ColumnDef<LowStockProductModel, any>[] => [
  columnHelper.accessor('name', {
    id: 'name',
    size: 250,
    header: 'Barang',
    cell: ({ row }) => (
      <Link href={routes.inventory.product.detail(row.original.id)}>
        <span className='text-primary'>{row.original.name}</span>
      </Link>
    ),
    enableSorting: true,
  }),
  columnHelper.accessor('stock', {
    id: 'stock',
    size: 150,
    header: () => 'Stok',
    cell: ({ row }) => `${row.original.stock} ${row.original.uom}`,
    enableSorting: true,
  }),
];

export default function LowStockProductTable() {
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProductModel[]>([]);
  const [pageSize, setPageSize] = useState(5);
  const [pageIndex, setPageIndex] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalRowCount, setTotalRowCount] = useState(0);

  const fetchlowStockProducts = useCallback(async () => {
    try {
      setIsLoading(true);

      const sortColumn = sorting.length > 0 ? sorting[0].id : null;
      const sortOrder = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : null;

      const { result, recordsTotal } = await browseLowStockProduct({ pageSize, pageIndex, sortColumn, sortOrder });

      setLowStockProducts(result);
      setTotalRowCount(recordsTotal);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, pageIndex, sorting]);

  useEffect(() => {
    fetchlowStockProducts();
  }, [fetchlowStockProducts]);

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

  return (
    <BasicTable<LowStockProductModel>
      header={tableHeader()}
      data={lowStockProducts}
      columns={columns()}
      pageSize={pageSize}
      setPageSize={handlePageSizeChange}
      pageIndex={pageIndex}
      setPageIndex={handlePageIndexChange}
      sorting={sorting}
      setSorting={handleSortingChange}
      isLoading={isLoading}
      totalRowCount={totalRowCount}
      showPageInfo={false}
    />
  );
}

function tableHeader() {
  return (
    <div className='m-4 flex items-center'>
      <FiAlertTriangle className='size-6 me-2 text-yellow-500' />
      <h5 className='font-medium'>Barang yang Perlu Direstok</h5>
    </div>
  )
}

