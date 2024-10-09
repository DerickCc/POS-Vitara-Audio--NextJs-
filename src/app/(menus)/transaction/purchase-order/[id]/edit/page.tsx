'use client';

import PurchaseOrderForm from "@/components/forms/transaction/purchase-order-form";
import PageHeader from "@/components/page-header";
import { routes } from "@/config/routes";
import { PurchaseOrderModel, UpdatePurchaseOrderSchema } from "@/models/purchase-order.model";
import { getPoById, updatePo } from "@/services/purchase-order-service";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const pageHeader = {
  title: 'Edit Pembelian',
  breadcrumb: [
    { name: 'Transaksi Pembelian' },
    {
      href: routes.transaction.purchaseOrder.data,
      name: 'Pembelian',
    },
    {
      name: 'Edit Pembelian',
    },
  ],
};

export default function EditPurchaseOrderPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [po, setPo] = useState<PurchaseOrderModel>(new PurchaseOrderModel());
  const [isLoading, setIsLoading] = useState(true);

  const update = async (payload: PurchaseOrderModel) => {
    try {
      const message = await updatePo(id, payload);
      toast.success(message, { duration: 4000 });

      router.push(routes.transaction.purchaseOrder.data);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  };

  useEffect(() => {
    const fetchPo = async () => {
      try {
        setIsLoading(true);
        setPo(await getPoById(id));
      } catch (e) {
        toast.error(e + '', { duration: 5000 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPo();
  }, [id]);

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}></PageHeader>

      <PurchaseOrderForm defaultValues={po} schema={UpdatePurchaseOrderSchema} isLoading={isLoading} onSubmit={update} />
    </>
  );
}