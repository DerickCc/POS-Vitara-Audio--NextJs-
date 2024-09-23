'use client';

import SupplierForm from '@/components/forms/master/supplier-form';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { SupplierModel } from '@/models/supplier.model';
import { apiFetch } from '@/utils/api';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const pageHeader = {
  title: 'Edit Supplier',
  breadcrumb: [
    { name: 'Master' },
    {
      href: routes.master.supplier.data,
      name: 'Supplier',
    },
    {
      name: 'Edit Supplier',
    },
  ],
};

export default function EditSupplierPage() {
  const router = useRouter();
  const { id } = useParams();
  const [supplier, setSupplier] = useState<SupplierModel>(new SupplierModel());
  const [isLoading, setIsLoading] = useState(false);

  const updateSupplier = async (data: SupplierModel) => {
    try {
      const response = await apiFetch(`/api/suppliers/${id}`, {
        method: 'PUT',
        body: data,
      });

      toast.success(response.message, { duration: 4000 });
      router.push(routes.master.supplier.data);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  };

  useEffect(() => {
    const getSupplierById = async () => {
      try {
        setIsLoading(true);
        const response = await apiFetch(`/api/suppliers/${id}`, { method: 'GET' });
        setSupplier(response.result);
      } catch (e) {
        toast.error(e + '', { duration: 5000 });
      } finally {
        setIsLoading(false);
      }
    };

    getSupplierById();
  }, [id]);

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}></PageHeader>

      <SupplierForm defaultValues={supplier} isLoading={isLoading} onSubmit={updateSupplier} />
    </>
  );
}
