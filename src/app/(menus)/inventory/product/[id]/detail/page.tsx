'use client';

import ProductForm from '@/components/inventory/product/product-form';
import ProductHistoryTable from '@/components/inventory/product/product-history-table';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { ProductModel } from '@/models/product.model';
import { getProductById, getProductHistories } from '@/services/product-service';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const pageHeader = {
  title: 'Detail Barang',
  breadcrumb: [
    { name: 'Master' },
    {
      href: routes.inventory.product.data,
      name: 'Barang',
    },
    {
      name: 'Detail Barang',
    },
  ],
};

export default function DetailProductPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductModel>(new ProductModel());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setProduct(await getProductById(id));
        await getProductHistories(id);
      } catch (e) {
        toast.error(e + '', { duration: 5000 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return (
    <>
      <PageHeader {...pageHeader}></PageHeader>

      <ProductForm defaultValues={product} isReadOnly={true} isLoading={isLoading} onSubmit={async () => {}} />

      <ProductHistoryTable />
    </>
  );
}
