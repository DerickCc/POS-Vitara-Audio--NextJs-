'use client';

import SalesOrderForm from '@/components/forms/transaction/sales-order-form';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { SalesOrderModel } from '@/models/sales-order';
import { createSo, getNewSoCode } from '@/services/sales-order-service';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const pageHeader = {
  title: 'Tambah Penjualan',
  breadcrumb: [
    {
      name: 'Transaksi',
    },
    {
      href: routes.transaction.salesOrder.data,
      name: 'Penjualan',
    },
    {
      name: 'Tambah Penjualan',
    },
  ],
};

export default function AddSalesOrderPage() {
  const router = useRouter();
  const [newSoCode, setNewSoCode] = useState('Loading...');

  useEffect(() => {
    const fetchNewSoCode = async () => {
      try {
        setNewSoCode(await getNewSoCode());
      } catch (e) {
        toast.error(e + '', { duration: 5000 });
      }
    };
    fetchNewSoCode();
  }, []);

  const create = async (payload: SalesOrderModel) => {
    try {
      const message = await createSo(payload);
      toast.success(message, { duration: 4000 });

      router.push(routes.transaction.salesOrder.data);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  };

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}></PageHeader>

      <SalesOrderForm newSoCode={newSoCode} onSubmit={create} />
    </>
  );
}
