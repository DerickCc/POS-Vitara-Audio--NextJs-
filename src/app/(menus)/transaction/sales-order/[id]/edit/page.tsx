'use client';

import PageHeader from "@/components/page-header";
import SalesOrderForm from "@/components/transaction/sales-order/sales-order-form";
import { routes } from "@/config/routes";
import { SalesOrderModel } from "@/models/sales-order";
import { getSoById, updateSo } from "@/services/sales-order-service";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PiArrowLeftBold } from "react-icons/pi";
import { Button } from "rizzui";

const pageHeader = {
  title: 'Edit Penjualan',
  breadcrumb: [
    {
      name: 'Transaksi',
    },
    {
      href: routes.transaction.salesOrder.data,
      name: 'Penjualan',
    },
    {
      name: 'Edit Penjualan',
    },
  ],
};

export default function EditSalesOrderPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [so, setSo] = useState<SalesOrderModel>(new SalesOrderModel());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);

  const update = async (payload: SalesOrderModel) => {
    try {
      const message = await updateSo(id, payload);
      setIsSubmitSuccessful(true);
      toast.success(message, { duration: 4000 });

      router.push(routes.transaction.salesOrder.data);
    } catch (e) {
      setIsSubmitSuccessful(false);
      toast.error(e + '', { duration: 5000 });
    }
  };

  useEffect(() => {
    const fetchSo = async () => {
      try {
        setIsLoading(true);
        setSo(await getSoById(id));
      } catch (e) {
        toast.error(e + '', { duration: 5000 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSo();
  }, [id]);

  return (
    <>
      <PageHeader {...pageHeader}></PageHeader>

      <div className='grid gap-6'>
        <Link href={routes.transaction.salesOrder.data}>
          <Button variant='outline' className='border-2 border-gray-200'>
            <PiArrowLeftBold className='size-4 me-1.5' />
            <span>Kembali</span>
          </Button>
        </Link>

        <SalesOrderForm
          defaultValues={so}
          isLoading={isLoading}
          onSubmit={update}
          isSubmitSuccessful={isSubmitSuccessful}
        />
      </div>
    </>
  );
}