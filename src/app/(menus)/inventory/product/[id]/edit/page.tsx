'use client';

import ProductForm from '@/components/inventory/product/product-form';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { ProductModel } from '@/models/product.model';
import { getProductById, updateProduct } from '@/services/product-service';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiArrowLeftBold } from 'react-icons/pi';
import { Button } from 'rizzui';

const pageHeader = {
  title: 'Edit Barang',
  breadcrumb: [
    { name: 'Master' },
    {
      href: routes.inventory.product.data,
      name: 'Barang',
    },
    {
      name: 'Edit Barang',
    },
  ],
};

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductModel>(new ProductModel());
  const [isLoading, setIsLoading] = useState(true);

  const update = async (payload: ProductModel) => {
    try {
      const message = await updateProduct(id, payload);
      toast.success(message, { duration: 4000 });

      router.push(routes.inventory.product.data);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setProduct(await getProductById(id));
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

      <div className='grid gap-6'>
        <Link href={routes.inventory.product.data}>
          <Button variant='outline' className='border-2 border-gray-200'>
            <PiArrowLeftBold className='size-4 me-1.5'></PiArrowLeftBold>
            <span>Kembali</span>
          </Button>
        </Link>
        <ProductForm defaultValues={product} isLoading={isLoading} onSubmit={update} />
      </div>
    </>
  );
}
