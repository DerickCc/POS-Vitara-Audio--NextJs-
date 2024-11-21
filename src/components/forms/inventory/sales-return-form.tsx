'use client';

import Card from "@/components/card";
import Spinner from "@/components/spinner";
import { BasicFormProps } from "@/models/global.model";
import { SalesReturnModel, SalesReturnSchema } from "@/models/sales-return.model";
import { readOnlyClass } from "@/utils/tailwind-classes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { PiInfoBold } from "react-icons/pi";
import { Input } from "rizzui";

interface SalesReturnFormProps extends BasicFormProps<SalesReturnModel> {
  isReadOnly?: boolean;
}

export default function SalesReturnForm({
  defaultValues = new SalesReturnModel(),
  isReadOnly = false,
  isLoading = false,
  onSubmit,
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

  const onError = (errors: any) => {
    if (errors?.details?.refinement) {
      toast.error(errors.details.refinement.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)}>
      <Card className="mb-7">
        <div className="flex items-center mb-5">
          <PiInfoBold className="size-5 mr-2" />
          <h5 className='font-medium'>Info Retur Penjualan</h5>
        </div>
        {
          isLoading ? (
            <Spinner />
          ) : (
            <>
              <div className="grid sm:grid-cols-3 gap-6">
              <Input
                label='Kode Transaksi Penjualan'
                placeholder='Auto Generate'
                inputClassName={readOnlyClass}
                readOnly
                {...register('code')}
              />
              </div>
            </>
          )
        }
      </Card>
    </form>
  )
}