import Card from '@/components/card';
import RupiahFormInput from '@/components/form-inputs/rupiah-form-input';
import Spinner from '@/components/spinner';
import { BasicFormProps } from '@/models/global.model';
import { SupplierModel, SupplierSchema } from '@/models/supplier.model';
import cn from '@/utils/class-names';
import { baseButtonClass, buttonColorClass, readOnlyClass } from '@/config/tailwind-classes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FaSave } from 'react-icons/fa';
import { Button, Input, Loader, Textarea } from 'rizzui';

interface SupplierFormProps extends BasicFormProps<SupplierModel> {
  isReadOnly?: boolean;
}

export default function SupplierForm({
  defaultValues = new SupplierModel(),
  isReadOnly = false,
  isLoading = false,
  onSubmit,
  isSubmitSuccessful = false,
}: SupplierFormProps) {
  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SupplierModel>({
    defaultValues,
    resolver: zodResolver(SupplierSchema),
  });

  useEffect(() => {
    if (defaultValues.id) reset(defaultValues); // Update form values when defaultValues change
  }, [defaultValues, reset]);

  return (
    <Card>
      {isLoading ? (
        <Spinner />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='grid sm:grid-cols-3 gap-6 mb-7'>
            <Input
              label={<span className='required'>Nama</span>}
              placeholder='Nama'
              readOnly={isReadOnly}
              inputClassName={isReadOnly ? readOnlyClass : ''}
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label={<span className='required'>PIC</span>}
              placeholder='PIC'
              readOnly={isReadOnly}
              inputClassName={isReadOnly ? readOnlyClass : ''}
              error={errors.pic?.message}
              {...register('pic')}
            />
            <Input
              label='No. Telepon'
              placeholder='No. Telepon'
              readOnly={isReadOnly}
              inputClassName={isReadOnly ? readOnlyClass : ''}
              error={errors.phoneNo?.message}
              {...register('phoneNo')}
            />

            <div className='sm:col-span-3 grid sm:grid-cols-2 gap-6'>
              <Controller
                control={control}
                name='receivables'
                render={({ field: { value }, fieldState: { error } }) => (
                  <RupiahFormInput
                    setValue={setValue}
                    label='Piutang'
                    fieldName='receivables'
                    defaultValue={value}
                    readOnly={true}
                    error={error?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name='receivablesLimit'
                render={({ field: { value }, fieldState: { error } }) => (
                  <RupiahFormInput
                    setValue={setValue}
                    label='Limit Piutang'
                    fieldName='receivablesLimit'
                    defaultValue={value}
                    readOnly={isReadOnly}
                    error={error?.message}
                  />
                )}
              />
            </div>
            <div className='sm:col-span-3 grid sm:grid-cols-2 gap-6'>
              <Textarea
                label='Alamat'
                placeholder='Alamat'
                className='sm:col-span-1'
                disabled={isReadOnly}
                error={errors.address?.message}
                {...register('address')}
              />
              <Textarea
                label='Keterangan'
                placeholder='Keterangan'
                className='sm:col-span-1'
                disabled={isReadOnly}
                error={errors.remarks?.message}
                {...register('remarks')}
              />
            </div>
          </div>

          {!isReadOnly && (
            <div className='flex justify-end'>
              <Button className={cn(baseButtonClass, buttonColorClass.green)} type='submit' disabled={isSubmitting || isSubmitSuccessful}>
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
