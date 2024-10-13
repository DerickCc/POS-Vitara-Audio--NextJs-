'use client';

import Card from '@/components/card';
import DecimalFormInput from '@/components/form-inputs/decimal-form-input';
import RupiahFormInput from '@/components/form-inputs/rupiah-form-input';
import Spinner from '@/components/spinner';
import { routes } from '@/config/routes';
import { SearchCustomerModel } from '@/models/customer.model';
import { BasicFormProps } from '@/models/global.model';
import { SearchProductModel } from '@/models/product.model';
import { SalesOrderModel, SalesOrderSchema } from '@/models/sales-order';
import { SalesOrderProductDetailModel } from '@/models/sales-order-product-detail';
import { searchCustomer } from '@/services/customer-service';
import { searchProduct } from '@/services/product-service';
import { isoStringToReadableDate } from '@/utils/helper-function';
import {
  actionIconColorClass,
  baseButtonClass,
  buttonColorClass,
  readOnlyClass,
  tableClass,
} from '@/utils/tailwind-classes';
import { zodResolver } from '@hookform/resolvers/zod';
import { debounce } from 'lodash';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaRegTrashAlt, FaSave } from 'react-icons/fa';
import { IoCartOutline } from 'react-icons/io5';
import { PiArrowLeftBold, PiInfoBold, PiPlusBold } from 'react-icons/pi';
import { ActionIcon, Button, Input, Loader, Select, Textarea, cn } from 'rizzui';

interface SalesOrderFormProps extends BasicFormProps<SalesOrderModel> {
  isReadOnly?: boolean;
}

export default function SalesOrderForm({
  defaultValues = new SalesOrderModel(),
  isReadOnly = false,
  isLoading = false,
  onSubmit,
}: SalesOrderFormProps) {
  const {
    watch,
    register,
    setValue,
    getValues,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SalesOrderModel>({
    defaultValues,
    resolver: isReadOnly ? undefined : zodResolver(SalesOrderSchema),
  });

  useEffect(() => {
    if (defaultValues.id) {
      defaultValues.salesDate = isoStringToReadableDate(defaultValues.salesDate);
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const {
    fields: productDetailFields,
    append: appendProductDetail,
    remove: removeProductDetail,
  } = useFieldArray({
    control,
    name: 'productDetails',
  });

  const {
    fields: serviceDetailFields,
    append: appendServiceDetail,
    remove: removeServiceDetail,
  } = useFieldArray({
    control,
    name: 'serviceDetails',
  });

  // customer
  const [customerList, setCustomerList] = useState<SearchCustomerModel[]>([]);

  const handleCustomerSearchChange = useCallback(
    debounce(async (name: string) => {
      if (!name || name.trim() === '') return;

      try {
        setCustomerList(await searchCustomer(name));
      } catch (e) {
        toast.error(e + '', { duration: 5000 });
      }
    }, 500),
    []
  );

  const handleCustomerChange = (customerName: string) => {
    setValue('customerName', customerName);
  };
  // ------------------------

  // product detail
  const [selectedProducts, setSelectedProducts] = useState<SearchProductModel[]>([]);
  const [productList, setProductList] = useState<SearchProductModel[]>([]);

  const filterSelectedProductFromList = (list: SearchProductModel[], idx: number = -1) => {
    const selectedProductIds = getValues().productDetails.map((v) => v.productId);
    const filteredProductList = list.filter((item) => !selectedProductIds.includes(item.id));

    // add back previously selected product
    if (idx >= 0 && selectedProducts[idx]) filteredProductList.unshift(selectedProducts[idx]);

    setProductList(filteredProductList);
  };

  const handleProductChange = (idx: number, product: SearchProductModel) => {
    setValue(`productDetails.${idx}`, {
      ...getValues().productDetails[idx],
      productName: product.name,
      sellingPrice: product.sellingPrice,
      quantity: 0,
      uom: product.uom,
    });

    filterSelectedProductFromList(productList, idx);

    // updated selected products
    const updatedSelectedProducts = [...selectedProducts];
    updatedSelectedProducts[idx] = product;
    setSelectedProducts(updatedSelectedProducts);
  };

  const handleProductSearchChange = useCallback(
    debounce(async (name: string) => {
      // only search if name is not empty
      if (!name || name.trim() === '') return;

      try {
        const result = await searchProduct(name);
        filterSelectedProductFromList(result);
      } catch (e) {
        toast.error(e + '', { duration: 5000 });
      }
    }, 500),
    []
  );

  const updateProductTotalPrice = (idx: number) => {
    const detail = getValues().productDetails[idx];
    const totalPrice = detail.sellingPrice * detail.quantity;
    setValue(`productDetails.${idx}.totalPrice`, totalPrice);

    updateGrandTotal();
  };

  const updateGrandTotal = () => {
    // const grandTotal = getValues().details.reduce((acc, d) => {
    //   return acc + d.purchasePrice * d.quantity;
    // }, 0);
    setValue('grandTotal', 1);
  };
  // ------------------------

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className='mb-7'>
        <div className='flex items-center mb-5'>
          <PiInfoBold className='size-5 mr-2' />
          <h5 className='font-medium'>Info Penjualan</h5>
        </div>
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <div className='grid sm:grid-cols-3 gap-6'>
              <Input
                label='Kode Transaksi Penjualan'
                placeholder='Auto Generate'
                inputClassName={readOnlyClass}
                readOnly
                {...register('code')}
              />
              <Input
                label='Tanggal Penjualan'
                placeholder='Tanggal Penjualan'
                inputClassName={readOnlyClass}
                readOnly
                {...register('salesDate')}
              />
              <Controller
                control={control}
                name='customerId'
                render={({ field: { value, onChange }, fieldState: { error } }) => {
                  const customerName = watch('customerName');
                  return (
                    <Select<SearchCustomerModel>
                      value={value}
                      onChange={(option: SearchCustomerModel) => {
                        onChange(option.id);
                        handleCustomerChange(option.name);
                      }}
                      label={<span className='required'>Pelanggan</span>}
                      labelClassName='text-gray-600'
                      placeholder='Pilih Pelanggan'
                      options={customerList}
                      displayValue={() => customerName}
                      getOptionValue={(option: SearchCustomerModel) => option}
                      searchable={true}
                      searchByKey='name'
                      onSearchChange={(name: string) => handleCustomerSearchChange(name)}
                      disableDefaultFilter={true}
                      error={error?.message}
                      disabled={isReadOnly}
                    />
                  );
                }}
              />
              <Textarea
                label='Keterangan'
                placeholder='Keterangan'
                className='sm:col-span-3'
                labelClassName='text-gray-600'
                disabled={isReadOnly}
                {...register('remarks')}
              />
            </div>
          </>
        )}
      </Card>

      {/* product details */}
      <Card className='px-0 mb-7'>
        <div className='flex items-center mb-5 px-7'>
          <IoCartOutline className='size-6 mr-2' />
          <h5 className='font-medium'>Detail Barang Penjualan</h5>
        </div>

        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <div className='custom-scrollbar w-full max-w-full overflow-x-auto mb-7'>
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th className='w-[70px] table-cell text-center align-middle'>Aksi</th>
                    <th className='w-[300px]'>Barang</th>
                    <th className=''>Harga Jual</th>
                    <th className='w-[100px]'>Qty</th>
                    <th className='w-[150px]'>Satuan</th>
                    <th className=''>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {productDetailFields.map((field, idx) => (
                    <tr key={field.id}>
                      <td className='table-cell text-center align-top'>
                        <ActionIcon
                          size='sm'
                          variant='outline'
                          aria-label='delete'
                          className={cn(actionIconColorClass.red, 'cursor-pointer mt-1')}
                          onClick={() => removeProductDetail(idx)}
                        >
                          <FaRegTrashAlt className='h-4 w-4' />
                        </ActionIcon>
                      </td>
                      <td className='table-cell align-top'>
                        <Controller
                          control={control}
                          name={`productDetails.${idx}.productId`}
                          render={({ field: { value, onChange }, fieldState: { error } }) => {
                            const productName = watch(`productDetails.${idx}.productName`);

                            return (
                              <Select<SearchProductModel>
                                value={value}
                                onChange={(option: SearchProductModel) => {
                                  onChange(option.id);
                                  handleProductChange(idx, option);
                                }}
                                placeholder='Pilih Barang'
                                options={productList}
                                displayValue={() => productName}
                                getOptionValue={(option: SearchProductModel) => option}
                                searchable={true}
                                searchByKey='name'
                                onSearchChange={(name: string) => handleProductSearchChange(name)}
                                disableDefaultFilter={true}
                                error={error?.message}
                                disabled={isReadOnly}
                              />
                            );
                          }}
                        />
                      </td>
                      <td className='table-cell align-top'>
                        <Controller
                          control={control}
                          name={`productDetails.${idx}.sellingPrice`}
                          render={({ field: { value }, fieldState: { error } }) => (
                            <RupiahFormInput
                              setValue={setValue}
                              onChange={() => updateProductTotalPrice(idx)}
                              fieldName={`productDetails.${idx}.sellingPrice`}
                              defaultValue={value}
                              error={error?.message}
                              readOnly={isReadOnly}
                            />
                          )}
                        />
                      </td>
                      <td className='table-cell align-top'>
                        <Controller
                          control={control}
                          name={`productDetails.${idx}.quantity`}
                          render={({ field: { value } }) => (
                            <DecimalFormInput
                              setValue={setValue}
                              onChange={() => updateProductTotalPrice(idx)}
                              fieldName={`productDetails.${idx}.quantity`}
                              defaultValue={value}
                              readOnly={isReadOnly}
                            />
                          )}
                        />
                      </td>
                      <td className='table-cell align-top'>
                        <Input
                          placeholder='Satuan'
                          inputClassName='bg-gray-100/70'
                          readOnly
                          {...register(`productDetails.${idx}.uom`)}
                        />
                      </td>
                      <td className='table-cell align-top'>
                        <Controller
                          control={control}
                          name={`productDetails.${idx}.totalPrice`}
                          render={({ field: { value } }) => (
                            <RupiahFormInput
                              setValue={setValue}
                              fieldName={`productDetails.${idx}.totalPrice`}
                              defaultValue={value}
                              readOnly={true}
                            />
                          )}
                        />
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className='table-cell text-center'>
                      {!isReadOnly && (
                        <ActionIcon
                          size='sm'
                          aria-label='add'
                          className='cursor-pointer'
                          onClick={() => appendProductDetail(new SalesOrderProductDetailModel())}
                        >
                          <PiPlusBold className='h-4 w-4' />
                        </ActionIcon>
                      )}
                    </td>
                    <td className='table-cell text-right' colSpan={4}>
                      <span className='font-semibold'>TOTAL</span>
                    </td>
                    <td className='table-cell'>
                      <RupiahFormInput setValue={setValue} fieldName='grandTotal' defaultValue={1} readOnly={true} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      {/* service details */}
      <Card className='px-0'>
        <div className='flex items-center mb-5 px-7'>
          <IoCartOutline className='size-6 mr-2' />
          <h5 className='font-medium'>Detail Jasa Penjualan</h5>
        </div>

        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <div className='custom-scrollbar w-full max-w-full overflow-x-auto mb-7'>
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th className='w-[70px] table-cell text-center align-middle'>Aksi</th>
                    <th className='w-[300px]'>Barang</th>
                    <th className=''>Harga Jual</th>
                    <th className='w-[100px]'>Qty</th>
                    <th className='w-[150px]'>Satuan</th>
                    <th className=''>Total</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      {/* <div className='sm:col-span-4'>
          <Card>
            No. Invoice: ...
            <hr />
            <div className='flex justify-between'>
              <Link href={routes.transaction.salesOrder.data}>
                <Button variant='outline' className='border-2 border-gray-200'>
                  <PiArrowLeftBold className='size-4 me-1.5' />
                  <span>Kembali</span>
                </Button>
              </Link>

              {!isReadOnly && (
                <Button className={cn(baseButtonClass, buttonColorClass.green)} type='submit' disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader variant='spinner' className='me-1.5' />
                  ) : (
                    <FaSave className='size-4 me-1.5' />
                  )}
                  <span>Simpan</span>
                </Button>
              )}
            </div>
          </Card>
        </div> */}
    </form>
  );
}
