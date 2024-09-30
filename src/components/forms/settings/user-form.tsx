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
import { baseButtonClass, buttonColorClass } from '@/utils/tailwind-classes';

type UserFormProps = {
  defaultValues?: CreateUpdateUserModel;
  schema: z.ZodSchema<any>;
  isLoading?: boolean;
  onSubmit: (data: any) => Promise<void>;
};

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
    <div className="flex flex-row">
      <Card className="basis-full md:basis-3/4">
        {isLoading ? (
          <Spinner />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid md:grid-cols-2 gap-6 mb-7">
              <Input
                label={
                  <span>
                    Nama <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="Nama"
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                label={
                  <span>
                    Usernmae <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="Username"
                error={errors.username?.message}
                {...register('username')}
              />
              {!defaultValues.id ? (
                // add
                <>
                  <Password
                    label={
                      <span>
                        Password <span className="text-red-500">*</span>
                      </span>
                    }
                    placeholder="Password"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  <Password
                    label={
                      <span>
                        Konfirmasi Password <span className="text-red-500">*</span>
                      </span>
                    }
                    placeholder="Konfirmasi Password"
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                  />
                  <Controller
                    control={control}
                    name="accountStatus"
                    render={({ field: { value, onChange } }) => (
                      <Select
                        value={value}
                        onChange={onChange}
                        label="Status Akun"
                        placeholder="Pilih Status Akun"
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
                        Password Lama <span className="text-red-500">*</span>
                      </span>
                    }
                    placeholder="Password Lama"
                    error={errors.oldPassword?.message}
                    {...register('oldPassword')}
                  />
                  <Password
                    label={
                      <span>
                        Password Baru <span className="text-red-500">*</span>
                      </span>
                    }
                    placeholder="Password Baru"
                    error={errors.newPassword?.message}
                    {...register('newPassword')}
                  />
                </>
              )}
              <Controller
                control={control}
                name="role"
                render={({ field: { value, onChange } }) => (
                  <Select
                    value={value}
                    onChange={onChange}
                    label="Role"
                    placeholder="Pilih Role"
                    options={roleOptions}
                    displayValue={(value) => roleOptions.find((option) => option.value === value)?.label ?? ''}
                    getOptionValue={(option) => option.value}
                    error={errors.role?.message}
                  />
                )}
              />
            </div>

            <div className="flex justify-between">
              <Link href={routes.settings.user.data}>
                <Button variant="outline" className="border-2 border-gray-200">
                  <PiArrowLeftBold className="size-4 me-1.5"></PiArrowLeftBold>
                  <span>Kembali</span>
                </Button>
              </Link>

              <Button className={cn(baseButtonClass, buttonColorClass.green)} type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader variant="spinner" className="me-1.5" />
                ) : (
                  <FaSave className="size-4 me-1.5"></FaSave>
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
