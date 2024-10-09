'use client';

import PurchaseOrderForm from "@/components/forms/transaction/purchase-order-form";
import PageHeader from "@/components/page-header";
import { routes } from "@/config/routes";
import { CreatePurchaseOrderDetailSchema } from "@/models/purchase-order-detail.model";
import { PurchaseOrderModel } from "@/models/purchase-order.model";
import { createPo } from "@/services/purchase-order-service";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const pageHeader = {
  title: 'Tambah Pembelian',
  breadcrumb: [
    {
      name: 'Transaksi',
    },
    {
      href: routes.transaction.purchaseOrder.data,
      name: 'Pembelian',
    },
    {
      name: 'Tambah Pembelian',
    },
  ],
};


export default function AddPurchaseOrderPage() {
  const router = useRouter();

  const create = async (payload: PurchaseOrderModel) => {
    try {
      const message = await createPo(payload);
      toast.success(message, { duration: 4000 });

      router.push(routes.transaction.purchaseOrder.data);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  }

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}></PageHeader>

      <PurchaseOrderForm schema={CreatePurchaseOrderDetailSchema} onSubmit={create}/>
    </>
  )
}