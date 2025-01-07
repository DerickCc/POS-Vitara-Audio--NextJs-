'use client';

import SupplierForm from '@/components/master/supplier/supplier-form';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { SupplierModel } from '@/models/supplier.model';
import { getSupplierById, updateSupplier } from '@/services/supplier-service';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiArrowLeftBold } from 'react-icons/pi';
import { Button } from 'rizzui';

const pageHeader = {
  title: 'Edit Supplier',
  breadcrumb: [
    { name: 'Master' },
    {
      href: routes.master.supplier.data,
      name: 'Supplier',
    },
    {
      name: 'Edit Supplier',
    },
  ],
};

export default function EditSupplierPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [supplier, setSupplier] = useState<SupplierModel>(new SupplierModel());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);

  const update = async (payload: SupplierModel) => {
    try {
      const message = await updateSupplier(id, payload);
      setIsSubmitSuccessful(true);
      toast.success(message, { duration: 4000 });

      router.push(routes.master.supplier.data);
    } catch (e) {
      setIsSubmitSuccessful(false);
      toast.error(e + '', { duration: 5000 });
    }
  };

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        setIsLoading(true);
        setSupplier(await getSupplierById(id));
      } catch (e) {
        toast.error(e + '', { duration: 5000 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupplier();
  }, [id]);

  return (
    <>
      <PageHeader {...pageHeader}></PageHeader>
      
      <div className='grid gap-6'>
        <Link href={routes.master.supplier.data}>
          <Button variant='outline' className='border-2 border-gray-200'>
            <PiArrowLeftBold className='size-4 me-1.5'></PiArrowLeftBold>
            <span>Kembali</span>
          </Button>
        </Link>

        <SupplierForm defaultValues={supplier} isLoading={isLoading} onSubmit={update} isSubmitSuccessful={isSubmitSuccessful}/>
      </div>
    </>
  );
}
