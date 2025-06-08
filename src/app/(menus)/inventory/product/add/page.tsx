'use client';

import ProductForm from '@/components/inventory/product/product-form';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { ProductModel } from '@/models/product.model';
import { createProduct } from '@/services/product-service';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { PiArrowLeftBold } from 'react-icons/pi';
import { Button } from 'rizzui';

const pageHeader = {
  title: 'Tambah Barang',
  breadcrumb: [
    {
      name: 'Inventori',
    },
    {
      href: routes.inventory.product.data,
      name: 'Barang',
    },
    {
      name: 'Tambah Barang',
    },
  ],
};

export default function AddProductPage() {
  const router = useRouter();
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);

  const create = async (payload: ProductModel) => {
    try {
      const message = await createProduct(payload);
      setIsSubmitSuccessful(true);
      toast.success(message, { duration: 4000 });

      router.push(routes.inventory.product.data);
    } catch (e) {
      setIsSubmitSuccessful(false);
      toast.error(e + '', { duration: 5000 });
    }
  };

  return (
    <>
      <PageHeader {...pageHeader}></PageHeader>

      <div className='grid gap-6'>
        <div className='flex'>
          <Link href={routes.inventory.product.data}>
            <Button variant='outline' className='border-2 border-gray-200'>
              <PiArrowLeftBold className='size-4 me-1.5' />
              <span>Kembali</span>
            </Button>
          </Link>
        </div>

        <ProductForm onSubmit={create} isSubmitSuccessful={isSubmitSuccessful} />
      </div>
    </>
  );
}
