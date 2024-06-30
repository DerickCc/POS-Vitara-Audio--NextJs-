"use client";

import { routes } from "@/config/routes";
import { LoginModel, LoginSchema } from "@/types/login.type";
import { useRouter } from "next/navigation";
import { PiArrowRightBold } from "react-icons/pi";
import { Button, Input, Loader, Password } from "rizzui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

export default function LogInForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginModel>({
    defaultValues: new LoginModel(),
    resolver: zodResolver(LoginSchema),
  });

  async function login(data: LoginModel) {
    try {
      const response = await fetch("api/user/check-credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseJson = await response.json();

      if (!response.ok) {
        console.log(responseJson);
        throw new Error(responseJson.message);
      }

      router.push(routes.dashboard);
    } catch (e) {
      console.log("Error: " + e);
      toast.error(e + ".");
    }
  }

  return (
    <form onSubmit={handleSubmit(login)}>
      <div className="space-y-5">
        <Input
          id="username"
          type="text"
          size="lg"
          label="Username"
          className="[&>label>span]:font-medium"
          inputClassName="text-sm"
          placeholder="Masukkan username Anda"
          error={errors.username?.message}
          {...register("username")}
        />
        <Password
          id="password"
          size="lg"
          label="Password"
          className="pb-2 [&>label>span]:font-medium"
          inputClassName="text-sm"
          placeholder="Masukkan password Anda"
          error={errors.password?.message}
          {...register("password")}
        />

        <Button
          className="w-full"
          type="submit"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader variant="spinner" size="md" className="me-2" />}
          <span>Log in</span>
          <PiArrowRightBold className="ms-2"></PiArrowRightBold>
        </Button>
      </div>
    </form>
  );
}
