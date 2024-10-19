'use client';

import CustomerForm from '@/components/forms/master/customer-form';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { CustomerModel } from '@/models/customer.model';
import { getCustomerById, updateCustomer } from '@/services/customer-service';
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
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<CustomerModel>(new CustomerModel());
  const [isLoading, setIsLoading] = useState(true);

  const update = async (payload: CustomerModel) => {
    try {
      const message = await updateCustomer(id, payload);
      toast.success(message, { duration: 4000 });

      router.push(routes.master.customer.data);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  };

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
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}></PageHeader>

      <CustomerForm defaultValues={customer} isLoading={isLoading} onSubmit={update} />
    </>
  );
}
