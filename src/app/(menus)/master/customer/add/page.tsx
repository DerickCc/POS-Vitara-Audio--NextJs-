import Card from "@/components/ui/card";
import PageHeader from "@/components/ui/page-header";
import { routes } from "@/config/routes";

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
  return (
    <>
      <PageHeader
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
      ></PageHeader>

      <Card>
        asd
      </Card>
    </>
  );
}
