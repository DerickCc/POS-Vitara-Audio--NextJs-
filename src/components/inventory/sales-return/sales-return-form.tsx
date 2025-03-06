'use client';

import Card from '@/components/card';
import DecimalFormInput from '@/components/form-inputs/decimal-form-input';
import RupiahFormInput from '@/components/form-inputs/rupiah-form-input';
import Spinner from '@/components/spinner';
import { mapTrxStatusToColor } from '@/config/global-variables';
import { BasicFormProps, Colors } from '@/models/global.model';
import {
  SalesReturnProductDetailModel,
  SearchSalesOrderProductDetailModel,
} from '@/models/sales-return-product-detail.model';
import { SalesReturnServiceDetailModel } from '@/models/sales-return-service-detail.model';
import { SalesReturnModel, SalesReturnSchema, SearchSalesOrderModel } from '@/models/sales-return.model';
import { getProductCurrCostPriceById } from '@/services/product-service';
import { searchSo } from '@/services/sales-order-service';
import cn from '@/utils/class-names';
import { isoStringToReadableDate } from '@/utils/helper-function';
import {
  actionIconColorClass,
  badgeColorClass,
  baseBadgeClass,
  baseButtonClass,
  buttonColorClass,
  readOnlyClass,
  tableClass,
} from '@/config/tailwind-classes';
import { zodResolver } from '@hookform/resolvers/zod';
import { debounce } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaRegTrashAlt, FaSave } from 'react-icons/fa';
import { PiInfoBold, PiPlusBold } from 'react-icons/pi';
import { TbTruckReturn } from 'react-icons/tb';
import { ActionIcon, Button, Input, Loader, Select, Textarea, Tooltip } from 'rizzui';

interface SalesReturnFormProps extends BasicFormProps<SalesReturnModel> {
  isReadOnly?: boolean;
}

export default function SalesReturnForm({
  defaultValues = new SalesReturnModel(),
  isReadOnly = false,
  isLoading = false,
  onSubmit,
  isSubmitSuccessful = false,
}: SalesReturnFormProps) {
  const {
    watch,
    register,
    setValue,
    getValues,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SalesReturnModel>({
    defaultValues,
    resolver: isReadOnly ? undefined : zodResolver(SalesReturnSchema),
  });

  const {
    fields: productDetailFields,
    append: appendProductDetail,
    remove: removeProductDetail,
    replace: replaceProductDetail,
  } = useFieldArray({
    control,
    name: 'productDetails',
  });

  const {
    fields: serviceDetailFields,
    append: appendServiceDetail,
    remove: removeServiceDetail,
    replace: replaceServiceDetail,
  } = useFieldArray({
    control,
    name: 'serviceDetails',
  });

  const [trxStatusColor, setTrxStatusColor] = useState<Colors>('blue');

  const [selectedCustomer, setSelectedCustomer] = useState<string>('');

  const [soList, setSoList] = useState<SearchSalesOrderModel[]>([]);
  const [soProductDetailList, setSoProductDetailList] = useState<SearchSalesOrderProductDetailModel[]>([]);
  const [filteredSoProductDetailList, setFilteredSoProductDetailList] = useState<SearchSalesOrderProductDetailModel[]>(
    []
  );

  useEffect(() => {
    if (defaultValues.id) {
      defaultValues.returnDate = isoStringToReadableDate(defaultValues.returnDate);

      setTrxStatusColor(mapTrxStatusToColor[defaultValues.status] as Colors);

      setSelectedCustomer(`${defaultValues.customerName} (${defaultValues.customerLicensePlate})`);

      // set for displaying product name only
      const formatSoProductDetails = defaultValues.productDetails.map((d) => ({
        ...d,
        productStock: 0,
        quantity: 0,
        salesPrice: 0,
        value: d.sopdId,
        label: d.productName,
      })) as SearchSalesOrderProductDetailModel[];
      setSoProductDetailList(formatSoProductDetails);
      // -------

      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  // Sales Order
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSoSearchChange = useCallback(
    debounce(async (code: string) => {
      if (!code || code.trim() === '') return;

      try {
        setSoList(await searchSo(code, 'Selesai'));
      } catch (e) {
        toast.error(e + '', { duration: 5000 });
      }
    }, 500),
    []
  );

  const handleSoChange = (option: SearchSalesOrderModel) => {
    setValue('soCode', option.code);
    setValue('grandTotal', 0);

    setSelectedCustomer(`${option.customerName} (${option.customerLicensePlate})`);
    setSoProductDetailList(option.productDetails);
    setFilteredSoProductDetailList(option.productDetails);

    // clear detail
    replaceProductDetail([]);
    replaceServiceDetail([]);
  };
  // ------------------------

  // transaction Detail
  const filterSelectedSoProductDetails = () => {
    const selectedSoProductDetails = getValues().productDetails;
    setFilteredSoProductDetailList(
      soProductDetailList.filter(
        (sopd) => !selectedSoProductDetails.some((selectedSopd) => sopd.id === selectedSopd.sopdId)
      )
    );
  };

  const handleSrProductDetailChange = async (idx: number, sopd: SearchSalesOrderProductDetailModel) => {
    try {
      const costPrice = (await getProductCurrCostPriceById(sopd.productId)).costPrice;

      setValue(`productDetails.${idx}`, {
        ...getValues().productDetails[idx],
        productName: sopd.productName,
        productStock: sopd.productStock,
        returnPrice: costPrice,
        returnQuantity: 0,
        salesQuantity: sopd.quantity,
        returnedQuantity: sopd.returnedQuantity,
        productUom: sopd.productUom,
        reason: '',
      });

      filterSelectedSoProductDetails();
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  };

  const handleSrProductDetailQtyChange = (idx: number, returnQty: number) => {
    const srpd = getValues().productDetails[idx];
    const returnableQty = srpd.salesQuantity - srpd.returnedQuantity;

    if (returnQty > srpd.productStock) {
      toast.error(
        <>
          Qty retur dari {srpd.productName} melebihi stok barang. <br />
          Stok tersisa: {srpd.productStock}
        </>,
        { duration: 8000 }
      );
      setValue(`productDetails.${idx}.returnQuantity`, srpd.productStock);
    }

    if (returnQty > returnableQty) {
      toast.error(
        <>
          Qty retur dari {srpd.productName} melebihi Qty retur yang diperbolehkan. <br /> <br />
          Qty pembelian: {srpd.salesQuantity} <br />
          Qty yang telah diretur: {srpd.returnedQuantity} <br />
          Qty retur yang diperbolehkan: {srpd.salesQuantity} - {srpd.returnedQuantity} ={' '}
          {srpd.salesQuantity - srpd.returnedQuantity}
        </>,
        { duration: 8000 }
      );
      setValue(`productDetails.${idx}.returnQuantity`, returnableQty);
    }

    updateSrProductDetailTotalPrice(idx);
  };

  const updateSrProductDetailTotalPrice = (idx: number) => {
    const detail = getValues().productDetails[idx];
    const totalPrice = detail.returnPrice * detail.returnQuantity;
    setValue(`productDetails.${idx}.totalPrice`, totalPrice);

    updateGrandTotal();
  };

  const updateGrandTotal = () => {
    const grandTotal = getValues().productDetails.reduce((acc, d) => {
      return acc + d.returnPrice * d.returnQuantity;
    }, 0);
    setValue('grandTotal', grandTotal);
  };

  // ------------------------

  const onError = (errors: any) => {
    if (errors?.refinement) {
      toast.error(errors.refinement.message);
    }
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
            <h5 className='font-medium'>Info Retur Penjualan</h5>
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
                label='Kode Transaksi Penjualan'
                placeholder='Auto Generate'
                inputClassName={readOnlyClass}
                readOnly
                {...register('code')}
              />
              <Input
                label='Tanggal Retur'
                placeholder='Tanggal Retur'
                inputClassName={readOnlyClass}
                readOnly
                {...register('returnDate')}
              />
              <Controller
                control={control}
                name='soId'
                render={({ field: { value, onChange }, fieldState: { error } }) => {
                  const soCode = watch('soCode');
                  return (
                    <Select<SearchSalesOrderModel>
                      value={value}
                      onChange={(option: SearchSalesOrderModel) => {
                        onChange(option.id);
                        handleSoChange(option);
                      }}
                      label={<span className='required'>Transaksi Penjualan</span>}
                      labelClassName='text-gray-600'
                      placeholder='Pilih Transaksi Penjualan'
                      options={soList}
                      displayValue={() => soCode}
                      getOptionValue={(option: SearchSalesOrderModel) => option}
                      searchable={true}
                      onSearchChange={(name: string) => handleSoSearchChange(name)}
                      disableDefaultFilter={true}
                      error={error?.message}
                      disabled={isReadOnly}
                    />
                  );
                }}
              />
              <Input
                label='Pelanggan'
                placeholder='Pelanggan dari transaksi pembelian'
                value={selectedCustomer}
                inputClassName={readOnlyClass}
                readOnly
              />
            </div>
          </>
        )}
      </Card>

      <Card className='px-0 mb-7'>
        <div className='flex items-center mb-5 px-7'>
          <TbTruckReturn className='size-6 mr-2' />
          <h5 className='font-medium'>Detail Barang yang Diretur</h5>
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
                    <th>Barang</th>
                    <th className='w-[180px]'>Harga Retur</th>
                    <th className='w-[100px]'>Qty</th>
                    <th className='w-[130px]'>Satuan</th>
                    <th>Alasan</th>
                    <th className='w-[200px]'>Total</th>
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
                          className={cn(
                            isReadOnly ? actionIconColorClass.gray : actionIconColorClass.red + 'cursor-pointer',
                            'mt-1'
                          )}
                          onClick={() => {
                            removeProductDetail(idx);
                            filterSelectedSoProductDetails();
                          }}
                          disabled={isReadOnly}
                        >
                          <FaRegTrashAlt className='h-4 w-4' />
                        </ActionIcon>
                      </td>
                      <td className='table-cell align-top'>
                        <Controller
                          control={control}
                          name={`productDetails.${idx}.sopdId`}
                          render={({ field: { value, onChange }, fieldState: { error } }) => (
                            <Select<SearchSalesOrderProductDetailModel>
                              value={value}
                              onChange={(option: SearchSalesOrderProductDetailModel) => {
                                onChange(option.id);
                                handleSrProductDetailChange(idx, option);
                              }}
                              placeholder='Pilih Barang'
                              options={filteredSoProductDetailList}
                              displayValue={(value) => {
                                const productName =
                                  soProductDetailList.find((option) => option.value === value)?.label || '';
                                return (
                                  <Tooltip content={productName}>
                                    <span>{productName}</span>
                                  </Tooltip>
                                );
                              }}
                              getOptionValue={(option: SearchSalesOrderProductDetailModel) => option}
                              error={error?.message}
                              disabled={isReadOnly}
                            />
                          )}
                        />
                      </td>
                      <td className='table-cell align-top'>
                        <Controller
                          control={control}
                          name={`productDetails.${idx}.returnPrice`}
                          render={({ field: { value }, fieldState: { error } }) => (
                            <RupiahFormInput
                              setValue={setValue}
                              fieldName={`productDetails.${idx}.returnPrice`}
                              defaultValue={value}
                              error={error?.message}
                              readOnly
                            />
                          )}
                        />
                      </td>
                      <td className='table-cell align-top'>
                        <Controller
                          control={control}
                          name={`productDetails.${idx}.returnQuantity`}
                          render={({ field: { value }, fieldState: { error } }) => {
                            const returnableQty = Math.min(
                              watch(`productDetails.${idx}.salesQuantity`) -
                                watch(`productDetails.${idx}.returnedQuantity`),
                              watch(`productDetails.${idx}.productStock`)
                            );
                            const sopdId = watch(`productDetails.${idx}.sopdId`);

                            return (
                              <DecimalFormInput
                                setValue={setValue}
                                limit={returnableQty}
                                onChange={(qty: number) => handleSrProductDetailQtyChange(idx, qty)}
                                fieldName={`productDetails.${idx}.returnQuantity`}
                                defaultValue={value}
                                error={error?.message}
                                readOnly={isReadOnly || !sopdId}
                              />
                            );
                          }}
                        />
                      </td>
                      <td className='table-cell align-top'>
                        <Input
                          placeholder='Satuan'
                          inputClassName='bg-gray-100/70'
                          readOnly
                          {...register(`productDetails.${idx}.productUom`)}
                        />
                      </td>
                      <td className='table-cell align-top'>
                        <Textarea
                          placeholder='Alasan'
                          rows={2}
                          labelClassName='text-gray-600'
                          error={errors.productDetails && errors.productDetails[idx]?.reason?.message}
                          disabled={isReadOnly}
                          {...register(`productDetails.${idx}.reason`)}
                        />
                      </td>
                      <td className='table-cell align-top'>
                        <Controller
                          control={control}
                          name={`productDetails.${idx}.totalPrice`}
                          render={({ field: { value }, fieldState: { error } }) => (
                            <RupiahFormInput
                              setValue={setValue}
                              fieldName={`productDetails.${idx}.totalPrice`}
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
                          onClick={() => appendProductDetail(new SalesReturnProductDetailModel())}
                        >
                          <PiPlusBold className='h-4 w-4' />
                        </ActionIcon>
                      )}
                    </td>
                    <td className='table-cell text-right' colSpan={5}>
                      <span className='font-semibold'>GRAND TOTAL RETUR</span>
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
          </>
        )}
      </Card>

      <Card className='px-0 mb-7'>
        <div className='flex items-center mb-5 px-7'>
          <TbTruckReturn className='size-6 mr-2' />
          <h5 className='font-medium'>Detail Jasa yang Diretur</h5>
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
                    <th className='w-[480px]'>Jasa</th>
                    <th className='w-[100px]'>Qty</th>
                    <th>Alasan</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceDetailFields.map((field, idx) => (
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
                          onClick={() => removeServiceDetail(idx)}
                          disabled={isReadOnly}
                        >
                          <FaRegTrashAlt className='h-4 w-4' />
                        </ActionIcon>
                      </td>
                      <td className='table-cell align-top'>
                        <Textarea
                          placeholder='Jasa yang diretur'
                          rows={2}
                          labelClassName='text-gray-600'
                          error={errors.serviceDetails && errors.serviceDetails[idx]?.serviceName?.message}
                          disabled={isReadOnly}
                          {...register(`serviceDetails.${idx}.serviceName`)}
                        />
                      </td>
                      <td className='table-cell align-top'>
                        <Controller
                          control={control}
                          name={`serviceDetails.${idx}.returnQuantity`}
                          render={({ field: { value }, fieldState: { error } }) => {
                            return (
                              <DecimalFormInput
                                setValue={setValue}
                                fieldName={`serviceDetails.${idx}.returnQuantity`}
                                defaultValue={value}
                                error={error?.message}
                                readOnly={isReadOnly}
                              />
                            );
                          }}
                        />
                      </td>
                      <td className='table-cell align-top'>
                        <Textarea
                          placeholder='Alasan'
                          rows={2}
                          labelClassName='text-gray-600'
                          error={errors.serviceDetails && errors.serviceDetails[idx]?.reason?.message}
                          disabled={isReadOnly}
                          {...register(`serviceDetails.${idx}.reason`)}
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
                          onClick={() => appendServiceDetail(new SalesReturnServiceDetailModel())}
                        >
                          <PiPlusBold className='h-4 w-4' />
                        </ActionIcon>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      {!isReadOnly && (
        <div className='flex justify-end'>
          <Button
            className={cn(baseButtonClass, buttonColorClass.green)}
            type='submit'
            disabled={isSubmitting || isSubmitSuccessful}
          >
            {isSubmitting ? <Loader variant='spinner' className='me-1.5' /> : <FaSave className='size-4 me-1.5' />}
            <span>Simpan</span>
          </Button>
        </div>
      )}
    </form>
  );
}
