'use client';

import Card from '@/components/card';
import Spinner from '@/components/spinner';
import { routes } from '@/config/routes';
import { BasicFormProps, Colors } from '@/models/global.model';
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
import {
  actionIconColorClass,
  badgeColorClass,
  baseBadgeClass,
  baseButtonClass,
  buttonColorClass,
  readOnlyClass,
  tableClass,
} from '@/config/tailwind-classes';
import { PurchaseOrderDetailModel } from '@/models/purchase-order-detail.model';
import RupiahFormInput from '@/components/form-inputs/rupiah-form-input';
import DecimalFormInput from '@/components/form-inputs/decimal-form-input';
import { SearchProductModel } from '@/models/product.model';
import { searchProduct } from '@/services/product-service';
import { debounce } from 'lodash';
import { formatToCurrency, isoStringToReadableDate } from '@/utils/helper-function';
import { mapTrxStatusToColor } from '@/config/global-variables';

interface PurchaseOrderFormProps extends BasicFormProps<PurchaseOrderModel> {
  isReadOnly?: boolean;
}

export default function PurchaseOrderForm({
  defaultValues = new PurchaseOrderModel(),
  isReadOnly = false,
  isLoading = false,
  onSubmit,
}: PurchaseOrderFormProps) {
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
    resolver: isReadOnly ? undefined : zodResolver(PurchaseOrderSchema),
  });

  const {
    fields: detailFields,
    append: appendDetail,
    remove: removeDetail,
  } = useFieldArray({
    control,
    name: 'details',
  });

  const [trxStatusColor, setTrxStatusColor] = useState<Colors>('blue');
  const [supplierList, setSupplierList] = useState<SearchSupplierModel[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SearchProductModel[]>([]);
  const [productList, setProductList] = useState<SearchProductModel[]>([]);

  const supplierReceivables = watch('supplierReceivable');
  const subTotal = watch('subTotal');
  const appliedReceivables = watch('appliedReceivables');
  const [appliedReceivablesLimit, setAppliedReceivablesLimit] = useState(0);

  useEffect(() => {
    if (defaultValues.id) {
      defaultValues.purchaseDate = isoStringToReadableDate(defaultValues.purchaseDate);
      defaultValues.supplierReceivable += defaultValues.appliedReceivables;

      setTrxStatusColor(mapTrxStatusToColor[defaultValues.status] as Colors);

      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  useEffect(() => {
    const limit = Math.min(supplierReceivables, subTotal);
    setAppliedReceivablesLimit(limit);

    if (appliedReceivables > subTotal) setValue('appliedReceivables', subTotal);

    setValue('grandTotal', subTotal - appliedReceivables);
  }, [supplierReceivables, subTotal, appliedReceivables]);

  //supplier
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleSupplierChange = (option: SearchSupplierModel) => {
    setValue('supplierName', option.name);
    setValue('supplierReceivable', option.receivables);
    setValue('appliedReceivables', 0);
  };
  // ------------------------

  // transaction detail
  const filterSelectedProductFromList = (list: SearchProductModel[], idx: number = -1) => {
    const selectedProductIds = getValues().details.map((v) => v.productId);
    const filteredProductList = list.filter((item) => !selectedProductIds.includes(item.id));

    // add back previously selected product
    if (idx >= 0 && selectedProducts[idx]) filteredProductList.unshift(selectedProducts[idx]);
    setProductList(filteredProductList);
  };

  const handleProductChange = (idx: number, product: SearchProductModel) => {
    setValue(`details.${idx}`, {
      ...getValues().details[idx],
      productName: product.name,
      purchasePrice: product.purchasePrice,
      quantity: 0,
      uom: product.uom,
    });

    filterSelectedProductFromList(productList, idx);

    // updated selected products
    setSelectedProducts((prev) => {
      const updated = [...prev];
      updated[idx] = product;
      return updated;
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const detail = getValues().details[idx];
    const totalPrice = detail.purchasePrice * detail.quantity;
    setValue(`details.${idx}.totalPrice`, totalPrice);

    updateSubTotal();
  };

  const updateSubTotal = () => {
    const subTotal = getValues().details.reduce((acc, d) => {
      return acc + d.purchasePrice * d.quantity;
    }, 0);
    setValue('subTotal', subTotal);
  };
  // ------------------------

  const onError = (errors: any) => {
    if (errors?.details?.refinement) {
      toast.error(errors.details.refinement.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)}>
      <Card className='mb-7'>
        <div className='flex items-center justify-between mb-5'>
          <div className='flex items-center'>
            <PiInfoBold className='size-5 mr-2' />
            <h5 className='font-medium'>Info Pembelian</h5>
          </div>
          {defaultValues.id && (
            <span className={cn(badgeColorClass[trxStatusColor], baseBadgeClass)}>{defaultValues.status}</span>
          )}
        </div>
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <div className='grid sm:grid-cols-3 gap-6'>
              <Input
                label='Kode Transaksi Pembelian'
                placeholder='Auto Generate'
                inputClassName={readOnlyClass}
                readOnly
                {...register('code')}
              />
              <Input
                label='Tanggal Pembelian'
                placeholder='Tanggal Pembelian'
                inputClassName={readOnlyClass}
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
                        handleSupplierChange(option);
                      }}
                      label={<span className='required'>Supplier</span>}
                      labelClassName='text-gray-600'
                      placeholder='Pilih Supplier'
                      options={supplierList}
                      displayValue={() => supplierName}
                      getOptionValue={(option: SearchSupplierModel) => option}
                      searchable={true}
                      searchByKey='name'
                      onSearchChange={(name: string) => handleSupplierSearchChange(name)}
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

      <Card className='px-0'>
        <div className='flex items-center mb-5 px-7'>
          <IoCartOutline className='size-6 mr-2' />
          <h5 className='font-medium'>Detail Barang Pembelian</h5>
        </div>

        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <div className='custom-scrollbar w-full max-w-full overflow-x-auto mb-7'>
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th className='w-[70px]' style={{ textAlign: 'center' }}>
                      Aksi
                    </th>
                    <th className='w-[300px]'>Barang</th>
                    <th className=''>Harga Beli</th>
                    <th className='w-[100px]'>Qty</th>
                    <th className='w-[150px]'>Satuan</th>
                    <th className=''>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {detailFields.map((field, idx) => (
                    <tr key={field.id}>
                      <td className='table-cell text-center align-top'>
                        <ActionIcon
                          size='sm'
                          variant='outline'
                          aria-label='delete'
                          className={cn(
                            isReadOnly ? actionIconColorClass.gray : actionIconColorClass.red + 'cursor-pointer',
                            'mt-1'
                          )}
                          onClick={() => removeDetail(idx)}
                          disabled={isReadOnly}
                        >
                          <FaRegTrashAlt className='h-4 w-4' />
                        </ActionIcon>
                      </td>
                      <td className='table-cell align-top'>
                        <Controller
                          control={control}
                          name={`details.${idx}.productId`}
                          render={({ field: { value, onChange }, fieldState: { error } }) => {
                            const productName = watch(`details.${idx}.productName`);

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
                          name={`details.${idx}.purchasePrice`}
                          render={({ field: { value }, fieldState: { error } }) => (
                            <RupiahFormInput
                              setValue={setValue}
                              onChange={() => updateProductTotalPrice(idx)}
                              fieldName={`details.${idx}.purchasePrice`}
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
                          name={`details.${idx}.quantity`}
                          render={({ field: { value }, fieldState: { error } }) => (
                            <DecimalFormInput
                              setValue={setValue}
                              onChange={() => updateProductTotalPrice(idx)}
                              fieldName={`details.${idx}.quantity`}
                              defaultValue={value}
                              error={error?.message}
                              readOnly={isReadOnly}
                            />
                          )}
                        />
                      </td>
                      <td className='table-cell align-top'>
                        <Input
                          placeholder='Satuan'
                          error={errors.details ? errors?.details[idx]?.uom?.message : ''}
                          inputClassName='bg-gray-100/70'
                          readOnly
                          {...register(`details.${idx}.uom`)}
                        />
                      </td>
                      <td className='table-cell align-top'>
                        <Controller
                          control={control}
                          name={`details.${idx}.totalPrice`}
                          render={({ field: { value }, fieldState: { error } }) => (
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
                      {!isReadOnly && (
                        <ActionIcon
                          size='sm'
                          aria-label='add'
                          className='cursor-pointer'
                          onClick={() => appendDetail(new PurchaseOrderDetailModel())}
                        >
                          <PiPlusBold className='h-4 w-4' />
                        </ActionIcon>
                      )}
                    </td>
                    <td className='table-cell text-right' colSpan={4}>
                      {!isReadOnly && (
                        <>
                          <span>Piutang Supplier: Rp. {formatToCurrency(supplierReceivables)}</span>
                          <span className='mx-3'>|</span>
                        </>
                      )}
                      <span className='font-semibold'>POTONG PIUTANG</span>
                    </td>
                    <td className='table-cell'>
                      <Controller
                        control={control}
                        name='appliedReceivables'
                        render={({ field: { value } }) => (
                          <RupiahFormInput
                            setValue={setValue}
                            fieldName='appliedReceivables'
                            defaultValue={value}
                            limit={appliedReceivablesLimit}
                            readOnly={isReadOnly}
                          />
                        )}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className='table-cell text-right' colSpan={5}>
                      <span className='font-semibold'>GRAND TOTAL</span>
                    </td>
                    <td className='table-cell'>
                      <Controller
                        control={control}
                        name='grandTotal'
                        render={({ field: { value } }) => (
                          <RupiahFormInput
                            setValue={setValue}
                            fieldName='grandTotal'
                            defaultValue={value}
                            readOnly={true}
                          />
                        )}
                      />
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
          </>
        )}
      </Card>
    </form>
  );
}
