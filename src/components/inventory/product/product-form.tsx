import Card from '@/components/card';
import DecimalFormInput from '@/components/form-inputs/decimal-form-input';
import RupiahFormInput from '@/components/form-inputs/rupiah-form-input';
import Spinner from '@/components/spinner';
import { ProductModel, ProductSchema } from '@/models/product.model';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FaSave } from 'react-icons/fa';
import { Button, Input, Loader, Select, Textarea } from 'rizzui';
import { BasicFormProps, BasicSelectOptions } from '@/models/global.model';
import cn from '@/utils/class-names';
import { baseButtonClass, buttonColorClass, readOnlyClass } from '@/config/tailwind-classes';
import { productTypeOptions } from '@/config/global-variables';
import { debounce } from 'lodash';
import { encodePurchasePrice } from '@/utils/encode-purchase-price';

interface ProductFormProps extends BasicFormProps<ProductModel> {
  isReadOnly?: boolean;
}

export default function ProductForm({
  defaultValues = new ProductModel(),
  isReadOnly = false,
  isLoading = false,
  onSubmit,
  isSubmitSuccessful = false,
}: ProductFormProps) {
  const {
    watch,
    control,
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProductModel>({
    defaultValues,
    resolver: zodResolver(ProductSchema),
  });
  const productType = watch('type');

  useEffect(() => {
    if (defaultValues.id) reset(defaultValues);
  }, [defaultValues, reset]);

  const handlePurchasePriceChange = useCallback(
    debounce(async (amount: number) => {
      const purchasePriceCode = await encodePurchasePrice(amount);
      setValue('purchasePriceCode', purchasePriceCode);
    }, 500),
    []
  );

  return (
    <Card>
      {isLoading ? (
        <Spinner />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='grid sm:grid-cols-4 gap-6 mb-7'>
            <Input
              label={<span className='required'>Nama</span>}
              placeholder='Nama'
              className='sm:col-span-2'
              readOnly={isReadOnly}
              inputClassName={isReadOnly ? readOnlyClass : ''}
              error={errors.name?.message}
              {...register('name')}
            />
            <Controller
              control={control}
              name='type'
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <Select<BasicSelectOptions>
                  value={value}
                  onChange={(option: string) => {
                    onChange(option);
                    setValue('sellingPrice', 0);
                  }}
                  label='Tipe'
                  placeholder='Pilih Tipe Barang'
                  options={productTypeOptions}
                  displayValue={(value) => productTypeOptions.find((option) => option.value === value)?.label ?? ''}
                  getOptionValue={(option) => option.value}
                  error={error?.message}
                  disabled={isReadOnly}
                />
              )}
            />
            <div className='sm:col-span-1'></div>

            <Controller
              control={control}
              name='stock'
              render={({ field: { value }, fieldState: { error } }) => (
                <DecimalFormInput
                  setValue={setValue}
                  label='Stok'
                  fieldName='stock'
                  defaultValue={value}
                  readOnly={true}
                  error={error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name='restockThreshold'
              render={({ field: { value }, fieldState: { error } }) => (
                <DecimalFormInput
                  setValue={setValue}
                  label='Ambang Batas Restok'
                  fieldName='restockThreshold'
                  defaultValue={value}
                  readOnly={isReadOnly}
                  error={error?.message}
                />
              )}
            />
            <Input
              label={<span className='required'>Satuan</span>}
              placeholder='Satuan'
              readOnly={isReadOnly}
              inputClassName={isReadOnly ? readOnlyClass : ''}
              error={errors.uom?.message}
              {...register('uom')}
            />
            <div className='sm:col-span-1'></div>

            <Controller
              control={control}
              name='purchasePrice'
              render={({ field: { value }, fieldState: { error } }) => (
                <RupiahFormInput
                  setValue={setValue}
                  label='Harga Beli'
                  onChange={(amount: number) => handlePurchasePriceChange(amount)}
                  fieldName='purchasePrice'
                  defaultValue={value}
                  readOnly={isReadOnly}
                  error={error?.message}
                />
              )}
            />
            <Input
              label='Kode Harga Beli'
              placeholder='Kode Harga Beli'
              inputClassName={'bg-gray-100'}
              readOnly={true}
              error={errors.purchasePriceCode?.message}
              {...register('purchasePriceCode')}
            />
            {productType === 'Barang Jadi' && (
              <Controller
                control={control}
                name='sellingPrice'
                render={({ field: { value }, fieldState: { error } }) => (
                  <RupiahFormInput
                    setValue={setValue}
                    label='Harga Jual'
                    fieldName='sellingPrice'
                    defaultValue={value}
                    readOnly={isReadOnly}
                    error={error?.message}
                  />
                )}
              />
            )}
            <Controller
              control={control}
              name='costPrice'
              render={({ field: { value }, fieldState: { error } }) => (
                <RupiahFormInput
                  setValue={setValue}
                  label='Harga Modal'
                  fieldName='costPrice'
                  defaultValue={value}
                  readOnly={true}
                  error={error?.message}
                />
              )}
            />
            {productType === 'Material' && <div className='sm:col-span-1'></div>}

            <Textarea
              label='Keterangan'
              placeholder='Keterangan'
              className='sm:col-span-4'
              labelClassName='text-gray-600'
              disabled={isReadOnly}
              error={errors.remarks?.message}
              {...register('remarks')}
            />
          </div>

          {!isReadOnly && (
            <div className='flex justify-end'>
              <Button
                className={cn(baseButtonClass, buttonColorClass.green)}
                type='submit'
                disabled={isSubmitting || isSubmitSuccessful}
              >
                {isSubmitting ? (
                  <Loader variant='spinner' className='me-1.5' />
                ) : (
                  <FaSave className='size-4 me-1.5'></FaSave>
                )}
                <span>Simpan</span>
              </Button>
            </div>
          )}
        </form>
      )}
    </Card>
  );
}
