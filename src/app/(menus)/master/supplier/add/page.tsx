'use client';

import SupplierForm from '@/components/master/supplier/supplier-form';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { SupplierModel } from '@/models/supplier.model';
import { createSupplier } from '@/services/supplier-service';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { PiArrowLeftBold } from 'react-icons/pi';
import { Button } from 'rizzui';

const pageHeader = {
  title: 'Tambah Supplier',
  breadcrumb: [
    {
      name: 'Master',
    },
    {
      href: routes.master.supplier.data,
      name: 'Supplier',
    },
    {
      name: 'Tambah Supplier',
    },
  ],
};

export default function AddSupplierPage() {
  const router = useRouter();
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);

  const create = async (payload: SupplierModel) => {
    try {
      const message = await createSupplier(payload);
      setIsSubmitSuccessful(true);
      toast.success(message, { duration: 4000 });

      router.push(routes.master.supplier.data);
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
          <Link href={routes.master.supplier.data}>
            <Button variant='outline' className='border-2 border-gray-200'>
              <PiArrowLeftBold className='size-4 me-1.5' />
              <span>Kembali</span>
            </Button>
          </Link>
        </div>

        <SupplierForm onSubmit={create} isSubmitSuccessful={isSubmitSuccessful} />
      </div>
    </>
  );
}
