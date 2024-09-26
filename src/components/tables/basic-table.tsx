'use client';

import cn from '@/utils/class-names';
import { pageSizeOptions, tableClass } from '@/config/constants';
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
import { BasicTableProps } from '@/models/table.model';
import { CustomerTableType } from '@/app/(menus)/master/customer/(data)/columns';

export default function CustomersTable({
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
  onDelete,
}: BasicTableProps<CustomerTableType>) {
  const table = useReactTable({
    data: data,
    columns: columns(onDelete),
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
    <Card className="px-0">
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="flex items-center justify-between px-7">
            <div className="flex items-center gap-4">
              <Text className="font-medium hidden sm:block">Baris Per Halaman</Text>
              <Select
                options={pageSizeOptions}
                value={pageSize}
                onChange={(s: SelectOption) => setPageSize(Number(s.value))}
                className="w-[70px]"
                dropdownClassName="font-medium [&_li]:text-sm"
              />
            </div>
          </div>

          <div className="custom-scrollbar w-full max-w-full overflow-x-auto">
            <table
              className={cn(tableClass, 'my-7')}
              style={{
                width: table.getTotalSize(),
              }}
            >
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header, idx) => {
                      const canSort = header.column.getCanSort();

                      return (
                        <th
                          key={header.id}
                          onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                          className={canSort ? 'cursor-pointer' : ''}
                          style={{ width: header.getSize() }}
                        >
                          <div className={idx === 0 ? 'flex justify-center' : 'flex justify-between'}>
                            {flexRender(header.column.columnDef.header, header.getContext())}

                            {/* render if canSort */}
                            {canSort &&
                              ({
                                asc: <PiCaretUpFill size={14} />,
                                desc: <PiCaretDownFill size={14} />,
                              }[header.column.getIsSorted() as string] ??
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
                    <td colSpan={table.getAllColumns().length} className="!pl-9">
                      Data tidak ditemukan...
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-7">
            <Text className="font-medium">
              Halaman {pageIndex + 1} dari {table.getPageCount() || 1}
            </Text>
            <div className="grid grid-cols-4 gap-2">
              <ActionIcon
                rounded="lg"
                variant="outline"
                aria-label="Ke halaman pertama"
                onClick={() => setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="shadow-sm disabled:text-gray-400 disabled:shadow-none"
              >
                <PiCaretDoubleLeftBold className="size-4" />
              </ActionIcon>
              <ActionIcon
                rounded="lg"
                variant="outline"
                aria-label="Ke halaman sebelumnya"
                onClick={() => setPageIndex(pageIndex - 1)}
                disabled={!table.getCanPreviousPage()}
                className="shadow-sm disabled:text-gray-400 disabled:shadow-none"
              >
                <PiCaretLeftBold className="size-4" />
              </ActionIcon>
              <ActionIcon
                rounded="lg"
                variant="outline"
                aria-label="Ke halaman selanjutnya"
                onClick={() => setPageIndex(pageIndex + 1)}
                disabled={!table.getCanNextPage()}
                className="shadow-sm disabled:text-gray-400 disabled:shadow-none"
              >
                <PiCaretRightBold className="size-4" />
              </ActionIcon>
              <ActionIcon
                rounded="lg"
                variant="outline"
                aria-label="Ke halaman terakhir"
                onClick={() => setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="shadow-sm disabled:text-gray-400 disabled:shadow-none"
              >
                <PiCaretDoubleRightBold className="size-4" />
              </ActionIcon>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
