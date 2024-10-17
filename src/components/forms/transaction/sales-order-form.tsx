'use client';

import Card from '@/components/card';
import DecimalFormInput from '@/components/form-inputs/decimal-form-input';
import RupiahFormInput from '@/components/form-inputs/rupiah-form-input';
import RupiahInput from '@/components/inputs/rupiah-input';
import Spinner from '@/components/spinner';
import { routes } from '@/config/routes';
import { useConfirmationModal } from '@/hooks/use-confirmation-modal';
import { SearchCustomerModel } from '@/models/customer.model';
import { BasicFormProps } from '@/models/global.model';
import { SearchProductModel } from '@/models/product.model';
import { SalesOrderModel, SalesOrderSchema } from '@/models/sales-order';
import { SalesOrderProductDetailModel } from '@/models/sales-order-product-detail';
import { SalesOrderServiceDetailModel } from '@/models/sales-order-service-detail';
import { SessionData } from '@/models/session.model';
import { searchCustomer } from '@/services/customer-service';
import { searchProduct } from '@/services/product-service';
import { isoStringToReadableDate } from '@/utils/helper-function';
import { getCurrUser } from '@/utils/sessionlib';
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
import { ActionIcon, Button, Input, Loader, Radio, RadioGroup, Select, Text, Textarea, cn } from 'rizzui';

interface SalesOrderFormProps extends BasicFormProps<SalesOrderModel> {
  isReadOnly?: boolean;
  newSoCode?: string;
}

export default function SalesOrderForm({
  defaultValues = new SalesOrderModel(),
  isReadOnly = false,
  isLoading = false,
  newSoCode = 'Loading...',
  onSubmit,
}: SalesOrderFormProps) {
  const {
    watch,
    register,
    setValue,
    getValues,
    trigger,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SalesOrderModel>({
    defaultValues,
    resolver: isReadOnly ? undefined : zodResolver(SalesOrderSchema),
  });

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

  const [currUser, setCurrUser] = useState<SessionData>(new SessionData());
  const [customerList, setCustomerList] = useState<SearchCustomerModel[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SearchProductModel[]>([]);
  const [productList, setProductList] = useState<SearchProductModel[]>([]);
  const [totalProductSoldAmount, setTotalProductSoldAmount] = useState(0);
  const [totalServiceSoldAmount, setTotalServiceSoldAmount] = useState(0);
  const [noInvoice, setNoInvoice] = useState('');
  const { openConfirmationModal, ConfirmationModalComponent } = useConfirmationModal();

  useEffect(() => {
    const fetchCurrUser = async () => {
      setCurrUser(await getCurrUser());
    };
    fetchCurrUser();
  }, []);

  useEffect(() => {
    setNoInvoice(newSoCode);
  }, [newSoCode]);

  // customer
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
      oriSellingPrice: product.sellingPrice,
      sellingPrice: product.sellingPrice,
      quantity: 0,
      uom: product.uom,
      stock: product.stock,
    });

    filterSelectedProductFromList(productList, idx);

    // updated selected products
    setSelectedProducts((prev) => {
      const updated = [...prev];
      updated[idx] = product;
      return updated;
    });
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

  const handleProductQtyChange = (idx: number, qty: number) => {
    const product = getValues().productDetails[idx];
    if (qty > product.stock) {
      toast.error(`Stok ${product.productName} tidak mencukupi. Tersisa: ${product.stock} ${product.uom}`, {
        duration: 5000,
      });
      setValue(`productDetails.${idx}.quantity`, product.stock);
    }
    updateProductTotalPrice(idx);
  };

  const updateProductTotalPrice = useCallback(
    debounce((idx: number) => {
      const detail = getValues().productDetails[idx];
      setValue(`productDetails.${idx}.totalPrice`, detail.sellingPrice * detail.quantity);

      updateTotalSoldAmount('productDetails', setTotalProductSoldAmount); // update total amount of all sold product
      updateDiscount();
      updateGrandTotal();
    }, 300),
    []
  );
  // ------------------------

  // Service Details
  const updateServiceTotalPrice = useCallback(
    debounce((idx: number) => {
      const detail = getValues().serviceDetails[idx];
      setValue(`serviceDetails.${idx}.totalPrice`, detail.sellingPrice * detail.quantity);

      updateTotalSoldAmount('serviceDetails', setTotalServiceSoldAmount); // update total amount of all sold service
      updateGrandTotal();
    }, 500),
    []
  );
  // ------------------------

  // Invoice, Payment, and Prices
  const handlePaymentTypeChange = () => {
    const formValues = getValues();

    if (formValues.paymentType === 'DP') {
      setValue('paidAmount', 0);
    } else if (formValues.paymentType === 'Lunas') {
      setValue('paidAmount', formValues.grandTotal);
    }
  };

  const handlePaidAmountChange = (paidAmount: number) => {
    const grandTotal = getValues().grandTotal;

    if (paidAmount > grandTotal) {
      setValue('paidAmount', grandTotal);
      setValue('paymentType', 'Lunas');
      trigger('paidAmount');
    }
  };

  const updateTotalSoldAmount = (
    detailsKey: 'productDetails' | 'serviceDetails',
    setAmount: (amount: number) => void
  ) => {
    const totalSoldAmount = getValues()[detailsKey].reduce((acc, d) => acc + d.totalPrice, 0);
    setAmount(totalSoldAmount);

    // update sub total value
    const totalOriProductSoldAmount = getValues().productDetails.reduce((acc, d) => {
      // check if price is getting discount or marked up
      const priceAdjustment = d.sellingPrice - d.oriSellingPrice;

      // if positive (markup), calculate subtotal with that markup price
      if (priceAdjustment > 0) return acc + d.sellingPrice * d.quantity;
      // if 0 or negative (discount), calculate subtotal with that original price so that discount can be calculated
      else return acc + d.oriSellingPrice * d.quantity;
    }, 0);

    if (detailsKey === 'productDetails') {
      setValue('subTotal', totalOriProductSoldAmount + totalServiceSoldAmount);
    } else if (detailsKey === 'serviceDetails') {
      setValue('subTotal', totalOriProductSoldAmount + totalSoldAmount);
    }
  };

  const updateDiscount = () => {
    const totalDiscount = getValues().productDetails.reduce((acc, d) => {
      const discount = (d.oriSellingPrice - d.sellingPrice) * d.quantity;
      if (discount > 0) return acc + discount;
      else return acc;
    }, 0);

    setValue('discount', totalDiscount);
  };

  const updateGrandTotal = () => {
    const formValues = getValues();
    const grandTotal = formValues.subTotal - formValues.discount;

    setValue('grandTotal', grandTotal);

    if (formValues.paymentType === 'Lunas') setValue('paidAmount', grandTotal);
  };
  // ------------------------

  const submitConfirmation = (payload: SalesOrderModel) => {
    openConfirmationModal({
      title: 'Simpan Penjualan',
      description: 'Penjualan yang telah disimpan tidak dapat diedit atau dihapus lagi. Apakah Anda yakin?',
      handleConfirm: () => onSubmit(payload),
    });
  };

  const onError = (errors: any) => {
    if (errors?.refinement) {
      toast.error(errors.refinement.message);
    }
    if (errors?.serviceDetails?.refinement) {
      toast.error(errors.serviceDetails.refinement.message);
    }
    if (errors?.productDetails?.refinement) {
      toast.error(errors.productDetails.refinement.message);
    }
  };

  useEffect(() => {
    if (defaultValues.id) {
      defaultValues.salesDate = isoStringToReadableDate(defaultValues.salesDate);
      setNoInvoice(defaultValues.code);

      setTotalProductSoldAmount(defaultValues.productDetails.reduce((acc, d) => acc + d.totalPrice, 0));

      setTotalServiceSoldAmount(defaultValues.serviceDetails.reduce((acc, d) => acc + d.totalPrice, 0));

      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  return (
    <>
      <ConfirmationModalComponent />

      <form onSubmit={handleSubmit(submitConfirmation, onError)}>
        <div className='grid sm:grid-cols-12 gap-6'>
          <div className='sm:col-span-7'>
            <Card className='mb-7'>
              <div className='flex items-center mb-5'>
                <PiInfoBold className='size-5 mr-2' />
                <h5 className='font-medium'>Info Penjualan</h5>
              </div>
              {isLoading ? (
                <Spinner />
              ) : (
                <>
                  <div className='grid sm:grid-cols-2 gap-6'>
                    <Input
                      label='Kasir'
                      placeholder='Kasir'
                      value={currUser.name}
                      inputClassName={readOnlyClass}
                      readOnly
                    />
                    <Input
                      label='Tanggal Penjualan'
                      placeholder='Tanggal Penjualan'
                      inputClassName={readOnlyClass}
                      readOnly
                      {...register('salesDate')}
                    />
                    <div className='col-span-2'>
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
                    </div>
                    <Textarea
                      label='Keterangan'
                      placeholder='Keterangan'
                      rows={9}
                      maxLength={500}
                      className='sm:col-span-2'
                      labelClassName='text-gray-600'
                      disabled={isReadOnly}
                      {...register('remarks')}
                    />
                  </div>
                </>
              )}
            </Card>
          </div>
          <div className='sm:col-span-5'>
            <Card className='mb-7'>
              {isLoading ? (
                <Spinner />
              ) : (
                <>
                  <Text className='mb-3 text-lg font-medium'>No. Invoice: {noInvoice}</Text>

                  <Controller
                    control={control}
                    name='grandTotal'
                    render={({ field: { value } }) => (
                      <RupiahFormInput
                        className='mb-5 font-bold'
                        inputClassName='text-xl'
                        size='xl'
                        setValue={setValue}
                        fieldName={`grandTotal`}
                        defaultValue={value}
                        readOnly={true}
                      />
                    )}
                  />
                  <hr className='mb-4' />

                  <div className='flex justify-between'>
                    <Controller
                      control={control}
                      name='paymentType'
                      render={({ field: { value, onChange }, fieldState: { error } }) => (
                        <RadioGroup value={value} setValue={onChange} className='mb-6'>
                          <Text className='font-medium mb-2'>Tipe Pembayaran</Text>
                          <div className='flex align-items gap-6'>
                            <Radio
                              name='paymentType'
                              label='DP'
                              value='DP'
                              onChange={() => {
                                onChange('DP');
                                handlePaymentTypeChange();
                              }}
                              size='sm'
                              checked={value === 'DP'}
                              labelClassName='text-sm'
                              error={error?.message}
                              disabled={isReadOnly}
                            />
                            <Radio
                              name='paymentType'
                              label='Lunas'
                              value='Lunas'
                              onChange={() => {
                                onChange('Lunas');
                                handlePaymentTypeChange();
                              }}
                              size='sm'
                              checked={value === 'Lunas'}
                              labelClassName='text-sm'
                              error={error?.message}
                              disabled={isReadOnly}
                            />
                          </div>
                        </RadioGroup>
                      )}
                    />
                    {/* <Controller
                      control={control}
                      name='paymentMethod'
                      render={({ field: { value, onChange }, fieldState: { error } }) => (
                        <RadioGroup value={value} setValue={onChange} className='mb-6'>
                          <Text className='font-medium mb-2'>Metode Pembayaran</Text>
                          <div className='flex align-items gap-6'>
                            <Radio
                              name='paymentMethod'
                              label='Tunai'
                              value='Tunai'
                              onChange={onChange}
                              checked={value === 'Tunai'}
                              size='sm'
                              labelClassName='text-sm'
                              error={error?.message}
                              disabled={isReadOnly}
                            />
                            <Radio
                              name='paymentMethod'
                              label='Non-tunai'
                              value='Non-tunai'
                              onChange={onChange}
                              checked={value === 'Non-tunai'}
                              size='sm'
                              labelClassName='text-sm'
                              error={error?.message}
                              disabled={isReadOnly}
                            />
                          </div>
                        </RadioGroup>
                      )}
                    /> */}
                  </div>
                  <Controller
                    control={control}
                    name='subTotal'
                    render={({ field: { value } }) => (
                      <RupiahFormInput
                        label='Sub Total'
                        className='mb-6'
                        setValue={setValue}
                        fieldName={`subTotal`}
                        defaultValue={value}
                        readOnly={true}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name='discount'
                    render={({ field: { value } }) => (
                      <RupiahFormInput
                        label='Total Diskon'
                        className='mb-6'
                        setValue={setValue}
                        fieldName={`discount`}
                        defaultValue={value}
                        readOnly={true}
                      />
                    )}
                  />
                  {/* <Controller
                    control={control}
                    name='paidAmount'
                    render={({ field: { value }, fieldState: { error } }) => {
                      const grandTotal = watch('grandTotal');
                      return (
                        <RupiahFormInput
                          label={<span className='required'>Jumlah yang Sudah Dibayar</span>}
                          setValue={setValue}
                          onChange={handlePaidAmountChange}
                          fieldName={`paidAmount`}
                          defaultValue={value}
                          error={error?.message}
                          readOnly={isReadOnly || value === grandTotal || grandTotal === 0}
                        />
                      );
                    }}
                  /> */}
                  <Controller
                    control={control}
                    name='paidAmount'
                    render={({ field: { value }, fieldState: { error } }) => {
                      return (
                        <RupiahFormInput
                          label={<span className='required'>Jumlah yang Sudah Dibayar</span>}
                          setValue={setValue}
                          fieldName={`paidAmount`}
                          defaultValue={value}
                          readOnly={true}
                        />
                      );
                    }}
                  />
                </>
              )}
            </Card>
          </div>
        </div>

        {/* product details */}
        {!(isReadOnly && productDetailFields.length === 0) && (
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
                        <th className='w-[70px]' style={{ textAlign: 'center' }}>
                          Aksi
                        </th>
                        <th>Barang</th>
                        <th className='w-[260px]'>Harga Jual</th>
                        <th className='w-[100px]'>Qty</th>
                        <th className='w-[150px]'>Satuan</th>
                        <th className='w-[260px]'>Total</th>
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
                                isReadOnly ? actionIconColorClass.gray : `${actionIconColorClass.red} cursor-pointer`,
                                'mt-1'
                              )}
                              disabled={isReadOnly}
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
                              render={({ field: { value }, fieldState: { error } }) => {
                                const productId = watch(`productDetails.${idx}.productId`);
                                return (
                                  <RupiahFormInput
                                    setValue={setValue}
                                    onChange={() => updateProductTotalPrice(idx)}
                                    fieldName={`productDetails.${idx}.sellingPrice`}
                                    defaultValue={value}
                                    error={error?.message}
                                    readOnly={isReadOnly || !productId}
                                  />
                                );
                              }}
                            />
                          </td>
                          <td className='table-cell align-top'>
                            <Controller
                              control={control}
                              name={`productDetails.${idx}.quantity`}
                              render={({ field: { value }, fieldState: { error } }) => {
                                const stock = watch(`productDetails.${idx}.stock`);
                                const productId = watch(`productDetails.${idx}.productId`);
                                return (
                                  <DecimalFormInput
                                    setValue={setValue}
                                    limit={stock}
                                    onChange={(qty: number) => handleProductQtyChange(idx, qty)}
                                    fieldName={`productDetails.${idx}.quantity`}
                                    defaultValue={value}
                                    error={error?.message}
                                    readOnly={isReadOnly || !productId}
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
                          <RupiahInput onChange={() => {}} defaultValue={totalProductSoldAmount} readOnly={true} />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </Card>
        )}

        {/* service details */}
        {!(isReadOnly && serviceDetailFields.length === 0) && (
          <Card className='px-0 mb-7'>
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
                        <th className='w-[70px]' style={{ textAlign: 'center' }}>
                          Aksi
                        </th>
                        <th>Jasa</th>
                        <th className='w-[260px]'>Harga Jual</th>
                        <th className='w-[100px]'>Qty</th>
                        <th className='w-[260px]'>Total</th>
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
                                isReadOnly ? actionIconColorClass.gray : `${actionIconColorClass.red} cursor-pointer`,
                                'mt-1'
                              )}
                              disabled={isReadOnly}
                              onClick={() => removeServiceDetail(idx)}
                            >
                              <FaRegTrashAlt className='h-4 w-4' />
                            </ActionIcon>
                          </td>
                          <td className='table-cell align-top'>
                            <Controller
                              control={control}
                              name={`serviceDetails.${idx}.serviceName`}
                              render={({ field: { value, onChange }, fieldState: { error } }) => (
                                <Input
                                  placeholder='Nama Jasa'
                                  value={value}
                                  onChange={onChange}
                                  error={error?.message}
                                  inputClassName={cn(isReadOnly ? readOnlyClass : '')}
                                  readOnly={isReadOnly}
                                />
                              )}
                            />
                          </td>
                          <td className='table-cell align-top'>
                            <Controller
                              control={control}
                              name={`serviceDetails.${idx}.sellingPrice`}
                              render={({ field: { value }, fieldState: { error } }) => (
                                <RupiahFormInput
                                  setValue={setValue}
                                  onChange={() => updateServiceTotalPrice(idx)}
                                  fieldName={`serviceDetails.${idx}.sellingPrice`}
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
                              name={`serviceDetails.${idx}.quantity`}
                              render={({ field: { value }, fieldState: { error } }) => (
                                <DecimalFormInput
                                  setValue={setValue}
                                  onChange={() => updateServiceTotalPrice(idx)}
                                  fieldName={`serviceDetails.${idx}.quantity`}
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
                              name={`serviceDetails.${idx}.totalPrice`}
                              render={({ field: { value } }) => (
                                <RupiahFormInput
                                  setValue={setValue}
                                  fieldName={`serviceDetails.${idx}.totalPrice`}
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
                              onClick={() => appendServiceDetail(new SalesOrderServiceDetailModel())}
                            >
                              <PiPlusBold className='h-4 w-4' />
                            </ActionIcon>
                          )}
                        </td>
                        <td className='table-cell text-right' colSpan={3}>
                          <span className='font-semibold'>TOTAL</span>
                        </td>
                        <td className='table-cell'>
                          <RupiahInput onChange={() => {}} defaultValue={totalServiceSoldAmount} readOnly={true} />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </Card>
        )}

        <div className='flex justify-between'>
          <Link href={routes.transaction.salesOrder.data}>
            <Button variant='outline' className='border-2 border-gray-200'>
              <PiArrowLeftBold className='size-4 me-1.5' />
              <span>Kembali</span>
            </Button>
          </Link>

          {!isReadOnly && (
            <Button className={cn(baseButtonClass, buttonColorClass.green)} type='submit' disabled={isSubmitting}>
              {isSubmitting ? <Loader variant='spinner' className='me-1.5' /> : <FaSave className='size-4 me-1.5' />}
              <span>Simpan</span>
            </Button>
          )}
        </div>
      </form>
    </>
  );
}
