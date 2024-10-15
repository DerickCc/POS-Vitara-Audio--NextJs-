'use client';

import SalesOrderForm from '@/components/forms/transaction/sales-order-form';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { SalesOrderModel } from '@/models/sales-order';
import { getSoById } from '@/services/sales-order-service';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const pageHeader = {
  title: 'Lihat Penjualan',
  breadcrumb: [
    {
      name: 'Transaksi',
    },
    {
      href: routes.transaction.salesOrder.data,
      name: 'Penjualan',
    },
    {
      name: 'Lihat Penjualan',
    },
  ],
};

export default function ViewSalesOrderPage() {
  const { id } = useParams<{ id: string }>();
  const [so, setSo] = useState<SalesOrderModel>(new SalesOrderModel());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPo = async () => {
      try {
        setIsLoading(true);
        setSo(await getSoById(id));
      } catch (e) {
        toast.error(e + '', { duration: 5000 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPo();
  }, [id]);

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}></PageHeader>

      <SalesOrderForm
        defaultValues={so}
        isReadOnly={true}
        isLoading={isLoading}
        onSubmit={async (payload: SalesOrderModel) => {}}
      />
    </>
  );
}
