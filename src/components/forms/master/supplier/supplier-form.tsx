import Card from "@/components/card";
import ThousandSeparatorFormInput from "@/components/form-inputs/thousand-separator-form-input";
import Spinner from "@/components/spinner";
import { routes } from "@/config/routes";
import { SupplierModel, SupplierSchema } from "@/models/supplier.model";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaSave } from "react-icons/fa";
import { PiArrowLeftBold } from "react-icons/pi";
import { Button, Input, Loader, Textarea } from "rizzui";

type SupplierFormProps = {
  defaultValues: SupplierModel;
  isLoading?: boolean;
  onSubmit: (data: SupplierModel) => Promise<void>;
};

export default function SupplierForm({ defaultValues, isLoading = false, onSubmit }: SupplierFormProps) {
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SupplierModel>({
    defaultValues: defaultValues,
    resolver: zodResolver(SupplierSchema),
  });

  useEffect(() => {
    reset(defaultValues); // Update form values when defaultValues change
  }, [defaultValues, reset]);

  return (
    <Card>
      {isLoading ? (
        <Spinner />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid sm:grid-cols-3 gap-6 mb-7">
            <Input label="Nama" placeholder="Nama" error={errors.name?.message} {...register("name")} />
            <Input label="PIC" placeholder="PIC" error={errors.pic?.message} {...register("pic")} />
            <Input
              label="No. Telepon"
              placeholder="No. Telepon"
              error={errors.phoneNo?.message}
              {...register("phoneNo")}
            />

            <div className="col-span-3 grid sm:grid-cols-2 gap-6">
              <ThousandSeparatorFormInput
                setValue={setValue}
                label="Piutang"
                fieldName="receivablesLimit"
                defaultValue={defaultValues.receivables}
                readOnly={true}
                error={errors.receivables?.message}
              />
              <ThousandSeparatorFormInput
                setValue={setValue}
                label="Limit Piutang"
                fieldName="receivablesLimit"
                defaultValue={defaultValues.receivablesLimit}
                readOnly={false}
                error={errors.receivablesLimit?.message}
              />
            </div>
            <div className="col-span-3 grid sm:grid-cols-2 gap-6">
              <Textarea
                label="Alamat"
                placeholder="Alamat"
                className="sm:col-span-1"
                error={errors.address?.message}
                {...register("address")}
              />
              <Textarea
                label="Keterangan"
                placeholder="Keterangan"
                className="sm:col-span-1"
                error={errors.remarks?.message}
                {...register("remarks")}
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Link href={routes.master.supplier.data}>
              <Button variant="outline" className="border-2 border-gray-200">
                <PiArrowLeftBold className="size-4 me-1.5"></PiArrowLeftBold>
                <span>Kembali</span>
              </Button>
            </Link>

            <Button
              className="bg-green-500 hover:bg-green-700 hover:text-gray-100 disabled:bg-gray-400 disabled:text-gray-200"
              type="submit"
              disabled={isSubmitting}
            >
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
  );
}
