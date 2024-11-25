'use client';

import SalesReturnForm from '@/components/forms/inventory/sales-return-form';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { SalesReturnModel } from '@/models/sales-return.model';
import { getSrById } from '@/services/sales-return-service';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const pageHeader = {
  title: 'Detail Penjualan',
  breadcrumb: [
    { name: 'Inventori' },
    {
      href: routes.inventory.salesReturn.data,
      name: 'Retur Penjualan',
    },
    {
      name: 'Detail Retur Penjualan',
    },
  ],
};

export default function ViewSaleReturnPage() {
  const { id } = useParams<{id: string}>();
  const [sr, setSr] = useState<SalesReturnModel>(new SalesReturnModel());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSr = async () => {
      try {
        setIsLoading(true);
        setSr(await getSrById(id));
      } catch (e) {
        toast.error(e + '', { duration: 5000 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSr();
  }, [id]);

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}></PageHeader>
      
      <SalesReturnForm
        defaultValues={sr}
        isReadOnly={true}
        isLoading={isLoading}
        onSubmit={async (payload: SalesReturnModel) => {}}
      />
    </>
  )
}