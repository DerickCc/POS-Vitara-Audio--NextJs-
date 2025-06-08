'use client';

import SupplierForm from '@/components/master/supplier/supplier-form';
import SupplierHistoryTable from '@/components/master/supplier/supplier-history-table';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { SupplierModel } from '@/models/supplier.model';
import { getSupplierById } from '@/services/supplier-service';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiArrowLeftBold } from 'react-icons/pi';
import { Button } from 'rizzui';

const pageHeader = {
  title: 'Detail Supplier',
  breadcrumb: [
    { name: 'Master' },
    {
      href: routes.master.supplier.data,
      name: 'Supplier',
    },
    {
      name: 'Detail Supplier',
    },
  ],
};

export default function DetailSupplierPage() {
  const { id } = useParams<{ id: string }>();
  const [supplier, setSupplier] = useState<SupplierModel>(new SupplierModel());
  const [isLoading, setIsLoading] = useState(true);

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
        <div className='flex'>
          <Link href={routes.master.supplier.data}>
            <Button variant='outline' className='border-2 border-gray-200'>
              <PiArrowLeftBold className='size-4 me-1.5' />
              <span>Kembali</span>
            </Button>
          </Link>
        </div>

        <SupplierForm defaultValues={supplier} isReadOnly={true} isLoading={isLoading} onSubmit={async () => {}} />

        <SupplierHistoryTable supplierId={id} />
      </div>
    </>
  );
}
