'use client';

import PurchaseReturnForm from "@/components/forms/inventory/purchase-return-form";
import PageHeader from "@/components/page-header";
import { routes } from "@/config/routes";
import { PurchaseReturnModel } from "@/models/purchase-return.model";
import { createPr } from "@/services/purchase-return-service";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const pageHeader = {
  title: 'Tambah Retur Pembelian',
  breadcrumb: [
    {
      name: 'Inventori',
    },
    {
      href: routes.transaction.purchaseOrder.data,
      name: 'Retur Pembelian',
    },
    {
      name: 'Tambah Retur Pembelian',
    },
  ],
};

export default function EditPurchaseReturnPage() {
  const router = useRouter();

  const create = async (payload: PurchaseReturnModel) => {
    try {
      const message = await createPr(payload);
      toast.success(message, { duration: 4000 });

      router.push(routes.inventory.purchaseReturn.data);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  }
  return (
    <>
    <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}></PageHeader>

    <PurchaseReturnForm onSubmit={create}/>
  </>
  )
}