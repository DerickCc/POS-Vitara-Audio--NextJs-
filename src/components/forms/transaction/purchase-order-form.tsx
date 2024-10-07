'use client';

import Card from '@/components/card';
import Spinner from '@/components/spinner';
import { routes } from '@/config/routes';
import { BasicFormProps } from '@/models/global.model';
import { PurchaseOrderModel, PurchaseOrderSchema } from '@/models/purchase-order.model';
import { SearchSupplierModel } from '@/models/supplier.model';
import { searchSupplier } from '@/services/supplier-service';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaRegTrashAlt, FaSave } from 'react-icons/fa';
import { PiArrowLeftBold, PiInfoBold, PiPlusBold } from 'react-icons/pi';
import { ActionIcon, Button, Input, Loader, Select, Textarea, cn } from 'rizzui';
import { IoCartOutline } from 'react-icons/io5';
import { actionIconColorClass, baseButtonClass, buttonColorClass, tableClass } from '@/utils/tailwind-classes';
import { PurchaseOrderDetailModel } from '@/models/purchase-order-detail.model';
import RupiahFormInput from '@/components/form-inputs/rupiah-form-input';
import DecimalFormInput from '@/components/form-inputs/decimal-form-input';
import { SearchProductModel } from '@/models/product.model';
import { searchProduct } from '@/services/product-service';
import { debounce } from 'lodash';

export default function PurchaseOrderForm({
  defaultValues = new PurchaseOrderModel(),
  isLoading = false,
  onSubmit,
}: BasicFormProps<PurchaseOrderModel>) {
  const {
    watch,
    register,
    setValue,
    getValues,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PurchaseOrderModel>({
    defaultValues,
    resolver: zodResolver(PurchaseOrderSchema),
  });

  const formValues = getValues();

  useEffect(() => {
    if (defaultValues.id) reset(defaultValues);
  }, [defaultValues, reset]);

  const {
    fields: productFields,
    append: appendProduct,
    remove: removeProduct,
  } = useFieldArray({
    control,
    name: 'details',
  });

  // supplier
  const [supplierList, setSupplierList] = useState<SearchSupplierModel[]>([]);

  const handleSupplierSearchChange = useCallback(
    debounce(async (name: string) => {
      if (!name || name.trim() === '') return;

      try {
        setSupplierList(await searchSupplier(name));
      } catch (e) {
        toast.error(e + '', { duration: 5000 });
      }
    }, 500),
    []
  );

  const handleSupplierChange = (supplierName: string) => {
    setValue('supplierName', supplierName);
  };
  // ------------------------

  // transaction detail
  const [productList, setProductList] = useState<SearchProductModel[]>([]);

  const handleProductSearchChange = useCallback(
    debounce(async (name: string) => {
      // only search if name is not empty
      if (!name || name.trim() === '') return;

      try {
        setProductList(await searchProduct(name));
      } catch (e) {
        toast.error(e + '', { duration: 5000 });
      }
    }, 500),
    []
  );

  const handleProductChange = (idx: number, product: SearchProductModel) => {
    setValue(`details.${idx}`, {
      ...formValues.details[idx],
      productName: product.name,
      purchasePrice: product.purchasePrice,
      quantity: 0,
      uom: product.uom,
    });
  };
  // ------------------------

  const updateTotalPrice = (idx: number) => {
    const totalPrice = formValues.details[idx].purchasePrice * formValues.details[idx].quantity;
    setValue(`details.${idx}.totalPrice`, totalPrice);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className='mb-7'>
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <div className='flex items-center mb-5'>
              <PiInfoBold className='size-5 mr-2' />
              <h5 className='font-medium'>Info Pembelian</h5>
            </div>
            <div className='grid sm:grid-cols-3 gap-6'>
              <Input
                label='Kode Transaksi Pembelian'
                placeholder='Auto Generate'
                inputClassName='bg-gray-100/70'
                readOnly
                {...register('code')}
              />
              <Input
                label='Tanggal Pembelian'
                placeholder='Tanggal Pembelian'
                inputClassName='bg-gray-100/70'
                readOnly
                {...register('purchaseDate')}
              />
              <Controller
                control={control}
                name='supplierId'
                render={({ field: { value, onChange }, fieldState: { error } }) => {
                  const supplierName = watch('supplierName');
                  return (
                    <Select<SearchSupplierModel>
                      value={value}
                      onChange={(option: SearchSupplierModel) => {
                        onChange(option.id);
                        handleSupplierChange(option.name);
                      }}
                      label={<span className='required'>Supplier</span>}
                      placeholder='Pilih Supplier'
                      options={supplierList}
                      displayValue={() => supplierName}
                      getOptionValue={(option: SearchSupplierModel) => option}
                      searchable={true}
                      searchByKey='name'
                      onSearchChange={(name: string) => handleSupplierSearchChange(name)}
                      disableDefaultFilter={true}
                      error={error?.message}
                    />
                  );
                }}
              />
              <Textarea label='Keterangan' placeholder='Keterangan' className='sm:col-span-3' />
            </div>
          </>
        )}
      </Card>
      <Card className='px-0'>
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <div className='flex items-center mb-5 px-7'>
              <IoCartOutline className='size-6 mr-2' />
              <h5 className='font-medium'>Detail Barang Pembelian</h5>
            </div>

            <div className='custom-scrollbar w-full max-w-full overflow-x-auto mb-7'>
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th className='w-[70px] flex justify-center'>Aksi</th>
                    <th className='w-[300px]'>Barang</th>
                    <th className=''>Harga Beli</th>
                    <th className='w-[100px]'>Qty</th>
                    <th className='w-[150px]'>Satuan</th>
                    <th className=''>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {productFields.map((field, idx) => (
                    <tr key={field.id}>
                      <td className='table-cell text-center'>
                        <ActionIcon
                          size='sm'
                          variant='outline'
                          aria-label='delete'
                          className={cn(actionIconColorClass.red, 'cursor-pointer')}
                          onClick={() => removeProduct(idx)}
                        >
                          <FaRegTrashAlt className='h-4 w-4' />
                        </ActionIcon>
                      </td>
                      <td>
                        <Controller
                          control={control}
                          name={`details.${idx}.productId`}
                          render={({ field: { value, onChange }, fieldState: { error } }) => (
                            <Select<SearchProductModel>
                              value={value}
                              onChange={(option: SearchProductModel) => {
                                onChange(option.id);
                                handleProductChange(idx, option);
                              }}
                              placeholder='Pilih Barang'
                              options={productList}
                              displayValue={() => formValues.details[idx].productName}
                              getOptionValue={(option: SearchProductModel) => option}
                              searchable={true}
                              searchByKey='name'
                              onSearchChange={(name: string) => handleProductSearchChange(name)}
                              disableDefaultFilter={true}
                              error={error?.message}
                              // error={errors.details ? errors.details[idx]?.purchasePrice?.message : ''}
                            />
                          )}
                        />
                      </td>
                      <td>
                        <Controller
                          control={control}
                          name={`details.${idx}.purchasePrice`}
                          render={({ field: { value, onChange }, fieldState: { error } }) => (
                            <RupiahFormInput
                              setValue={setValue}
                              onChange={() => updateTotalPrice(idx)}
                              fieldName={`details.${idx}.purchasePrice`}
                              defaultValue={value}
                              error={error?.message}
                            />
                          )}
                        />
                      </td>
                      <td>
                        <Controller
                          control={control}
                          name={`details.${idx}.quantity`}
                          render={({ field: { value, onChange }, fieldState: { error } }) => (
                            <DecimalFormInput
                              setValue={setValue}
                              onChange={() => updateTotalPrice(idx)}
                              fieldName={`details.${idx}.quantity`}
                              defaultValue={value}
                              error={error?.message}
                            />
                          )}
                        />
                      </td>
                      <td>
                        <Input
                          placeholder='Satuan'
                          error={errors.details ? errors?.details[idx]?.uom?.message : ''}
                          inputClassName='bg-gray-100/70'
                          readOnly
                          {...register(`details.${idx}.uom`)}
                        />
                      </td>
                      <td>
                        <Controller
                          control={control}
                          name={`details.${idx}.totalPrice`}
                          render={({ field: { value, onChange }, fieldState: { error } }) => (
                            <RupiahFormInput
                              setValue={setValue}
                              fieldName={`details.${idx}.totalPrice`}
                              defaultValue={value}
                              readOnly={true}
                              error={error?.message}
                            />
                          )}
                        />
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className='table-cell text-center'>
                      <ActionIcon
                        size='sm'
                        aria-label='add'
                        className='cursor-pointer'
                        onClick={() => appendProduct(new PurchaseOrderDetailModel())}
                      >
                        <PiPlusBold className='h-4 w-4' />
                      </ActionIcon>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className='flex justify-between px-7'>
              <Link href={routes.transaction.purchaseOrder.data}>
                <Button variant='outline' className='border-2 border-gray-200'>
                  <PiArrowLeftBold className='size-4 me-1.5' />
                  <span>Kembali</span>
                </Button>
              </Link>

              <Button className={cn(baseButtonClass, buttonColorClass.green)} type='submit' disabled={isSubmitting}>
                {isSubmitting ? <Loader variant='spinner' className='me-1.5' /> : <FaSave className='size-4 me-1.5' />}
                <span>Simpan</span>
              </Button>
            </div>
          </>
        )}
      </Card>
    </form>
  );
}
