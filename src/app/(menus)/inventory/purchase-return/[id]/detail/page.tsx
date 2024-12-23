'use client';

import PurchaseReturnForm from '@/components/inventory/purchase-return/purchase-return-form';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { PurchaseReturnModel } from '@/models/purchase-return.model';
import { getPrById } from '@/services/purchase-return-service';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiArrowLeftBold } from 'react-icons/pi';
import { Button } from 'rizzui';

const pageHeader = {
  title: 'Detail Pembelian',
  breadcrumb: [
    { name: 'Inventori' },
    {
      href: routes.inventory.purchaseReturn.data,
      name: 'Retur Pembelian',
    },
    {
      name: 'Detail Retur Pembelian',
    },
  ],
};

export default function DetailPurchaseReturnPage() {
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
      <PageHeader {...pageHeader}></PageHeader>

      <div className='grid gap-6'>
        <Link href={routes.inventory.purchaseReturn.data}>
          <Button variant='outline' className='border-2 border-gray-200'>
            <PiArrowLeftBold className='size-4 me-1.5' />
            <span>Kembali</span>
          </Button>
        </Link>

        <PurchaseReturnForm defaultValues={pr} isReadOnly={true} isLoading={isLoading} onSubmit={async () => {}} />
      </div>
    </>
  );
}
