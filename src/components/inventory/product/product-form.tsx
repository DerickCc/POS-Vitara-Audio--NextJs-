import Card from '@/components/card';
import DecimalFormInput from '@/components/form-inputs/decimal-form-input';
import RupiahFormInput from '@/components/form-inputs/rupiah-form-input';
import Spinner from '@/components/spinner';
import { routes } from '@/config/routes';
import { ProductModel, ProductSchema } from '@/models/product.model';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FaSave } from 'react-icons/fa';
import { PiArrowLeftBold } from 'react-icons/pi';
import { Button, Input, Loader, Textarea } from 'rizzui';
import Image from 'next/image';
import imgPlaceholder from '@public/image-placeholder.png';
import toast from 'react-hot-toast';
import { BasicFormProps } from '@/models/global.model';
import cn from '@/utils/class-names';
import { baseButtonClass, buttonColorClass, readOnlyClass } from '@/config/tailwind-classes';

interface ProductFormProps extends BasicFormProps<ProductModel> {
  isReadOnly?: boolean;
}

export default function ProductForm({
  defaultValues = new ProductModel(),
  isReadOnly = false,
  isLoading = false,
  onSubmit,
}: ProductFormProps) {
  const {
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

  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageClick = () => {
    if (fileInputRef.current && !isReadOnly) fileInputRef.current.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const maxSize = 5 * 1024 * 1024; // 5 MB in bytes

    if (file) {
      if (file.size > maxSize) {
        setFileError('Foto tidak boleh melebihi 5 MB');
        return;
      }

      // create a preview URL for selected file
      const fileUrl = URL.createObjectURL(file);
      setPreviewImg(fileUrl);
      setValue('photo', file.name.replaceAll(' ', '_'));
    }
  };

  const onSubmitHandler = async (data: ProductModel) => {
    // if upload photo and is different from stored photo
    if (data.photo && data.photo !== defaultValues.photo) {
      if (fileInputRef?.current?.files) {
        const formData = new FormData();
        formData.append('photo', fileInputRef?.current?.files[0]);

        // Upload photo
        try {
          const response = await fetch('/api/products/upload-photo', {
            method: 'POST',
            body: formData,
          });

          const result = await response.json();
          if (!response.ok) {
            toast.error('Terjadi Error: ' + result.message, { duration: 5000 });
            return;
          }
        } catch (e) {
          toast.error(e + '', { duration: 5000 });
        }
      }
    }

    await onSubmit(data);
  };

  useEffect(() => {
    if (defaultValues.id) reset(defaultValues); // Update form values when defaultValues change and if have id
    if (defaultValues.photo) setPreviewImg(`/product-photo/${defaultValues.photo}`);
  }, [defaultValues, reset]);

  return (
    <Card>
      {isLoading ? (
        <Spinner />
      ) : (
        <form onSubmit={handleSubmit(onSubmitHandler)}>
          <div className='grid sm:grid-cols-4 gap-6 mb-7'>
            <div className='sm:row-span-4'>
              <label className='font-medium'>Foto Barang</label>
              <input
                id='photo'
                ref={fileInputRef}
                type='file'
                accept='image/png, image/jpeg, image/jpg, image/svg'
                onChange={handleFileChange}
                hidden
              />
              <div className='flex justify-center align-center my-5'>
                <Image
                  id='previewImg'
                  src={previewImg || imgPlaceholder}
                  alt='Foto Barang'
                  width={220}
                  height={220}
                  priority
                  onClick={handleImageClick}
                  className={cn(!isReadOnly && 'cursor-pointer', 'rounded')}
                />
              </div>
              {fileError && <div className='text-center text-red'>{fileError}</div>}
            </div>
            <Input
              label={<span className='required'>Nama</span>}
              placeholder='Nama'
              className='sm:col-span-3'
              readOnly={isReadOnly}
              inputClassName={isReadOnly ? readOnlyClass : ''}
              error={errors.name?.message}
              {...register('name')}
            />
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
            <div className='sm:col-span-3 grid sm:grid-cols-2 gap-6'>
              <Controller
                control={control}
                name='purchasePrice'
                render={({ field: { value }, fieldState: { error } }) => (
                  <RupiahFormInput
                    setValue={setValue}
                    label='Harga Beli'
                    fieldName='purchasePrice'
                    defaultValue={value}
                    readOnly={isReadOnly}
                    error={error?.message}
                  />
                )}
              />
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
            </div>
            <div className='sm:col-span-3 grid sm:grid-cols-2  gap-6'>
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
              <Input
                label='Harga Modal (Kode)'
                placeholder='Kode Modal'
                inputClassName={'bg-gray-100'}
                readOnly={true}
                error={errors.costPriceCode?.message}
                {...register('costPriceCode')}
              />
            </div>

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
              <Button className={cn(baseButtonClass, buttonColorClass.green)} type='submit' disabled={isSubmitting}>
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
