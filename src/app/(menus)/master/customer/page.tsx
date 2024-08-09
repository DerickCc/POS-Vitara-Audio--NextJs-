import Card from "@/components/ui/card";
import PageHeader from "@/components/ui/page-header";
import { routes } from "@/config/routes";
import Link from "next/link";
import { PiArrowLineUpBold, PiFunnel, PiPlusBold } from "react-icons/pi";
import { Button, Input } from "rizzui";

const pageHeader = {
  title: "Pelanggan",
  breadcrumb: [
    {
      name: "Master",
    },
    {
      href: routes.master.customer,
      name: "Pelanggan",
    },
  ],
};

export default function CustomerPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <Button variant="outline" className="w-full sm:w-auto">
            <PiArrowLineUpBold className="me-1.5 h-[17px] w-[17px]" />
            Export
          </Button>
          <Link href={"#"} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
              Tambah
            </Button>
          </Link>
        </div>
      </PageHeader>

      <Card>
        <h4 className="flex items-center font-medium mb-5">
          <PiFunnel className="me-1.5 h-[18px] w-[18px]" />
          Filter
        </h4>

        <div className="grid sm:grid-cols-3 gap-6 mb-5">
          <Input className="" label="Nama" />
          <Input className="" label="No. Plat" />
          <Input className="" label="No. Telepon" />
        </div>

        <Button className="float-right w-20">Cari</Button>
      </Card>

      <table></table>
    </>
  );
}
