'use client';

import ProductForm from '@/components/inventory/product/product-form';
import ProductHistoryTable from '@/components/inventory/product/product-history-table';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { ProductModel } from '@/models/product.model';
import { getProductById } from '@/services/product-service';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiArrowLeftBold } from 'react-icons/pi';
import { Button } from 'rizzui';

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
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductModel>(new ProductModel());
  const [isLoading, setIsLoading] = useState(true);

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
        <div className='flex'>
          <Link href={routes.inventory.product.data}>
            <Button variant='outline' className='border-2 border-gray-200'>
              <PiArrowLeftBold className='size-4 me-1.5' />
              <span>Kembali</span>
            </Button>
          </Link>
        </div>

        <ProductForm defaultValues={product} isReadOnly={true} isLoading={isLoading} onSubmit={async () => {}} />

        <ProductHistoryTable productId={id} />
      </div>
    </>
  );
}
