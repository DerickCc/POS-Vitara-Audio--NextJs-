import Card from '@/components/card';
import ThousandSeparatorFormInput from '@/components/form-inputs/thousand-separator-form-input';
import Spinner from '@/components/spinner';
import { routes } from '@/config/routes';
import { ProductModel, ProductSchema } from '@/models/product.model';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaSave } from 'react-icons/fa';
import { PiArrowLeftBold } from 'react-icons/pi';
import { Button, Input, Loader, Textarea } from 'rizzui';

type ProductFormProps = {
  defaultValues: ProductModel;
  isLoading?: boolean;
  onSubmit: (data: ProductModel) => Promise<void>;
};

export default function ProductForm({ defaultValues, isLoading = false, onSubmit }: ProductFormProps) {
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProductModel>({
    defaultValues: defaultValues,
    resolver: zodResolver(ProductSchema),
  });

  useEffect(() => {
    reset(defaultValues); // Update form values when defaultValues change
  }, [defaultValues, reset]);

  return (
    <Card>
      {isLoading ? (
        <Spinner />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid sm:grid-cols-4 gap-6 mb-7">
            <Textarea
              label="Keterangan"
              placeholder="Keterangan"
              className="sm:row-span-4"
              error={errors.remarks?.message}
              {...register('remarks')}
            />
            <Input
              label="Nama"
              placeholder="Nama"
              className="sm:col-span-3"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input type="number" label="Stok" placeholder="xxx" error={errors.stock?.message} {...register('stock')} />
            <Input
              type="number"
              label="Ambang Batas Restok"
              placeholder="xxx"
              error={errors.restockThreshold?.message}
              {...register('restockThreshold')}
            />
            <Input label="Satuan" placeholder="Satuan" error={errors.uom?.message} {...register('uom')} />
            <div className="sm:col-span-3 grid sm:grid-cols-2 gap-6">
              <ThousandSeparatorFormInput
                setValue={setValue}
                label="Harga Beli"
                fieldName="purchasePrice"
                defaultValue={defaultValues.purchasePrice}
                error={errors.purchasePrice?.message}
              />
              <ThousandSeparatorFormInput
                setValue={setValue}
                label="Harga Jual"
                fieldName="receivablesLimit"
                defaultValue={defaultValues.sellingPrice}
                error={errors.sellingPrice?.message}
              />
            </div>
            <div className="sm:col-span-3 grid sm:grid-cols-2  gap-6">
              <ThousandSeparatorFormInput
                setValue={setValue}
                label="Harga Modal"
                fieldName="costPrice"
                defaultValue={defaultValues.costPrice}
                readOnly={true}
                error={errors.costPrice?.message}
              />
              <Input
                label="Harga Modal (Kode)"
                placeholder="xxx"
                inputClassName={'bg-gray-100'}
                readOnly={true}
                error={errors.costPriceCode?.message}
                {...register('costPriceCode')}
              />
            </div>

            <Textarea
              label="Keterangan"
              placeholder="Keterangan"
              className="sm:col-span-4"
              error={errors.remarks?.message}
              {...register('remarks')}
            />
          </div>

          <div className="flex justify-between">
            <Link href={routes.inventory.product.data}>
              <Button variant="outline" className="border-2 border-gray-200">
                <PiArrowLeftBold className="size-4 me-1.5"></PiArrowLeftBold>
                <span>Kembali</span>
              </Button>
            </Link>

            <Button
              className="bg-green-500 hover:bg-green-700 hover:text-gray-100 disabled:bg-gray-400 disabled:text-gray-200"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader variant="spinner" className="me-1.5" />
              ) : (
                <FaSave className="size-4 me-1.5"></FaSave>
              )}
              <span>Simpan</span>
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
