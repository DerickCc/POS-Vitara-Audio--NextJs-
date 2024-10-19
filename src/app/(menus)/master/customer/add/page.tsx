'use client';

import CustomerForm from '@/components/forms/master/customer-form';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { CustomerModel } from '@/models/customer.model';
import { createCustomer } from '@/services/customer-service';
import { apiFetch } from '@/utils/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

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
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}></PageHeader>

      <CustomerForm onSubmit={create} />
    </>
  );
}
