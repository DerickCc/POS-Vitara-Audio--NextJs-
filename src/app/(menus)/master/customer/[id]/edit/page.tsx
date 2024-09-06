'use client';

import CustomerForm from '@/components/forms/master/customer/customer-form';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { CustomerModel } from '@/models/customer.model';
import { apiFetch } from '@/utils/api';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const pageHeader = {
  title: 'Edit Pelanggan',
  breadcrumb: [
    { name: 'Master' },
    {
      href: routes.master.customer.data,
      name: 'Pelanggan',
    },
    {
      name: 'Edit Pelanggan',
    },
  ],
};

export default function EditCustomerPage() {
  const router = useRouter();
  const { id } = useParams();
  const [customer, setCustomer] = useState<CustomerModel>(new CustomerModel());

  const save = async (data: CustomerModel) => {
    try {
      const response = await apiFetch(`/api/customer/${id}`, {
        method: 'PUT',
        body: data,
      });

      toast.success(response.message, { duration: 4000 });
      router.push(routes.master.customer.data);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  };

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await apiFetch(`/api/customer/${id}`, { method: 'GET' });
        setCustomer(response.result);
      } catch (e) {
        toast.error(e + '', { duration: 5000 });
      }
    };

    fetchCustomer();
  }, [id]);

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}></PageHeader>

      <CustomerForm defaultValues={customer} onSubmit={save} />
    </>
  );
}
