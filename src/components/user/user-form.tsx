import { CreateUpdateUserModel } from '@/models/user.model';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { useEffect } from 'react';
import Card from '@/components/card';
import Spinner from '@/components/spinner';
import Link from 'next/link';
import { routes } from '@/config/routes';
import { PiArrowLeftBold } from 'react-icons/pi';
import { Button, Input, Loader, Password, Select } from 'rizzui';
import { FaSave } from 'react-icons/fa';
import { accountStatusOptions, roleOptions } from '@/config/global-variables';
import cn from '@/utils/class-names';
import { baseButtonClass, buttonColorClass } from '@/config/tailwind-classes';
import { BasicFormProps, BasicSelectOptions } from '@/models/global.model';

interface UserFormProps extends BasicFormProps<CreateUpdateUserModel> {
  schema: z.ZodSchema<any>;
}

export default function UserForm({
  defaultValues = new CreateUpdateUserModel(),
  schema,
  isLoading = false,
  onSubmit,
}: UserFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateUpdateUserModel>({
    defaultValues,
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (defaultValues.id) reset(defaultValues);
  }, [defaultValues, reset]);

  return (
    <div className='flex flex-row'>
      <Card className='basis-full md:basis-3/4'>
        {isLoading ? (
          <Spinner />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className='grid md:grid-cols-2 gap-6 mb-7'>
              <Input
                label={<span className='required'>Nama</span>}
                placeholder='Nama'
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                label={<span className='required'>Usernmae</span>}
                placeholder='Username'
                error={errors.username?.message}
                {...register('username')}
              />
              {!defaultValues.id ? (
                // add
                <>
                  <Password
                    label={<span className='required'>Password</span>}
                    placeholder='Password'
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  <Password
                    label={<span className='required'>Konfirmasi Password</span>}
                    placeholder='Konfirmasi Password'
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                  />
                  <Controller
                    control={control}
                    name='accountStatus'
                    render={({ field: { value, onChange } }) => (
                      <Select<BasicSelectOptions>
                        value={value}
                        onChange={onChange}
                        label='Status Akun'
                        placeholder='Pilih Status Akun'
                        options={accountStatusOptions}
                        displayValue={(value) =>
                          accountStatusOptions.find((option) => option.value === value)?.label ?? ''
                        }
                        getOptionValue={(option) => option.value}
                        error={errors.accountStatus?.message}
                      />
                    )}
                  />
                </>
              ) : (
                // edit
                <>
                  <Password
                    label={
                      <span>
                        Password Lama <span className='text-red-500'>*</span>
                      </span>
                    }
                    placeholder='Password Lama'
                    error={errors.oldPassword?.message}
                    {...register('oldPassword')}
                  />
                  <Password
                    label={
                      <span>
                        Password Baru <span className='text-red-500'>*</span>
                      </span>
                    }
                    placeholder='Password Baru'
                    error={errors.newPassword?.message}
                    {...register('newPassword')}
                  />
                </>
              )}
              <Controller
                control={control}
                name='role'
                render={({ field: { value, onChange } }) => (
                  <Select
                    value={value}
                    onChange={onChange}
                    label='Role'
                    placeholder='Pilih Role'
                    options={roleOptions}
                    displayValue={(value) => roleOptions.find((option) => option.value === value)?.label ?? ''}
                    getOptionValue={(option) => option.value}
                    error={errors.role?.message}
                  />
                )}
              />
            </div>

            <div className='flex justify-end'>
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
    </div>
  );
}
