'use client';

import CustomerForm from '@/components/forms/master/customer/customer-form';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { CustomerModel } from '@/models/customer.model';
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

  const createCustomer = async (data: CustomerModel) => {
    try {
      const response = await apiFetch('/api/customers', {
        method: 'POST',
        body: data,
      });

      toast.success(response.message, { duration: 4000 });
      router.push(routes.master.customer.data);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  };

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}></PageHeader>

      <CustomerForm defaultValues={new CustomerModel()} onSubmit={createCustomer} />
    </>
  );
}
