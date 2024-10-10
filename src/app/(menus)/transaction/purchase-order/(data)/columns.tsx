import { routes } from '@/config/routes';
import { Colors, TableAction } from '@/models/global.model';
import { createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';
import { LuEye, LuMoreVertical, LuPencil } from 'react-icons/lu';
import { PurchaseOrderModel } from '@/models/purchase-order.model';
import { formatToCurrency, isoStringToReadableDate } from '@/utils/helper-function';
import cn from '@/utils/class-names';
import { mapTrxStatusToColor } from '@/config/global-variables';
import { badgeColorClass, baseBadgeClass } from '@/utils/tailwind-classes';
import { FaRegTrashAlt } from 'react-icons/fa';
import { ActionIcon, Dropdown } from 'rizzui';
import ConfirmationModal from '@/components/confirmation-modal';

const columnHelper = createColumnHelper<PurchaseOrderModel>();

export const columns = (modalState: boolean, setModalState: (state: boolean) => void, actions: TableAction[]) => [
  columnHelper.display({
    id: 'actions',
    size: 60,
    header: () => 'Aksi',
    cell: ({ row }) => {
      return (
        <Dropdown>
          <Dropdown.Trigger>
            <ActionIcon variant='outline' rounded='full' className='p-0'>
              <LuMoreVertical className='size-5 text-primary' />
            </ActionIcon>
          </Dropdown.Trigger>
          <Dropdown.Menu>
            <Link href={routes.transaction.purchaseOrder.edit(row.original.id)}>
              <Dropdown.Item>
                <LuEye className='text-blue-500 size-4 cursor-pointer mr-2' /> Detail
              </Dropdown.Item>
            </Link>
            <Link href={routes.transaction.purchaseOrder.edit(row.original.id)}>
              <Dropdown.Item>
                <LuPencil className='text-yellow-500 size-4 cursor-pointer mr-2' /> Edit
              </Dropdown.Item>
            </Link>
            <Dropdown.Item onClick={() => alert('test')}>
              <LuPencil className='text-yellow-500 size-4 cursor-pointer mr-2' /> Hapus
            </Dropdown.Item>
            {actions.map((action) => (
              <>
                <Dropdown.Item key={action.label} onClick={() => setModalState(true)}>
                  {action.label === 'Hapus' && <FaRegTrashAlt className='text-red-500 size-4 cursor-pointer mr-2' />}
                  {action.label}
                </Dropdown.Item>
                <ConfirmationModal
                  isOpen={modalState}
                  id={row.original.id}
                  title={action.title}
                  description={action.description}
                  setModalState={setModalState}
                  handleConfirm={action.handler}
                />
              </>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      );
    },
  }),
  columnHelper.accessor('code', {
    id: 'code',
    size: 100,
    header: () => 'Kode',
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('purchaseDate', {
    id: 'purchaseDate',
    size: 150,
    header: () => 'Tanggal Pembelian',
    cell: (info) => isoStringToReadableDate(info.getValue()),
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
  columnHelper.accessor('grandTotal', {
    id: 'grandTotal',
    size: 130,
    header: () => 'Grand Total',
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
      return <span className={cn(badgeColorClass[color], baseBadgeClass)}>{status}</span>;
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
];
