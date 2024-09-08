import { routes } from "@/config/routes";
import { CustomerModel, CustomerSchema } from "@/models/customer.model";
import Link from "next/link";
import { FaSave } from "react-icons/fa";
import { PiArrowLeftBold } from "react-icons/pi";
import { Button, Input, Loader, Textarea } from "rizzui";
import Card from "../../../card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import Spinner from "@/components/spinner";

type CustomerFormProps = {
  defaultValues: CustomerModel;
  isLoading?: boolean;
  onSubmit: (data: CustomerModel) => Promise<void>;
};

export default function CustomerForm({ defaultValues, isLoading = false, onSubmit }: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CustomerModel>({
    defaultValues: defaultValues,
    resolver: zodResolver(CustomerSchema),
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
            <Input
              label="No. Plat"
              placeholder="No. Plat"
              error={errors.licensePlate?.message}
              {...register("licensePlate")}
            />
            <Input
              label="No. Telepon"
              placeholder="No. Telepon"
              error={errors.phoneNo?.message}
              {...register("phoneNo")}
            />
            <Textarea
              label="Alamat"
              placeholder="Alamat"
              className="col-span-3"
              error={errors.address?.message}
              {...register("address")}
            />
          </div>

          <div className="flex justify-between">
            <Link href={routes.master.customer.data}>
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
