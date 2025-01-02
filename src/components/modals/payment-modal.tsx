'use client';

import cn from '@/utils/class-names';
import { baseButtonClass, buttonColorClass, readOnlyClass } from '@/config/tailwind-classes';
import { Controller, useForm } from 'react-hook-form';
import { Button, Input, Loader, Modal, Radio, RadioGroup, Text } from 'rizzui';
import RupiahFormInput from '../form-inputs/rupiah-form-input';
import { PaymentModel, PaymentSchema } from '@/models/payment-history.model';
import RupiahInput from '../inputs/rupiah-input';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { updateSoPayment } from '@/services/sales-order-service';
import { updatePoPayment } from '@/services/purchase-order-service';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: string;
  code: string;
  type: 'po' | 'so' | undefined,
  grandTotal: number;
  paidAmount: number;
  redirectTo?: string; // to redirect
  fetchData: () => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  id,
  code,
  type,
  grandTotal,
  paidAmount,
  redirectTo = '',
  fetchData,
}: PaymentModalProps) {
  const { register, setValue, control, handleSubmit, formState: { isSubmitting } } = useForm<PaymentModel>({
    defaultValues: {
      id,
      code,
      type,
      grandTotal,
      paidAmount,
      paymentAmount: 0,
      paymentMethod: 'Non-tunai',
    },
    resolver: zodResolver(PaymentSchema),
  });

  const router = useRouter();
  const [totalDue, setTotalDue] = useState(0);
  const [unpaidAmount, setUnpaidAmount] = useState(0);

  useEffect(() => {
    if (grandTotal !== 0) {
      setTotalDue(grandTotal - paidAmount);
      setUnpaidAmount(grandTotal - paidAmount);
    }
  }, [grandTotal]);

  const onSubmit = async (data: PaymentModel) => {
    try {
      let message = null;
      if (type === 'po') {
        message = await updatePoPayment(data);
      } else if (type === 'so') {
        message = await updateSoPayment(data);
      }
      console.log(data)
      toast.success(message, { duration: 5000 });
      onClose();

      if (redirectTo) router.push(redirectTo);
      else fetchData();
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  };

  const handlePaymentAmountChange = (amount: number) => {
    if (amount > totalDue) {
      setValue('paymentAmount', totalDue);
      setUnpaidAmount(0);
    } else {
      setUnpaidAmount(totalDue - amount);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal size='lg' isOpen={isOpen} onClose={onClose}>
      <div className='m-auto p-7'>
        <h2 className='mb-8 text-center'>Pembayaran</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='grid sm:grid-cols-2 gap-6'>
            <Input
              label='Kode'
              placeholder='Kode'
              inputClassName={readOnlyClass}
              readOnly
              {...register('code')}
            />
            <Controller
              control={control}
              name='grandTotal'
              render={({ field: { value } }) => (
                <RupiahFormInput
                  label='Grand Total'
                  setValue={setValue}
                  fieldName={`grandTotal`}
                  defaultValue={value}
                  readOnly={true}
                />
              )}
            />
            <Controller
              control={control}
              name='paidAmount'
              render={({ field: { value } }) => (
                <RupiahFormInput
                  label='Jumlah yang Telah Dibayar'
                  setValue={setValue}
                  fieldName={`paidAmount`}
                  defaultValue={value}
                  readOnly={true}
                />
              )}
            />
            <RupiahInput
              label='Jumlah yang Harus Dilunasi'
              defaultValue={totalDue}
              onChange={() => { }}
              readOnly={true}
            />

            <hr className='sm:col-span-2 mt-2' />

            <Controller
              control={control}
              name='paymentAmount'
              render={({ field: { value }, fieldState: { error } }) => (
                <RupiahFormInput
                  label={<span className='required'>Jumlah Pembayaran</span>}
                  setValue={setValue}
                  onChange={(amount: number) => handlePaymentAmountChange(amount)}
                  fieldName={`paymentAmount`}
                  defaultValue={value}
                  error={error?.message}
                />
              )}
            />

            <Controller
              control={control}
              name='paymentMethod'
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <RadioGroup value={value} setValue={onChange}>
                  <Text className='font-medium mb-2 required'>Metode Pembayaran</Text>
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
                    />
                  </div>
                </RadioGroup>
              )}
            />

            <RupiahInput
              label='Sisa yang Harus Dilunasi'
              defaultValue={unpaidAmount}
              onChange={() => { }}
              readOnly={true}
            />
          </div>

          <div className='flex items-center justify-end gap-6 mt-8'>
            <Button variant='outline' style={{ width: 75 }} onClick={onClose}>
              Batal
            </Button>
            <Button className={cn(buttonColorClass.red, baseButtonClass)} style={{ minWidth: 75 }} type='submit' disabled={isSubmitting}>
              {isSubmitting && <Loader variant='spinner' className='me-1.5' />} Bayar
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
