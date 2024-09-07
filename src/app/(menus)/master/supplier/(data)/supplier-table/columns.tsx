import DeletePopover from "@/components/delete-popover"
import { routes } from "@/config/routes"
import { createColumnHelper } from "@tanstack/react-table"
import Link from "next/link"
import { LuPencil } from "react-icons/lu"
import { ActionIcon, Tooltip } from "rizzui"

export type SupplierTableType = {
  id: string
  code: string
  name: string
  pic: string
  phoneNo: string
  receivablesLimit: number
  receivables: number
  address: string
  remarks: string
}

const columnHelper = createColumnHelper<SupplierTableType>()

export const columns = (handleDelete: (id: string) => void) => [
  columnHelper.display({
    id: "actions",
    size: 50,
    header: () => "Aksi",
    cell: ({ row }) => (
      <>
        <div className="flex items-center justify-center gap-3">
          <Tooltip size="sm" content="Edit" color="invert">
            <Link href={routes.master.supplier.edit(row.original.id)} aria-label="ke halaman edit pelanggan">
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
            title="Hapus Supplier"
            description={`Apakah Anda yakin ingin menghapus Supplier '${row.original.name}'?`}
            onDelete={() => handleDelete(row.original.id)}
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
  columnHelper.accessor("pic", {
    id: "pic",
    size: 120,
    header: () => "PIC",
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
  columnHelper.accessor("receivables", {
    id: "receivables",
    size: 200,
    header: () => "Piutang",
    cell: (info) => {
      const row = info.row.original;
      return `${row.receivables} (Max: ${row.receivablesLimit})`
    },
    enableSorting: false,
  }),
  columnHelper.accessor("address", {
    id: "address",
    size: 200,
    header: () => "Alamat",
    cell: (info) => info.getValue() || "-",
    enableSorting: false,
  }),
  columnHelper.accessor("remarks", {
    id: "remarks",
    size: 200,
    header: () => "Keterangan",
    cell: (info) => info.getValue() || "-",
    enableSorting: false,
  }),
]
