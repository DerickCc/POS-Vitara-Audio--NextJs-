'use client';

import PaginationTable from '@/components/tables/pagination-table';
import { LowStockProductModel } from '@/models/dashboard.model';
import { browseLowStockProduct } from '@/services/dashboard-service';
import { ColumnDef, OnChangeFn, SortingState, createColumnHelper } from '@tanstack/react-table';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const columnHelper = createColumnHelper<LowStockProductModel>();
const columns = (): ColumnDef<LowStockProductModel, any>[] => [
  columnHelper.accessor('productName', {
    id: 'productName',
    size: 250,
    header: 'Barang',
    cell: (info) => info.getValue(),
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
  const [lowStockProduct, setLowStockProduct] = useState<LowStockProductModel[]>([]);
  const [pageSize, setPageSize] = useState(5);
  const [pageIndex, setPageIndex] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalRowCount, setTotalRowCount] = useState(0);

  const fetchlowStockProduct = useCallback(async () => {
    try {
      setIsLoading(true);

      const sortColumn = sorting.length > 0 ? sorting[0].id : null;
      const sortOrder = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : null;

      const { result, recordsTotal } = await browseLowStockProduct({ pageSize, pageIndex, sortColumn, sortOrder });

      setLowStockProduct(result);
      setTotalRowCount(recordsTotal);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, pageIndex, sorting]);

  useEffect(() => {
    fetchlowStockProduct();
  }, [fetchlowStockProduct]);

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
    <PaginationTable<LowStockProductModel>
      data={lowStockProduct}
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
