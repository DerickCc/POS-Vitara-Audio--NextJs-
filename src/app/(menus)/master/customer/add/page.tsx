'use client';

import CustomerForm from '@/components/master/customer/customer-form';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { CustomerModel } from '@/models/customer.model';
import { createCustomer } from '@/services/customer-service';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { PiArrowLeftBold } from 'react-icons/pi';
import { Button } from 'rizzui';

const pageHeader = {
  title: 'Tambah Pelanggan',
  breadcrumb: [
    {
      name: 'Master',
    },
    {
      href: routes.master.customer.data,
      name: 'Pelanggan',
    },
    {
      name: 'Tambah Pelanggan',
    },
  ],
};

export default function AddCustomerPage() {
  const router = useRouter();

  const create = async (payload: CustomerModel) => {
    try {
      const message = await createCustomer(payload);
      toast.success(message, { duration: 4000 });

      router.push(routes.master.customer.data);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  };

  return (
    <>
      <PageHeader {...pageHeader}></PageHeader>
      
      <div className='grid gap-6'>
        <Link href={routes.master.customer.data}>
          <Button variant='outline' className='border-2 border-gray-200'>
            <PiArrowLeftBold className='size-4 me-1.5'></PiArrowLeftBold>
            <span>Kembali</span>
          </Button>
        </Link>

        <CustomerForm onSubmit={create} />
      </div>
    </>
  );
}
