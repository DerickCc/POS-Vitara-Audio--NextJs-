'use client';

import SalesReturnForm from '@/components/forms/inventory/sales-return-form';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { SalesReturnModel } from '@/models/sales-return.model';
import { createSr } from '@/services/sales-return-service';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const pageHeader = {
  title: 'Tambah Retur Penjualan',
  breadcrumb: [
    {
      name: 'Inventori',
    },
    {
      href: routes.inventory.salesReturn.data,
      name: 'Retur Penjualan',
    },
    {
      name: 'Tambah Retur Penjualan',
    },
  ],
};

export default function AddSalesReturnPage() {
  const router = useRouter();

  const create = async (payload: SalesReturnModel) => {
    try {
      const message = await createSr(payload);
      toast.success(message, { duration: 4000 });

      router.push(routes.inventory.salesReturn.data);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  };

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}></PageHeader>

      <SalesReturnForm onSubmit={create} />
    </>
  );
}
