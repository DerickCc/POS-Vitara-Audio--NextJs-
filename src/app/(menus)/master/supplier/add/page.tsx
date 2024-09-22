'use client';

import SupplierForm from '@/components/forms/master/supplier/supplier-form';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { SupplierModel } from '@/models/supplier.model';
import { apiFetch } from '@/utils/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const pageHeader = {
  title: 'Tambah Supplier',
  breadcrumb: [
    {
      name: 'Master',
    },
    {
      href: routes.master.customer.data,
      name: 'Supplier',
    },
    {
      name: 'Tambah Supplier',
    },
  ],
};

export default function AddSupplierPage() {
  const router = useRouter();

  const createSupplier = async (data: SupplierModel) => {
    try {
      const response = await apiFetch('/api/suppliers', {
        method: 'POST',
        body: data,
      });

      toast.success(response.message, { duration: 4000 });
      router.push(routes.master.supplier.data);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  };

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}></PageHeader>

      <SupplierForm defaultValues={new SupplierModel()} onSubmit={createSupplier} />
    </>
  );
}
