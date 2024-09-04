"use client";

import Card from "@/components/ui/card";
import PageHeader from "@/components/ui/page-header";
import Spinner from "@/components/ui/spinner";
import { routes } from "@/config/routes";
import { CustomerModel, CustomerSchema } from "@/models/customer.model";
import { apiFetch } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaSave } from "react-icons/fa";
import { PiArrowLeftBold } from "react-icons/pi";
import { Button, Input, Loader, Textarea } from "rizzui";

const pageHeader = {
  title: "Tambah Pelanggan",
  breadcrumb: [
    {
      name: "Master",
    },
    {
      href: routes.master.customer.data,
      name: "Pelanggan",
    },
    {
      name: "Tambah Pelanggan",
    },
  ],
};

export default function AddCustomer() {
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerModel>({
    defaultValues: new CustomerModel(),
    resolver: zodResolver(CustomerSchema),
  });

  const save = async (data: CustomerModel) => {
    try {
      const response = await apiFetch("/api/customer", {
        method: "POST",
        body: data,
      });

      toast.success(response.message, { duration: 4000 });
      router.push(routes.master.customer.data);
    } catch (e) {
      toast.error(e + "", { duration: 5000 });
    }
  };

  return (
    <>
      <PageHeader
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
      ></PageHeader>

      <Card>
        <form onSubmit={handleSubmit(save)}>
          <div className="grid sm:grid-cols-3 gap-6 mb-7">
            <Input
              label="Nama"
              placeholder="Nama"
              error={errors.name?.message}
              {...register("name")}
            />
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
      </Card>
    </>
  );
}
