"use client";

import { columns } from "./columns";
import cn from "@/utils/class-names";
import { ROW_PER_PAGE_OPTIONS, tableClass } from "@/config/constants";
import {
  PaginationState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { ActionIcon, Input, Select, SelectOption, Text } from "rizzui";
import {
  PiCaretDoubleLeftBold,
  PiCaretDoubleRightBold,
  PiCaretDownFill,
  PiCaretLeftBold,
  PiCaretRightBold,
  PiCaretUpFill,
  PiMagnifyingGlassBold,
} from "react-icons/pi";

const data = [
  {
    id: 1,
    code: "CUS00000001",
    name: "Derick",
    licensePlate: "BK 999 LL",
    phoneNo: "082374378438",
    address: "Jalan Pasar 3 Komplek Sehati Indah No 92 DD",
  },
  {
    id: 2,
    code: "CUS00000001",
    name: "Derick",
    licensePlate: "BK 999 LL",
    phoneNo: "082374378438",
    address: "Jalan 12A",
  },
  {
    id: 3,
    code: "CUS00000001",
    name: "Derick",
    licensePlate: "BK 5628 AHS",
    phoneNo: "082374378438",
    address: "Jalan 12A",
  },
  {
    id: 1,
    code: "CUS00000001",
    name: "Derick",
    licensePlate: "BK 999 LL",
    phoneNo: "082374378438",
    address: "Jalan Pasar 3 Komplek Sehati Indah No 92 DD",
  },
  {
    id: 2,
    code: "CUS00000001",
    name: "Derick",
    licensePlate: "BK 999 LL",
    phoneNo: "082374378438",
    address: "Jalan 12A",
  },
  {
    id: 3,
    code: "CUS00000001",
    name: "Derick",
    licensePlate: "BK 5628 AHS",
    phoneNo: "082374378438",
    address: "Jalan 12A",
  },
  {
    id: 1,
    code: "CUS00000001",
    name: "Derick",
    licensePlate: "BK 999 LL",
    phoneNo: "082374378438",
    address: "Jalan Pasar 3 Komplek Sehati Indah No 92 DD",
  },
  {
    id: 2,
    code: "CUS00000001",
    name: "Derick",
    licensePlate: "BK 999 LL",
    phoneNo: "082374378438",
    address: "Jalan 12A",
  },
  {
    id: 3,
    code: "CUS00000001",
    name: "Derick",
    licensePlate: "BK 5628 AHS",
    phoneNo: "082374378438",
    address: "Jalan 12A",
  },
  {
    id: 1,
    code: "CUS00000001",
    name: "Derick",
    licensePlate: "BK 999 LL",
    phoneNo: "082374378438",
    address: "Jalan Pasar 3 Komplek Sehati Indah No 92 DD",
  },
  {
    id: 2,
    code: "CUS00000001",
    name: "Derick",
    licensePlate: "BK 999 LL",
    phoneNo: "082374378438",
    address: "Jalan 12A",
  },
  {
    id: 3,
    code: "CUS00000001",
    name: "Derick",
    licensePlate: "BK 5628 AHS",
    phoneNo: "082374378438",
    address: "Jalan 12A",
  },
  {
    id: 1,
    code: "CUS00000001",
    name: "Derick",
    licensePlate: "BK 999 LL",
    phoneNo: "082374378438",
    address: "Jalan Pasar 3 Komplek Sehati Indah No 92 DD",
  },
  {
    id: 2,
    code: "CUS00000001",
    name: "Derick",
    licensePlate: "BK 999 LL",
    phoneNo: "082374378438",
    address: "Jalan 12A",
  },
  {
    id: 3,
    code: "CUS00000001",
    name: "Derick",
    licensePlate: "BK 5628 AHS",
    phoneNo: "082374378438",
    address: "Jalan 12A",
  },
  {
    id: 1,
    code: "CUS00000001",
    name: "Derick",
    licensePlate: "BK 999 LL",
    phoneNo: "082374378438",
    address: "Jalan Pasar 3 Komplek Sehati Indah No 92 DD",
  },
  {
    id: 2,
    code: "CUS00000001",
    name: "Derick",
    licensePlate: "BK 999 LL",
    phoneNo: "082374378438",
    address: "Jalan 12A",
  },
  {
    id: 3,
    code: "CUS00000001",
    name: "Derick",
    licensePlate: "BK 5628 AHS",
    phoneNo: "082374378438",
    address: "Jalan 12A",
  },
  {
    id: 1,
    code: "CUS00000001",
    name: "Derick",
    licensePlate: "BK 999 LL",
    phoneNo: "082374378438",
    address: "Jalan Pasar 3 Komplek Sehati Indah No 92 DD",
  },
  {
    id: 2,
    code: "CUS00000001",
    name: "Derick",
    licensePlate: "BK 999 LL",
    phoneNo: "082374378438",
    address: "Jalan 12A",
  },
  {
    id: 3,
    code: "CUS00000001",
    name: "Deri3333ck",
    licensePlate: "BK 562832 AHS",
    phoneNo: "0823743781212438",
    address: "Jalan 1dsadsa2A",
  },
  {
    id: 1,
    code: "CUS00000001",
    name: "Derieewewck",
    licensePlate: "BK 999 LL",
    phoneNo: "082374378438",
    address: "Jalan Pasar 3 Komplek Sehati Indah No 92 DD",
  },
  {
    id: 2,
    code: "CUS00000001",
    name: "Derifdfffck",
    licensePlate: "BK 999 LL",
    phoneNo: "082374378438",
    address: "Jalan 12A",
  },
  {
    id: 3,
    code: "CUS00000001",
    name: "sdasad",
    licensePlate: "BK 5asd628 AHS",
    phoneNo: "082374378das438",
    address: "Jalan 12A",
  },
];

export default function CustomersTable() {
  const [customers, setCustomers] = useState(data);

  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [totalRowCount, setTotalRowCount] = useState(customers.length);

  const table = useReactTable({
    data: customers,
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

  function fetchData() {
    console.log(pageIndex);
    console.log(pageSize);
    console.log(sorting);
  }

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize, sorting]);

  return (
    <>
      <div className="flex items-center justify-between px-7">
        <div className="flex items-center gap-4">
          <Text className="font-medium">Baris Per Halaman</Text>
          <Select
            options={ROW_PER_PAGE_OPTIONS}
            value={pageSize}
            onChange={(s: SelectOption) => setPageSize(Number(s.value))}
            className="w-[70px]"
            dropdownClassName="font-medium [&_li]:text-sm"
          />
        </div>
        <Input
          type="search"
          placeholder="Cari Pelanggan"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          onClear={() => setGlobalFilter("")}
          clearable={true}
          prefix={<PiMagnifyingGlassBold className="size-4" />}
        />
      </div>

      <table className={cn(tableClass, "my-7")}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();

                return (
                  <th
                    key={header.id}
                    onClick={
                      canSort
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                    className={canSort ? "cursor-pointer" : ""}
                  >
                    <div className="flex justify-between">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}

                      {/* render if canSort */}
                      {canSort &&
                        ({
                          asc: <PiCaretUpFill size={14} />,
                          desc: <PiCaretDownFill size={14} />,
                        }[header.column.getIsSorted() as string] ?? null)
                      }
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-between px-7">
        <Text className="font-medium">
          Halaman {pageIndex + 1} dari {table.getPageCount()}
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
  );
}
