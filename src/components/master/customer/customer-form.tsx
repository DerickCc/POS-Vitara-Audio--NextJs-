import { CustomerModel, CustomerSchema } from '@/models/customer.model';
import { FaSave } from 'react-icons/fa';
import { Button, Input, Loader, Textarea } from 'rizzui';
import Card from '../../card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import Spinner from '@/components/spinner';
import { BasicFormProps } from '@/models/global.model';
import cn from '@/utils/class-names';
import { baseButtonClass, buttonColorClass, readOnlyClass } from '@/config/tailwind-classes';

interface CustomerFormProps extends BasicFormProps<CustomerModel> {
  isReadOnly?: boolean;
}

export default function CustomerForm({
  defaultValues = new CustomerModel(),
  isReadOnly = false,
  isLoading = false,
  onSubmit,
  isSubmitSuccessful = false,
}: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CustomerModel>({
    defaultValues,
    resolver: zodResolver(CustomerSchema),
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
              label={<span className='required'>No. Plat</span>}
              placeholder='No. Plat'
              readOnly={isReadOnly}
              inputClassName={isReadOnly ? readOnlyClass : ''}
              error={errors.licensePlate?.message}
              {...register('licensePlate')}
            />
            <Input
              label='No. Telepon'
              placeholder='No. Telepon'
              readOnly={isReadOnly}
              inputClassName={isReadOnly ? readOnlyClass : ''}
              error={errors.phoneNo?.message}
              {...register('phoneNo')}
            />
            <Textarea
              label='Alamat'
              placeholder='Alamat'
              className='sm:col-span-3'
              disabled={isReadOnly}
              error={errors.address?.message}
              {...register('address')}
            />
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
