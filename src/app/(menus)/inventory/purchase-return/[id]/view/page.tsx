'use client';

import PurchaseReturnForm from '@/components/forms/inventory/purchase-return-form';
import PurchaseOrderForm from '@/components/forms/transaction/purchase-order-form';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { PurchaseOrderModel } from '@/models/purchase-order.model';
import { PurchaseReturnModel } from '@/models/purchase-return.model';
import { getPoById } from '@/services/purchase-order-service';
import { getPrById } from '@/services/purchase-return-service';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const pageHeader = {
  title: 'Detail Pembelian',
  breadcrumb: [
    { name: 'Inventori' },
    {
      href: routes.transaction.purchaseOrder.data,
      name: 'Retur Pembelian',
    },
    {
      name: 'Detail Retur Pembelian',
    },
  ],
};

export default function ViewPurchaseReturnPage() {
  const { id } = useParams<{ id: string }>();
  const [pr, setPr] = useState<PurchaseReturnModel>(new PurchaseReturnModel());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPr = async () => {
      try {
        setIsLoading(true);
        setPr(await getPrById(id));
      } catch (e) {
        toast.error(e + '', { duration: 5000 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPr();
  }, [id]);

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}></PageHeader>

      <PurchaseReturnForm
        defaultValues={pr}
        isReadOnly={true}
        isLoading={isLoading}
        onSubmit={async (payload: PurchaseReturnModel) => {}}
      />
    </>
  );
}
