'use client';

import Card from '@/components/card';
import RupiahFormInput from '@/components/form-inputs/rupiah-form-input';
import Spinner from '@/components/spinner';
import { BasicFormProps, BasicSelectOptions, Colors } from '@/models/global.model';
import { PurchaseReturnDetailModel } from '@/models/purchase-return-detail.model';
import { PurchaseReturnModel, PurchaseReturnSchema } from '@/models/purchase-return.model';
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
import { ActionIcon, Button, Input, Loader, Select, Textarea, Tooltip } from 'rizzui';
import { TbTruckReturn } from 'react-icons/tb';
import { SearchPurchaseOrderModel } from '@/models/purchase-order.model';
import { searchPo } from '@/services/purchase-order-service';
import { mapTrxStatusToColor, prTypeOptions } from '@/config/global-variables';
import { SearchPurchaseOrderDetailModel } from '@/models/purchase-order-detail.model';
import DecimalFormInput from '@/components/form-inputs/decimal-form-input';

interface PurchaseReturnFormProps extends BasicFormProps<PurchaseReturnModel> {
  isReadOnly?: boolean;
}

export default function PurchaseReturnForm({
  defaultValues = new PurchaseReturnModel(),
  isReadOnly = false,
  isLoading = false,
  onSubmit,
  isSubmitSuccessful = false,
}: PurchaseReturnFormProps) {
  const {
    watch,
    register,
    setValue,
    getValues,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PurchaseReturnModel>({
    defaultValues,
    resolver: isReadOnly ? undefined : zodResolver(PurchaseReturnSchema),
  });

  const {
    fields: detailFields,
    append: appendDetail,
    remove: removeDetail,
    replace: replaceDetail,
  } = useFieldArray({
    control,
    name: 'details',
  });

  const [trxStatusColor, setTrxStatusColor] = useState<Colors>('blue');
  const [poList, setPoList] = useState<SearchPurchaseOrderModel[]>([]);
  const [poDetailList, setPoDetailList] = useState<SearchPurchaseOrderDetailModel[]>([]);
  const [filteredPoDetailList, setFilteredPoDetailList] = useState<SearchPurchaseOrderDetailModel[]>([]);

  useEffect(() => {
    if (defaultValues.id) {
      defaultValues.returnDate = isoStringToReadableDate(defaultValues.returnDate);

      setTrxStatusColor(mapTrxStatusToColor[defaultValues.status] as Colors);

      // set display product name
      const formatPoDetails = defaultValues.details.map((d) => ({
        ...d,
        quantity: 0,
        purchasePrice: d.returnPrice,
        value: d.podId,
        label: d.productName,
      })) as SearchPurchaseOrderDetailModel[];
      setPoDetailList(formatPoDetails);
      // -------

      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  // Purchase Order
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handlePoSearchChange = useCallback(
    debounce(async (code: string) => {
      if (!code || code.trim() === '') return;

      try {
        setPoList(await searchPo(code, 'Selesai'));
      } catch (e) {
        toast.error(e + '', { duration: 5000 });
      }
    }, 500),
    []
  );

  const handlePoChange = (option: SearchPurchaseOrderModel) => {
    setValue('poCode', option.code);
    setValue('supplierName', option.supplierName);
    setValue('grandTotal', 0);

    setPoDetailList(option.details);
    setFilteredPoDetailList(option.details);

    // clear detail
    replaceDetail([]);
  };
  // ------------------------

  // transaction Detail
  const filterSelectedPoDetails = () => {
    const selectedPoDetails = getValues().details;
    setFilteredPoDetailList(
      poDetailList.filter((pod) => !selectedPoDetails.some((selectedPod) => pod.id === selectedPod.podId))
    );
  };

  const handlePrDetailChange = (idx: number, pod: SearchPurchaseOrderDetailModel) => {
    setValue(`details.${idx}`, {
      ...getValues().details[idx],
      productName: pod.productName,
      returnPrice: pod.purchasePrice,
      returnQuantity: 0,
      purchaseQuantity: pod.quantity,
      returnedQuantity: pod.returnedQuantity,
      productUom: pod.productUom,
      reason: '',
    });

    filterSelectedPoDetails();
  };

  const handlePrDetailQtyChange = (idx: number, returnQty: number) => {
    const prd = getValues().details[idx];
    const returnableQty = prd.purchaseQuantity - prd.returnedQuantity;
    if (returnQty > returnableQty) {
      toast.error(
        <>
          Qty retur dari {prd.productName} melebihi Qty retur yang diperbolehkan. <br /> <br />
          Qty pembelian: {prd.purchaseQuantity} <br />
          Qty yang telah diretur: {prd.returnedQuantity} <br />
          Qty retur yang diperbolehkan: {prd.purchaseQuantity} - {prd.returnedQuantity} ={' '}
          {prd.purchaseQuantity - prd.returnedQuantity}
        </>,
        {
          duration: 8000,
        }
      );
      setValue(`details.${idx}.returnQuantity`, returnableQty);
    }

    updatePrDetailTotalPrice(idx);
  };

  const handleRemovePrDetail = (idx: number) => {
    removeDetail(idx);
    filterSelectedPoDetails();
    updateGrandTotal();
  };

  const updatePrDetailTotalPrice = (idx: number) => {
    const detail = getValues().details[idx];
    const totalPrice = detail.returnPrice * detail.returnQuantity;
    setValue(`details.${idx}.totalPrice`, totalPrice);

    updateGrandTotal();
  };

  const updateGrandTotal = () => {
    const grandTotal = getValues().details.reduce((acc, d) => {
      return acc + d.returnPrice * d.returnQuantity;
    }, 0);
    setValue('grandTotal', grandTotal);
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
            <h5 className='font-medium'>Info Retur Pembelian</h5>
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
                label='Kode Retur Pembelian'
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
              <div></div>
              <Controller
                control={control}
                name='poId'
                render={({ field: { value, onChange }, fieldState: { error } }) => {
                  const poCode = watch('poCode');
                  return (
                    <Select<SearchPurchaseOrderModel>
                      value={value}
                      onChange={(option: SearchPurchaseOrderModel) => {
                        onChange(option.id);
                        handlePoChange(option);
                      }}
                      label={<span className='required'>Transaksi Pembelian</span>}
                      labelClassName='text-gray-600'
                      placeholder='Pilih Transaksi Pembelian'
                      options={poList}
                      displayValue={() => poCode}
                      getOptionValue={(option: SearchPurchaseOrderModel) => option}
                      searchable={true}
                      searchByKey='name'
                      onSearchChange={(name: string) => handlePoSearchChange(name)}
                      disableDefaultFilter={true}
                      error={error?.message}
                      disabled={isReadOnly}
                    />
                  );
                }}
              />
              <Input
                label='Supplier'
                placeholder='Supplier dari transaksi pembelian'
                inputClassName={readOnlyClass}
                readOnly
                {...register('supplierName')}
              />
              <Controller
                control={control}
                name='returnType'
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                  <Select<BasicSelectOptions>
                    value={value}
                    onChange={onChange}
                    label={<span className='required'>Tipe Retur</span>}
                    labelClassName='text-gray-600'
                    placeholder='Pilih Tipe Retur'
                    options={prTypeOptions}
                    displayValue={(value) => prTypeOptions.find((option) => option.value === value)?.label ?? ''}
                    getOptionValue={(option) => option.value}
                    error={error?.message}
                    disabled={isReadOnly}
                  />
                )}
              />
            </div>
          </>
        )}
      </Card>

      <Card className='px-0'>
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
                          onClick={() => handleRemovePrDetail(idx)}
                          disabled={isReadOnly}
                        >
                          <FaRegTrashAlt className='h-4 w-4' />
                        </ActionIcon>
                      </td>
                      <td className='table-cell align-top'>
                        <Controller
                          control={control}
                          name={`details.${idx}.podId`}
                          render={({ field: { value, onChange }, fieldState: { error } }) => (
                            <Select<SearchPurchaseOrderDetailModel>
                              value={value}
                              onChange={(option: SearchPurchaseOrderDetailModel) => {
                                onChange(option.id);
                                handlePrDetailChange(idx, option);
                              }}
                              placeholder='Pilih Barang'
                              options={filteredPoDetailList}
                              displayValue={(value) => {
                                const productName = poDetailList.find((option) => option.value === value)?.label || '';
                                return (
                                  <Tooltip content={productName}>
                                    <span>{productName}</span>
                                  </Tooltip>
                                );
                              }}
                              getOptionValue={(option: SearchPurchaseOrderDetailModel) => option}
                              error={error?.message}
                              disabled={isReadOnly}
                            />
                          )}
                        />
                      </td>
                      <td className='table-cell align-top'>
                        <Controller
                          control={control}
                          name={`details.${idx}.returnPrice`}
                          render={({ field: { value }, fieldState: { error } }) => (
                            <RupiahFormInput
                              setValue={setValue}
                              fieldName={`details.${idx}.returnPrice`}
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
                          name={`details.${idx}.returnQuantity`}
                          render={({ field: { value }, fieldState: { error } }) => {
                            const returnableQty =
                              watch(`details.${idx}.purchaseQuantity`) - watch(`details.${idx}.returnedQuantity`);
                            const podId = watch(`details.${idx}.podId`);

                            return (
                              <DecimalFormInput
                                setValue={setValue}
                                limit={returnableQty}
                                onChange={(qty: number) => handlePrDetailQtyChange(idx, qty)}
                                fieldName={`details.${idx}.returnQuantity`}
                                defaultValue={value}
                                error={error?.message}
                                readOnly={isReadOnly || !podId}
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
                          {...register(`details.${idx}.productUom`)}
                        />
                      </td>
                      <td className='table-cell align-top'>
                        <Textarea
                          placeholder='Alasan'
                          rows={2}
                          labelClassName='text-gray-600'
                          error={errors.details && errors.details[idx]?.reason?.message}
                          disabled={isReadOnly}
                          {...register(`details.${idx}.reason`)}
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
                          onClick={() => appendDetail(new PurchaseReturnDetailModel())}
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

            {!isReadOnly && (
              <div className='flex justify-end px-7'>
                <Button
                  className={cn(baseButtonClass, buttonColorClass.green)}
                  type='submit'
                  disabled={isSubmitting || isSubmitSuccessful}
                >
                  {isSubmitting ? (
                    <Loader variant='spinner' className='me-1.5' />
                  ) : (
                    <FaSave className='size-4 me-1.5' />
                  )}
                  <span>Simpan</span>
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </form>
  );
}
