'use client';

import ProductForm from "@/components/forms/inventory/product-form";
import PageHeader from "@/components/page-header";
import { routes } from "@/config/routes";
import { ProductModel } from "@/models/product.model";
import { getProductById, updateProduct } from "@/services/product-service";
import { apiFetch } from "@/utils/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

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
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}></PageHeader>

      <ProductForm defaultValues={product} isLoading={isLoading} onSubmit={update} />
    </>
  );
}
