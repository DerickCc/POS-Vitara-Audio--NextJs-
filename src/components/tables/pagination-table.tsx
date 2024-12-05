import cn from '@/utils/class-names';
import { pageSizeOptions } from '@/config/global-variables';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { ActionIcon, Select, SelectOption, Text } from 'rizzui';
import {
  PiCaretDoubleLeftBold,
  PiCaretDoubleRightBold,
  PiCaretDownFill,
  PiCaretLeftBold,
  PiCaretRightBold,
  PiCaretUpFill,
} from 'react-icons/pi';
import Spinner from '@/components/spinner';
import Card from '@/components/card';
import { PaginationTableProps } from '@/models/global.model';
import { tableClass } from '@/config/tailwind-classes';

export default function PaginationTable<T>({
  data,
  columns,
  pageSize,
  setPageSize,
  pageIndex,
  setPageIndex,
  sorting,
  setSorting,
  isLoading,
  totalRowCount,
  showPageInfo = true,
}: PaginationTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(totalRowCount / pageSize),
    state: {
      pagination: { pageIndex, pageSize },
      sorting,
    },
    onSortingChange: setSorting,
    manualSorting: true,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className='px-0 pt-0'>
      {isLoading ? (
        <Spinner className='pt-7' />
      ) : (
        <>
          <div className='custom-scrollbar w-full max-w-full overflow-x-auto'>
            <table
              className={tableClass}
              style={{
                width: table.getTotalSize(),
              }}
            >
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header, idx) => {
                      const column = header.column;
                      const canSort = column.getCanSort();

                      return (
                        <th
                          key={header.id}
                          onClick={canSort ? column.getToggleSortingHandler() : undefined}
                          className={canSort ? 'cursor-pointer' : ''}
                          style={{ width: header.getSize() }}
                        >
                          <div className={column.id === 'actions' ? 'flex justify-center' : 'flex justify-between'}>
                            {flexRender(column.columnDef.header, header.getContext())}

                            {/* render if canSort */}
                            {canSort &&
                              ({
                                asc: <PiCaretUpFill size={14} />,
                                desc: <PiCaretDownFill size={14} />,
                              }[column.getIsSorted() as string] ??
                                null)}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody>
                {totalRowCount === 0 ? (
                  <tr>
                    <td colSpan={table.getAllColumns().length} className='!pl-9'>
                      Data tidak ditemukan...
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell, idx) => (
                        <td
                          key={cell.id}
                          className={cn(cell.column.id === 'actions' ? 'text-center' : '', 'table-cell')}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className='flex items-center justify-between px-7 mt-7'>
              <Text className='font-medium'>
                {showPageInfo && `Halaman ${pageIndex + 1} dari ${table.getPageCount() || 1}`}
              </Text>
            <div className='flex items-center gap-4'>
              {showPageInfo && <Text className='font-medium hidden sm:block'>Baris Per Halaman</Text>}
              <Select
                options={pageSizeOptions}
                value={pageSize}
                onChange={(s: SelectOption) => setPageSize(Number(s.value))}
                className='w-[67px]'
                dropdownClassName='font-medium [&_li]:text-sm'
              />
              <div className='grid grid-cols-4 gap-2'>
                <ActionIcon
                  rounded='lg'
                  variant='outline'
                  aria-label='Ke halaman pertama'
                  onClick={() => setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className='shadow-sm disabled:text-gray-400 disabled:shadow-none'
                >
                  <PiCaretDoubleLeftBold className='size-4' />
                </ActionIcon>
                <ActionIcon
                  rounded='lg'
                  variant='outline'
                  aria-label='Ke halaman sebelumnya'
                  onClick={() => setPageIndex(pageIndex - 1)}
                  disabled={!table.getCanPreviousPage()}
                  className='shadow-sm disabled:text-gray-400 disabled:shadow-none'
                >
                  <PiCaretLeftBold className='size-4' />
                </ActionIcon>
                <ActionIcon
                  rounded='lg'
                  variant='outline'
                  aria-label='Ke halaman selanjutnya'
                  onClick={() => setPageIndex(pageIndex + 1)}
                  disabled={!table.getCanNextPage()}
                  className='shadow-sm disabled:text-gray-400 disabled:shadow-none'
                >
                  <PiCaretRightBold className='size-4' />
                </ActionIcon>
                <ActionIcon
                  rounded='lg'
                  variant='outline'
                  aria-label='Ke halaman terakhir'
                  onClick={() => setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className='shadow-sm disabled:text-gray-400 disabled:shadow-none'
                >
                  <PiCaretDoubleRightBold className='size-4' />
                </ActionIcon>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
