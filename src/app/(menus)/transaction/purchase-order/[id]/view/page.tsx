'use client';

import PurchaseOrderForm from '@/components/forms/transaction/purchase-order-form';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { PurchaseOrderModel } from '@/models/purchase-order.model';
import { getPoById } from '@/services/purchase-order-service';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const pageHeader = {
  title: 'Detail Pembelian',
  breadcrumb: [
    { name: 'Transaksi' },
    {
      href: routes.transaction.purchaseOrder.data,
      name: 'Pembelian',
    },
    {
      name: 'Detail Pembelian',
    },
  ],
};

export default function ViewPurchaseOrderPage() {
  const { id } = useParams<{ id: string }>();
  const [po, setPo] = useState<PurchaseOrderModel>(new PurchaseOrderModel());
  const [isLoading, setIsLoading] = useState(true);

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

      <PurchaseOrderForm
        defaultValues={po}
        isReadOnly={true}
        isLoading={isLoading}
        onSubmit={async (payload: PurchaseOrderModel) => {}}
      />
    </>
  );
}
