'use client';

import SalesOrderForm from '@/components/transaction/sales-order/sales-order-form';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { SalesOrderModel } from '@/models/sales-order';
import { getSoById } from '@/services/sales-order-service';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Button } from 'rizzui';
import { PiArrowLeftBold } from 'react-icons/pi';

const pageHeader = {
  title: 'Detail Penjualan',
  breadcrumb: [
    {
      name: 'Transaksi',
    },
    {
      href: routes.transaction.salesOrder.data,
      name: 'Penjualan',
    },
    {
      name: 'Detail Penjualan',
    },
  ],
};

export default function DetailSalesOrderPage() {
  const { id } = useParams<{ id: string }>();
  const [so, setSo] = useState<SalesOrderModel>(new SalesOrderModel());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPo = async () => {
      try {
        setIsLoading(true);
        setSo(await getSoById(id));
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
        <Link href={routes.transaction.salesOrder.data}>
          <Button variant='outline' className='border-2 border-gray-200'>
            <PiArrowLeftBold className='size-4 me-1.5' />
            <span>Kembali</span>
          </Button>
        </Link>

        <SalesOrderForm defaultValues={so} isReadOnly={true} isLoading={isLoading} onSubmit={async () => {}} />
      </div>
    </>
  );
}
