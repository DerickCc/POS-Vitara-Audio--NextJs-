import BasicTable from '@/components/tables/basic-table';
import { ProductHistoryModel } from '@/models/product.model';
import { browseProductHistories } from '@/services/product-service';
import { formatToDecimal, formatToReadableNumber, isoStringToReadableDate, mapTrxToRoute } from '@/utils/helper-function';
import { ColumnDef, createColumnHelper, OnChangeFn, SortingState } from '@tanstack/react-table';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiFileTextDuotone } from 'react-icons/pi';

const columnHelper = createColumnHelper<ProductHistoryModel>();
const columns = (): ColumnDef<ProductHistoryModel, any>[] => [
  columnHelper.accessor('date', {
    id: 'createdAt',
    size: 120,
    header: () => 'Tanggal',
    cell: (info) => isoStringToReadableDate(info.getValue()),
    enableSorting: true,
  }),
  columnHelper.accessor('code', {
    id: 'code',
    size: 100,
    header: 'Kode',
    cell: ({ row }) => (
      <Link href={mapTrxToRoute(row.original.type, row.original.id)}>
        <span className='text-primary'>{row.original.code}</span>
      </Link>
    ),
    enableSorting: false,
  }),
  columnHelper.accessor('type', {
    id: 'type',
    size: 140,
    header: () => 'Tipe',
    cell: (info) =>
      info.getValue().includes('Penggantian Barang') ? 'Retur Pembelian (Penggantian Barang)' : info.getValue(),
    enableSorting: false,
  }),
  columnHelper.accessor('supOrCus', {
    id: 'supOrCus',
    size: 160,
    header: () => 'Nama',
    cell: (info) => info.getValue(),
    enableSorting: false,
  }),
  columnHelper.accessor('price', {
    id: 'price',
    size: 130,
    header: () => 'Harga',
    cell: (info) => (info.getValue() === 0 ? '-' : `Rp ${formatToReadableNumber(info.getValue())}`),
    enableSorting: false,
  }),
  columnHelper.accessor('quantity', {
    id: 'quantity',
    size: 60,
    header: () => 'Qty',
    cell: ({ row }) => {
      const formattedQty = formatToDecimal(row.original.quantity);

      if (row.original.type === 'Pembelian') {
        return <span className='text-green font-bold'>+ {formattedQty}</span>;
      } else {
        if (row.original.type.includes('Penggantian Barang Selesai')) {
          return (
            <>
              <span className='text-red font-bold mr-2'>- {formattedQty}</span>
              <span className='text-green font-bold'>+ {formattedQty}</span>
            </>
          );
        }
        return <span className='text-red font-bold'>- {formattedQty}</span>;
      }
    },
    enableSorting: false,
  }),
  columnHelper.accessor('totalPrice', {
    id: 'totalPrice',
    size: 130,
    header: () => 'Total Harga',
    cell: (info) => (info.getValue() === 0 ? '-' : `Rp ${formatToReadableNumber(info.getValue())}`),
    enableSorting: false,
  }),
];

export default function ProductHistoryTable({ productId }: { productId: string }) {
  const [productHistories, setProductHistories] = useState<ProductHistoryModel[]>([]);
  const [pageSize, setPageSize] = useState(5);
  const [pageIndex, setPageIndex] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalRowCount, setTotalRowCount] = useState(0);

  const fetchProductHistories = useCallback(async () => {
    try {
      setIsLoading(true);

      const sortColumn = sorting.length > 0 ? sorting[0].id : null;
      const sortOrder = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : null;

      const { result, recordsTotal } = await browseProductHistories({
        filters: { productId },
        pageSize,
        pageIndex,
        sortColumn,
        sortOrder,
      });

      setProductHistories(result);
      setTotalRowCount(recordsTotal);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, pageIndex, sorting]);

  useEffect(() => {
    fetchProductHistories();
  }, [fetchProductHistories]);

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
    <BasicTable<ProductHistoryModel>
      header={tableHeader()}
      data={productHistories}
      columns={columns()}
      pageSize={pageSize}
      setPageSize={handlePageSizeChange}
      pageIndex={pageIndex}
      setPageIndex={handlePageIndexChange}
      sorting={sorting}
      setSorting={handleSortingChange}
      isLoading={isLoading}
      totalRowCount={totalRowCount}
    />
  );
}

function tableHeader() {
  return (
    <div className='m-4 flex items-center'>
      <PiFileTextDuotone className='size-6 me-2 text-primary' />
      <h5 className='font-medium'>Riwayat Barang</h5>
    </div>
  );
}
