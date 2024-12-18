'use client';

import SupplierForm from '@/components/master/supplier/supplier-form';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { SupplierModel } from '@/models/supplier.model';
import { getSupplierById, updateSupplier } from '@/services/supplier-service';
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
  const { id } = useParams<{ id: string }>();
  const [supplier, setSupplier] = useState<SupplierModel>(new SupplierModel());
  const [isLoading, setIsLoading] = useState(true);

  const update = async (payload: SupplierModel) => {
    try {
      const message = await updateSupplier(id, payload);
      toast.success(message, { duration: 4000 });

      router.push(routes.master.supplier.data);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  };

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        setIsLoading(true);
        setSupplier(await getSupplierById(id));
      } catch (e) {
        toast.error(e + '', { duration: 5000 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupplier();
  }, [id]);

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}></PageHeader>

      <SupplierForm defaultValues={supplier} isLoading={isLoading} onSubmit={update} />
    </>
  );
}
