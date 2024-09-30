import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import Link from 'next/link';
import { PiPlusBold } from 'react-icons/pi';
import { Button } from 'rizzui';

const pageHeader = {
  title: 'Pembelian',
  breadcrumb: [
    {
      name: 'Transaksi',
    },
    {
      href: routes.transaction.purchaseOrder.data,
      name: 'Pembelian',
    },
  ],
};

export default function PurchaseOrderDataPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <Link href={routes.transaction.purchaseOrder.add} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
              Tambah
            </Button>
          </Link>
        </div>
      </PageHeader>
    </>
  );
}
