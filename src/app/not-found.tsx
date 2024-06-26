import Link from "next/link";
import Image from "next/image";
import NotFoundImg from "@public/not-found.png";
import { Button, Title } from "rizzui";
import { PiHouseLineBold } from "react-icons/pi";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC">
      <div className="sticky top-0 z-40 flex justify-center py-5 backdrop-blur-lg lg:backdrop-blur-none xl:py-10">
        <Link href="/">
          <Title className="mb-8">Vitara Audio</Title>
        </Link>
      </div>

      <div className="mx-auto text-center">
        <Image
          src={NotFoundImg}
          alt="Not Found"
          className="mx-auto mb-8 aspect-[360/326] max-w-[256px] xs:max-w-[370px] lg:mb-12 2xl:mb-16"
        />
        <Title
          as="h1"
          className="text-[22px] font-bold leading-normal text-gray-1000 lg:text-3xl"
        >
          Maaf, halaman tidak ditemukan.
        </Title>

        <Link href="/">
          <Button
            as="span"
            size="xl"
            color="primary"
            className="mt-8 h-12 px-4 xl:h-14 xl:px-6"
          >
            <PiHouseLineBold className="mr-1.5 text-lg" />
            Kembali ke Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
