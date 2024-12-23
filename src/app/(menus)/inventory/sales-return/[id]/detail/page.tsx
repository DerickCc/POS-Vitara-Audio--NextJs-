'use client';

import SalesReturnForm from '@/components/inventory/sales-return/sales-return-form';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { SalesReturnModel } from '@/models/sales-return.model';
import { getSrById } from '@/services/sales-return-service';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiArrowLeftBold } from 'react-icons/pi';
import { Button } from 'rizzui';

const pageHeader = {
  title: 'Detail Penjualan',
  breadcrumb: [
    { name: 'Inventori' },
    {
      href: routes.inventory.salesReturn.data,
      name: 'Retur Penjualan',
    },
    {
      name: 'Detail Retur Penjualan',
    },
  ],
};

export default function DetailSaleReturnPage() {
  const { id } = useParams<{ id: string }>();
  const [sr, setSr] = useState<SalesReturnModel>(new SalesReturnModel());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSr = async () => {
      try {
        setIsLoading(true);
        setSr(await getSrById(id));
      } catch (e) {
        toast.error(e + '', { duration: 5000 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSr();
  }, [id]);

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

        <SalesReturnForm defaultValues={sr} isReadOnly={true} isLoading={isLoading} onSubmit={async () => {}} />
      </div>
    </>
  );
}
