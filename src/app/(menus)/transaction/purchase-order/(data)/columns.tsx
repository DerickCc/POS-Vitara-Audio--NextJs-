import { routes } from "@/config/routes";
import { Colors, TableAction } from "@/models/global.model";
import { createColumnHelper } from "@tanstack/react-table";
import Link from "next/link";
import { ActionIcon, Tooltip } from "rizzui";
import { LuPencil } from 'react-icons/lu';
import ActionPopover from "@/components/action-popover";
import { PurchaseOrderModel } from "@/models/purchase-order.model";
import { formatToCurrency } from "@/utils/helper-function";
import cn from "@/utils/class-names";
import { mapTrxStatusToColor } from "@/config/global-variables";
import { badgeColorClass, baseBadgeClass } from "@/utils/tailwind-classes";

const columnHelper = createColumnHelper<PurchaseOrderModel>();

export const columns = (actions: TableAction[]) => [
  columnHelper.display({
    id: 'actions',
    size: 100,
    header: () => 'Aksi',
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-3">
        <Tooltip size="sm" content="Edit" color="invert">
          <Link href={routes.transaction.purchaseOrder.edit(row.original.id)} aria-label="ke halaman edit pelanggan">
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
        {actions.map((action) => (
          <ActionPopover
            key={action.label}
            label={action.label}
            title={action.title}
            description={action.description}
            color={action.color}
            handler={() => action.handler(row.original.id)}
          />
        ))}
      </div>
    ),
  }),
  columnHelper.accessor('code', {
    id: 'code',
    size: 100,
    header: () => 'Kode',
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('supplierName', {
    id: 'supplierName',
    size: 150,
    header: () => 'Supplier',
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('totalItem', {
    id: 'totalItem',
    size: 80,
    header: () => 'Total Item',
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('totalPrice', {
    id: 'totalPrice',
    size: 130,
    header: () => 'Total Harga',
    cell: (info) => `Rp ${formatToCurrency(info.getValue())}`,
    enableSorting: true,
  }),
  columnHelper.accessor('status', {
    id: 'status',
    size: 150,
    header: () => 'Status',
    cell: (info) => {
      const status = info.getValue();
      const color = mapTrxStatusToColor[status] as Colors;
      return (
        <span className={cn(badgeColorClass[color], baseBadgeClass)}>{status}</span>
      )
    },
    enableSorting: true,
  }),
  columnHelper.accessor('remarks', {
    id: 'remarks',
    size: 250,
    header: () => 'Keterangan',
    cell: (info) => info.getValue() || '-',
    enableSorting: false,
  }),
]