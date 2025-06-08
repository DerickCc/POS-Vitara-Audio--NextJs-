'use client';

import CustomerForm from '@/components/master/customer/customer-form';
import CustomerHistoryTable from '@/components/master/customer/customer-history-table';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { CustomerModel } from '@/models/customer.model';
import { getCustomerById } from '@/services/customer-service';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiArrowLeftBold } from 'react-icons/pi';
import { Button } from 'rizzui';

const pageHeader = {
  title: 'Detail Pelanggan',
  breadcrumb: [
    { name: 'Master' },
    {
      href: routes.master.customer.data,
      name: 'Pelanggan',
    },
    {
      name: 'Detail Pelanggan',
    },
  ],
};

export default function DetailCustomerPage() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<CustomerModel>(new CustomerModel());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setIsLoading(true);
        setCustomer(await getCustomerById(id));
      } catch (e) {
        toast.error(e + '', { duration: 5000 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  return (
    <>
      <PageHeader {...pageHeader}></PageHeader>

      <div className='grid gap-6'>
        <div className='flex'>
          <Link href={routes.master.customer.data}>
            <Button variant='outline' className='border-2 border-gray-200'>
              <PiArrowLeftBold className='size-4 me-1.5' />
              <span>Kembali</span>
            </Button>
          </Link>
        </div>

        <CustomerForm defaultValues={customer} isReadOnly={true} isLoading={isLoading} onSubmit={async () => {}} />

        <CustomerHistoryTable customerId={id} />
      </div>
    </>
  );
}
