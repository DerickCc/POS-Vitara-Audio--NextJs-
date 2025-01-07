'use client';

import SalesReturnForm from '@/components/inventory/sales-return/sales-return-form';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { SalesReturnModel } from '@/models/sales-return.model';
import { createSr } from '@/services/sales-return-service';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { PiArrowLeftBold } from 'react-icons/pi';
import { Button } from 'rizzui';

const pageHeader = {
  title: 'Tambah Retur Penjualan',
  breadcrumb: [
    {
      name: 'Inventori',
    },
    {
      href: routes.inventory.salesReturn.data,
      name: 'Retur Penjualan',
    },
    {
      name: 'Tambah Retur Penjualan',
    },
  ],
};

export default function AddSalesReturnPage() {
  const router = useRouter();
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);

  const create = async (payload: SalesReturnModel) => {
    try {
      const message = await createSr(payload);
      setIsSubmitSuccessful(true);
      toast.success(message, { duration: 4000 });

      router.push(routes.inventory.salesReturn.data);
    } catch (e) {
      setIsSubmitSuccessful(false);
      toast.error(e + '', { duration: 5000 });
    }
  };

  return (
    <>
      <PageHeader {...pageHeader}></PageHeader>

      <div className='grid gap-6'>
        <Link href={routes.inventory.salesReturn.data}>
          <Button variant='outline' className='border-2 border-gray-200'>
            <PiArrowLeftBold className='size-4 me-1.5' />
            <span>Kembali</span>
          </Button>
        </Link>
        
        <SalesReturnForm onSubmit={create} isSubmitSuccessful={isSubmitSuccessful} />
      </div>
    </>
  );
}
