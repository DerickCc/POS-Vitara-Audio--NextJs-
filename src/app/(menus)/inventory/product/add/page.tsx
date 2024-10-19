'use client';

import ProductForm from '@/components/forms/inventory/product-form';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { ProductModel } from '@/models/product.model';
import { createProduct } from '@/services/product-service';
import { apiFetch } from '@/utils/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

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

  const create = async (payload: ProductModel) => {
    try {
      const message = await createProduct(payload);
      toast.success(message, { duration: 4000 });
      
      router.push(routes.inventory.product.data);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  };

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}></PageHeader>

      <ProductForm onSubmit={create} />
    </>
  );
}
