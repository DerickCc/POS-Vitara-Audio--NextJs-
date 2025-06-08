'use client';

import PurchaseOrderForm from '@/components/transaction/purchase-order/purchase-order-form';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { PurchaseOrderModel } from '@/models/purchase-order.model';
import { getPoById } from '@/services/purchase-order-service';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Button } from 'rizzui';
import { PiArrowLeftBold } from 'react-icons/pi';

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

export default function DetailPurchaseOrderPage() {
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
      <PageHeader {...pageHeader}></PageHeader>

      <div className='grid gap-6'>
        <div className='flex'>
          <Link href={routes.transaction.purchaseOrder.data}>
            <Button variant='outline' className='border-2 border-gray-200'>
              <PiArrowLeftBold className='size-4 me-1.5' />
              <span>Kembali</span>
            </Button>
          </Link>
        </div>

        <PurchaseOrderForm defaultValues={po} isReadOnly={true} isLoading={isLoading} onSubmit={async () => {}} />
      </div>
    </>
  );
}
