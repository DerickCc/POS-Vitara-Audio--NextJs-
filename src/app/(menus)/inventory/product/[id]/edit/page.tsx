'use client';

import ProductForm from "@/components/forms/inventory/product-form";
import PageHeader from "@/components/page-header";
import { routes } from "@/config/routes";
import { ProductModel } from "@/models/product.model";
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
  const { id } = useParams();
  const [product, setProduct] = useState<ProductModel>(new ProductModel());
  const [isLoading, setIsLoading] = useState(true);

  const updateProduct = async (data: ProductModel) => {
    try {
      const response = await apiFetch(`/api/products/${id}`, {
        method: 'PUT',
        body: data,
      });

      toast.success(response.message, { duration: 4000 });
      router.push(routes.inventory.product.data);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  };

  useEffect(() => {
    const getProductById = async () => {
      try {
        setIsLoading(true);
        const response = await apiFetch(`/api/products/${id}`, { method: 'GET' });
        setProduct(response.result);
      } catch (e) {
        toast.error(e + '', { duration: 5000 });
      } finally {
        setIsLoading(false);
      }
    };

    getProductById();
  }, [id]);

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}></PageHeader>

      <ProductForm defaultValues={product} isLoading={isLoading} onSubmit={updateProduct} />
    </>
  );
}
