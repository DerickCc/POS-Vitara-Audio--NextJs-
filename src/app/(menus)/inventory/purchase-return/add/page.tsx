'use client';

import PurchaseReturnForm from '@/components/inventory/purchase-return/purchase-return-form';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { PurchaseReturnModel } from '@/models/purchase-return.model';
import { createPr } from '@/services/purchase-return-service';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { PiArrowLeftBold } from 'react-icons/pi';
import { Button } from 'rizzui';

const pageHeader = {
  title: 'Tambah Retur Pembelian',
  breadcrumb: [
    {
      name: 'Inventori',
    },
    {
      href: routes.inventory.purchaseReturn.data,
      name: 'Retur Pembelian',
    },
    {
      name: 'Tambah Retur Pembelian',
    },
  ],
};

export default function AddPurchaseReturnPage() {
  const router = useRouter();
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);

  const create = async (payload: PurchaseReturnModel) => {
    try {
      const message = await createPr(payload);
      setIsSubmitSuccessful(true);
      toast.success(message, { duration: 4000 });

      router.push(routes.inventory.purchaseReturn.data);
    } catch (e) {
      setIsSubmitSuccessful(false);
      toast.error(e + '', { duration: 5000 });
    }
  };
  return (
    <>
      <PageHeader {...pageHeader}></PageHeader>

      <div className='grid gap-6'>
        <div className='flex'>
          <Link href={routes.inventory.purchaseReturn.data}>
            <Button variant='outline' className='border-2 border-gray-200'>
              <PiArrowLeftBold className='size-4 me-1.5' />
              <span>Kembali</span>
            </Button>
          </Link>
        </div>

        <PurchaseReturnForm onSubmit={create} isSubmitSuccessful={isSubmitSuccessful} />
      </div>
    </>
  );
}
