import PageHeader from "@/components/ui/page-header"
import { routes } from "@/config/routes"

const pageHeader = {
  title: "Supplier",
  breadcrumb: [
    {
      name: "Master",
    },
    {
      href: routes.master.supplier,
      name: "Supplier",
    },
  ]
}

export default function SupplierPage() {
  return (
    <>
      <PageHeader
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
      >
      </PageHeader>
    </>
  )
}