import Card from "@/components/ui/card";
import PageHeader from "@/components/ui/page-header";
import { routes } from "@/config/routes";

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
      <PageHeader
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
      >
      </PageHeader>
    </>
  );
}
