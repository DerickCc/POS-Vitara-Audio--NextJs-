import { routes } from '@/config/routes';
import { CustomerModel, CustomerSchema } from '@/models/customer.model';
import Link from 'next/link';
import { FaSave } from 'react-icons/fa';
import { PiArrowLeftBold } from 'react-icons/pi';
import { Button, Input, Loader, Textarea } from 'rizzui';
import Card from '../../card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import Spinner from '@/components/spinner';
import { BasicFormProps } from '@/models/global.model';
import cn from '@/utils/class-names';
import { baseButtonClass, buttonColorClass } from '@/config/tailwind-classes';

export default function CustomerForm({
  defaultValues = new CustomerModel(),
  isLoading = false,
  onSubmit,
}: BasicFormProps<CustomerModel>) {
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
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label={<span className='required'>No. Plat</span>}
              placeholder='No. Plat'
              error={errors.licensePlate?.message}
              {...register('licensePlate')}
            />
            <Input
              label='No. Telepon'
              placeholder='No. Telepon'
              error={errors.phoneNo?.message}
              {...register('phoneNo')}
            />
            <Textarea
              label='Alamat'
              placeholder='Alamat'
              className='sm:col-span-3'
              error={errors.address?.message}
              {...register('address')}
            />
          </div>

          <div className='flex justify-between'>
            <Link href={routes.master.customer.data}>
              <Button variant='outline' className='border-2 border-gray-200'>
                <PiArrowLeftBold className='size-4 me-1.5'></PiArrowLeftBold>
                <span>Kembali</span>
              </Button>
            </Link>

            <Button className={cn(baseButtonClass, buttonColorClass.green)} type='submit' disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader variant='spinner' className='me-1.5' />
              ) : (
                <FaSave className='size-4 me-1.5'></FaSave>
              )}
              <span>Simpan</span>
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
