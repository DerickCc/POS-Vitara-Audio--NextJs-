import { Title } from "rizzui";
import LogInForm from "./login-form";
import Image from "next/image";
import blackCar from '@public/black-car.jpg';

export default function LogIn() {
  return (
    <div className="min-h-screen bg-[#FEFEFE] justify-between gap-x-8 px-4 py-8 pt-10 md:pt-12 lg:flex lg:p-6 xl:gap-x-10 xl:p-7 2xl:p-10 2xl:pt-10 [&>div]:min-h-[calc(100vh-80px)]">
      <div className="relative flex w-full items-center justify-center">
        {/* left */}
        <div className="hidden items-center justify-center bg-gray-50 me-20 lg:flex">
          <div className="relative mx-auto aspect-[1.8] w-[500px] xl:w-[720px]">
            <Image src={blackCar} alt="Mobil" priority width={720} />
          </div>
        </div>

        {/* right */}
        <div className="w-full max-w-sm md:max-w-md lg:py-7 lg:ps-3">
          <div className="mb-7 lg:mb-8">
            <Title
              as="h2"
              className="text-[26px] md:text-3xl lg:text-[28px] xl:text-4xl"
            >
              POS Vitara Audio
            </Title>
          </div>
          <LogInForm />
        </div>
      </div>
    </div>
  );
}
