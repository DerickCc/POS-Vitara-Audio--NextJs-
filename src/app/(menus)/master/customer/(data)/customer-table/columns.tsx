import DeletePopover from "@/components/delete-popover";
import { routes } from "@/config/routes";
import { createColumnHelper } from "@tanstack/react-table";
import Link from "next/link";
import { LuPencil } from "react-icons/lu";
import { ActionIcon, Tooltip } from "rizzui";

type CustomerTableType = {
  id: string;
  code: string;
  name: string;
  licensePlate: string;
  phoneNo: string;
  address: string;
};

const columnHelper = createColumnHelper<CustomerTableType>();

export const columns = [
  columnHelper.display({
    id: "actions",
    size: 50,
    header: () => "Aksi",
    cell: ({ row }) => (
      <>
        <div className="flex items-center justify-center gap-3">
          <Tooltip size="sm" content="Edit" color="invert">
            <Link
              href={routes.master.customer.edit(row.original.id)}
              aria-label="ke halaman edit pelanggan"
            >
              <ActionIcon
                as="span"
                size="sm"
                variant="outline"
                className="text-yellow-500 hover:border-yellow-600 hover:text-yellow-600"
              >
                <LuPencil className="size-4" />
              </ActionIcon>
            </Link>
          </Tooltip>
          <DeletePopover
            title="Hapus Pelanggan"
            description={`Apakah Anda yakin ingin menghapus Pelanggan '${row.original.name}'?`}
            onDelete={() => console.log(row)}
          />
        </div>
      </>
    ),
  }),
  columnHelper.accessor("code", {
    id: "code",
    size: 120,
    header: () => "Kode",
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor("name", {
    id: "name",
    size: 200,
    header: () => "Nama",
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor("licensePlate", {
    id: "licensePlate",
    size: 120,
    header: () => "No. Plat",
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor("phoneNo", {
    id: "phoneNo",
    size: 140,
    header: () => "No. Telepon",
    cell: (info) => info.getValue(),
    enableSorting: false,
  }),
  columnHelper.accessor("address", {
    id: "address",
    size: 200,
    header: () => "Alamat",
    cell: (info) => info.getValue(),
    enableSorting: false,
  }),
];
