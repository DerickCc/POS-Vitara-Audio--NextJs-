import { routes } from "@/config/routes";

export const pageLinks = [
  {
    name: 'Menu',
  },
  {
    name: 'Dashboard',
    href: routes.dashboard,
  },
  {
    name: 'Supplier',
    href: routes.master.supplier.data,
  },
  {
    name: 'Pelanggan',
    href: routes.master.customer.data,
  },
  {
    name: 'Barang',
    href: routes.inventory.product.data,
  },
  {
    name: 'Retur Pembelian',
    href: routes.inventory.purchaseReturn,
  },
  {
    name: 'Retur Penjualan',
    href: routes.inventory.salesReturn,
  },
  {
    name: 'Transaksi Pembelian',
    href: routes.transaction.purchaseOrder,
  },
  {
    name: 'Transaksi Penjualan',
    href: routes.transaction.salesOrder,
  },
  {
    name: 'User',
    href: routes.settings.user.data,
  },
]