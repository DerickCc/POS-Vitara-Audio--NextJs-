import { routes } from "@/config/routes";
import {
  PiShoppingCartDuotone,
  PiPackageDuotone,
  PiHouseLineDuotone,
  PiBookDuotone,
  PiGearDuotone,
} from "react-icons/pi";

export const menuItems = [
  // label start
  {
    name: "Menu",
  },
  // label end
  {
    name: "Dashboard",
    href: routes.dashboard,
    icon: <PiHouseLineDuotone />,
  },
  {
    name: "Master",
    href: "#",
    icon: <PiBookDuotone />,
    dropdownItems: [
      {
        name: "Supplier",
        href: routes.master.supplier
      },
      {
        name: "Pelanggan",
        href: routes.master.customer
      },
    ]
  },
  {
    name: "Inventori",
    href: "#",
    icon: <PiPackageDuotone />,
    dropdownItems: [
      {
        name: "Barang",
        href: routes.inventory.product
      },
      {
        name: "Retur Pembelian",
        href: routes.inventory.purchaseReturn
      },
      {
        name: "Retur Penjualan",
        href: routes.inventory.salesReturn
      },
    ]
  },
  {
    name: "Transaksi",
    href: "#",
    icon: <PiShoppingCartDuotone />,
    dropdownItems: [
      {
        name: "Pembelian",
        href: routes.transaction.purchaseOrder
      },
      {
        name: "Penjualan",
        href: routes.transaction.salesOrder
      },
    ]
  },
  {
    name: "Pengaturan",
    href: "#",
    icon: <PiGearDuotone />,
    dropdownItems: [
      {
        name: "User",
        href: routes.settings.user
      },
    ]
  },
];
