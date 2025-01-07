'use client';

import PurchaseOrderForm from '@/components/transaction/purchase-order/purchase-order-form';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { PurchaseOrderModel } from '@/models/purchase-order.model';
import { getPoById, updatePo } from '@/services/purchase-order-service';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiArrowLeftBold } from 'react-icons/pi';
import Link from 'next/link';
import { Button } from 'rizzui';

const pageHeader = {
  title: 'Edit Pembelian',
  breadcrumb: [
    { name: 'Transaksi' },
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
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);

  const update = async (payload: PurchaseOrderModel) => {
    try {
      const message = await updatePo(id, payload);
      setIsSubmitSuccessful(true);
      toast.success(message, { duration: 4000 });

      router.push(routes.transaction.purchaseOrder.data);
    } catch (e) {
      setIsSubmitSuccessful(false);
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
      <PageHeader {...pageHeader}></PageHeader>

      <div className='grid gap-6'>
        <Link href={routes.transaction.purchaseOrder.data}>
          <Button variant='outline' className='border-2 border-gray-200'>
            <PiArrowLeftBold className='size-4 me-1.5' />
            <span>Kembali</span>
          </Button>
        </Link>

        <PurchaseOrderForm
          defaultValues={po}
          isLoading={isLoading}
          onSubmit={update}
          isSubmitSuccessful={isSubmitSuccessful}
        />
      </div>
    </>
  );
}
