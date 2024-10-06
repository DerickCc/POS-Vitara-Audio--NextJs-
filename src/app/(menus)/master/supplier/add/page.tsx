'use client';

import SupplierForm from '@/components/forms/master/supplier-form';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { SupplierModel } from '@/models/supplier.model';
import { createSupplier } from '@/services/supplier-service';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const pageHeader = {
  title: 'Tambah Supplier',
  breadcrumb: [
    {
      name: 'Master',
    },
    {
      href: routes.master.supplier.data,
      name: 'Supplier',
    },
    {
      name: 'Tambah Supplier',
    },
  ],
};

export default function AddSupplierPage() {
  const router = useRouter();

  const create = async (payload: SupplierModel) => {
    try {
      const message = await createSupplier(payload);
      toast.success(message, { duration: 4000 });

      router.push(routes.master.supplier.data);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  };

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}></PageHeader>

      <SupplierForm onSubmit={create} />
    </>
  );
}
