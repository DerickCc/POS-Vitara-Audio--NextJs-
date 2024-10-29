'use client';

import Card from '@/components/card';
import RupiahFormInput from '@/components/form-inputs/rupiah-form-input';
import Spinner from '@/components/spinner';
import { routes } from '@/config/routes';
import { BasicFormProps, BasicSelectOptions } from '@/models/global.model';
import { PurchaseReturnDetailModel } from '@/models/purchase-return-detail.model';
import { PurchaseReturnModel, PurchaseReturnSchema } from '@/models/purchase-return.model';
import cn from '@/utils/class-names';
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
import { PiArrowLeftBold, PiInfoBold, PiPlusBold } from 'react-icons/pi';
import { ActionIcon, Button, Input, Loader, Select, Textarea } from 'rizzui';
import { TbTruckReturn } from 'react-icons/tb';
import { SearchPurchaseOrderModel } from '@/models/purchase-order.model';
import { searchPo } from '@/services/purchase-order-service';
import { purchaseReturnTypeOptions } from '@/config/global-variables';
import { PurchaseOrderDetailModel, SearchPurchaseOrderDetailModel } from '@/models/purchase-order-detail.model';
import DecimalFormInput from '@/components/form-inputs/decimal-form-input';

interface PurchaseReturnFormProps extends BasicFormProps<PurchaseReturnModel> {
  isReadOnly?: boolean;
}

export default function PurchaseReturnForm({
  defaultValues = new PurchaseReturnModel(),
  isReadOnly = false,
  isLoading = false,
  onSubmit,
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

  useEffect(() => {
    if (defaultValues.id) {
      defaultValues.returnDate = isoStringToReadableDate(defaultValues.returnDate);
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const {
    fields: detailFields,
    append: appendDetail,
    remove: removeDetail,
    replace: replaceDetail,
  } = useFieldArray({
    control,
    name: 'details',
  });

  const [poList, setPoList] = useState<SearchPurchaseOrderModel[]>([]);
  const [selectedPoDetails, setSelectedPoDetails] = useState<SearchPurchaseOrderDetailModel[]>([]);
  const [poDetailList, setPoDetailList] = useState<SearchPurchaseOrderDetailModel[]>([]);
  const [filteredPoDetailList, setFilteredPoDetailList] = useState<SearchPurchaseOrderDetailModel[]>([]);

  //PurchaseOrder
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
  const handlePoDetailChange = (idx: number, pod: SearchPurchaseOrderDetailModel) => {
    setValue(`details.${idx}`, {
      ...getValues().details[idx],
      purchasePrice: pod.purchasePrice,
      returnQuantity: 0,
      productUom: pod.productUom,
      reason: '',
    });

    // Update selectedPoDetails
    const updatedSelectedPoDetails = [...selectedPoDetails];
    updatedSelectedPoDetails[idx] = pod;
    setSelectedPoDetails(updatedSelectedPoDetails)

    setFilteredPoDetailList(
      poDetailList.filter((x) => !selectedPoDetails.some((selectedPod) => x.id === selectedPod.id))
    );
  };

  const updatePrDetailTotalPrice = (idx: number) => {
    const detail = getValues().details[idx];
    const totalPrice = detail.purchasePrice * detail.returnQuantity;
    setValue(`details.${idx}.totalPrice`, totalPrice);

    updateGrandTotal();
  };

  const updateGrandTotal = () => {
    const grandTotal = getValues().details.reduce((acc, d) => {
      return acc + d.purchasePrice * d.returnQuantity;
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
        <div className='flex items-center mb-5'>
          <PiInfoBold className='size-5 mr-2' />
          <h5 className='font-medium'>Info Retur Pembelian</h5>
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
                    options={purchaseReturnTypeOptions}
                    displayValue={(value) =>
                      purchaseReturnTypeOptions.find((option) => option.value === value)?.label ?? ''
                    }
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
                    <th className='w-[250px]'>Barang</th>
                    <th className='w-[200px]'>Harga Beli</th>
                    <th className='w-[100px]'>Qty</th>
                    <th className='w-[150px]'>Satuan</th>
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
                          className={cn(actionIconColorClass.red, 'cursor-pointer mt-1')}
                          onClick={() => removeDetail(idx)}
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
                                handlePoDetailChange(idx, option);
                              }}
                              placeholder='Pilih Barang'
                              options={filteredPoDetailList}
                              displayValue={(value) =>
                                poDetailList.find((option) => option.value === value)?.label ?? ''
                              }
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
                          name={`details.${idx}.purchasePrice`}
                          render={({ field: { value }, fieldState: { error } }) => (
                            <RupiahFormInput
                              setValue={setValue}
                              fieldName={`details.${idx}.purchasePrice`}
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
                          render={({ field: { value }, fieldState: { error } }) => (
                            <DecimalFormInput
                              setValue={setValue}
                              onChange={() => updatePrDetailTotalPrice(idx)}
                              fieldName={`details.${idx}.returnQuantity`}
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

            <div className='flex justify-between px-7'>
              <Link href={routes.inventory.purchaseReturn.data}>
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
