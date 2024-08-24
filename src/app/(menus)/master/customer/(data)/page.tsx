"use client";

import PageHeader from "@/components/ui/page-header";
import { routes } from "@/config/routes";
import Link from "next/link";
import { PiArrowLineUpBold, PiPlusBold } from "react-icons/pi";
import { Button } from "rizzui";
import CustomersTable from "./customer-table/table";
import CustomerFilter, { CustomerTableFilters } from "./filter";
import { useEffect, useState } from "react";
import { SortingState } from "@tanstack/react-table";
import toast from "react-hot-toast";
import { apiFetch, toQueryString } from "@/utils/api";

const pageHeader = {
  title: "Pelanggan",
  breadcrumb: [
    {
      name: "Master",
    },
    {
      href: routes.master.customer.data,
      name: "Pelanggan",
    },
  ],
};

export default function CustomerPage() {
  const [customers, setCustomers] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState<CustomerTableFilters>({
    name: "",
    licensePlate: "",
    phoneNo: "",
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [totalRowCount, setTotalRowCount] = useState(0);

  async function fetchData() {
    try {
      setIsLoading(true);

      const sortColumn = sorting.length > 0 ? sorting[0].id : null;
      const sortOrder =
        sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : null;

      const res = await apiFetch(
        `/api/customer${toQueryString({
          pageSize,
          pageIndex,
          sortColumn,
          sortOrder,
          ...filters
        })}`,
        { method: "GET" }
      );

      setCustomers(res.result);
      setTotalRowCount(res.recordsTotal);
    } catch (e) {
      toast.error(e + "", { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize, sorting]);

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <Button variant="outline" className="w-full sm:w-auto">
            <PiArrowLineUpBold className="me-1.5 h-[17px] w-[17px]" />
            Export
          </Button>
          <Link href={routes.master.customer.add} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
              Tambah
            </Button>
          </Link>
        </div>
      </PageHeader>

      <CustomerFilter
        filters={filters}
        setFilters={setFilters}
        handleSearch={() => fetchData()}
      />

      <CustomersTable
        data={customers}
        pageSize={pageSize}
        setPageSize={setPageSize}
        pageIndex={pageIndex}
        setPageIndex={setPageIndex}
        sorting={sorting}
        setSorting={setSorting}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        isLoading={isLoading}
        totalRowCount={totalRowCount}
      />
    </>
  );
}
