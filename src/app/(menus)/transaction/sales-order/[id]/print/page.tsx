'use client';

import Card from '@/components/card';
import PrintProductSelectionModal from '@/components/modals/print-product-selection-modal';
import PageHeader from '@/components/page-header';
import Spinner from '@/components/spinner';
import { routes } from '@/config/routes';
import { baseButtonClass, buttonColorClass } from '@/config/tailwind-classes';
import { InvoiceDetailModel, SalesOrderModel } from '@/models/sales-order';
import { SalesOrderServiceDetailModel } from '@/models/sales-order-service-detail';
import { getSoById } from '@/services/sales-order-service';
import cn from '@/utils/class-names';
import { formatToReadableNumber, isoStringToDateWithTime, isoStringToReadableDate } from '@/utils/helper-function';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiArrowLeftBold } from 'react-icons/pi';
import { Button } from 'rizzui';

const pageHeader = {
  title: 'Print Invoice',
  breadcrumb: [
    {
      name: 'Transaksi',
    },
    {
      href: routes.transaction.salesOrder.data,
      name: 'Penjualan',
    },
    {
      name: 'Print Invoice',
    },
  ],
};

export default function PrintSalesOrderPage() {
  const { id } = useParams<{ id: string }>();
  const [so, setSo] = useState<SalesOrderModel>(new SalesOrderModel());
  const [serviceDetails, setServiceDetails] = useState<InvoiceDetailModel[]>([]);
  const [totalServicePrice, setTotalServicePrice] = useState<number>(0);
  const [filteredInvoiceDetails, setFilteredInvoiceDetails] = useState<InvoiceDetailModel[]>([]);
  const [includedProducts, setIncludedProducts] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSo = async () => {
      try {
        setIsLoading(true);
        const res = await getSoById(id);

        if (res.progressStatus === 'Batal') {
          toast.error('Invoice tidak dapat di-print karena telah dibatalkan.');
        } else {
          setSo(res);

          const resIncludedProducts = res.productDetails.reduce((acc, d) => {
            if (d.type === 'Barang Jadi') acc.push(d.productId);
            return acc;
          }, [] as string[]);
          setIncludedProducts(resIncludedProducts);

          let totalPrice = 0;
          const resServiceDetails = res.serviceDetails.reduce((acc, d) => {
            acc.push({
              name: d.serviceName,
              quantity: d.quantity,
              oriSellingPrice: 0,
              sellingPrice: d.sellingPrice,
              totalPrice: d.totalPrice,
            });
            totalPrice += d.totalPrice;
            return acc;
          }, [] as InvoiceDetailModel[]);

          setServiceDetails(resServiceDetails);
          setTotalServicePrice(totalPrice);
        }
      } catch (e) {
        toast.error(e + '', { duration: 5000 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSo();
  }, [id]);

  useEffect(() => {
    if (so) processInvoice(so);
  }, [includedProducts]);

  const processInvoice = (res: SalesOrderModel = so) => {
    const productDetails = res.productDetails.reduce((acc, d) => {
      if (includedProducts.includes(d.productId)) {
        acc.push({
          name: d.productName,
          quantity: d.quantity,
          oriSellingPrice: d.oriSellingPrice,
          sellingPrice: d.sellingPrice,
          totalPrice: d.totalPrice,
        });
      }
      return acc;
    }, [] as InvoiceDetailModel[]);

    setFilteredInvoiceDetails(productDetails.concat(serviceDetails));

    let newSubTotal = totalServicePrice;
    let newDiscount = 0;
    let newGrandTotal = totalServicePrice;

    productDetails.map((d) => {
      newSubTotal += (d.sellingPrice * d.quantity);
      if (d.oriSellingPrice > d.sellingPrice) {
        newDiscount += (d.oriSellingPrice - d.sellingPrice) * d.quantity;
      }
      newGrandTotal += d.totalPrice;
    })

    setSo((prev) => ({
      ...prev,
      subTotal: newSubTotal,
      discount: newDiscount,
      grandTotal: newGrandTotal,
    }));
  };

  return (
    <>
      <PageHeader {...pageHeader}>
        <div className='flex items-center gap-3 mt-4 sm:mt-0'>
          <Link href={routes.transaction.salesOrder.data}>
            <Button variant='outline' className='border-2 border-gray-200'>
              <PiArrowLeftBold className='size-4 me-1.5' />
              <span>Kembali</span>
            </Button>
          </Link>
          <Button
            onClick={() => setIsModalOpen(true)}
            className={cn(baseButtonClass, buttonColorClass.blue)}
            disabled={!so.id}
          >
            Pilih Barang
          </Button>
          <Button
            onClick={() => window.print()}
            className={cn(baseButtonClass, buttonColorClass.purple)}
            disabled={!so.id}
          >
            Print
          </Button>
        </div>
      </PageHeader>

      <Card>
        {isLoading ? (
          <Spinner />
        ) : (
          <div className='print-ref'>
            {/* Invoice Header */}
            <div className='flex justify-between mb-5'>
              <div>
                <h1 className='text-3xl font-bold mb-2'>VITARA AUDIO</h1>
                <p className='mb-1'>Spesial Pemasangan: AC Mobil - Tape Mobil - Variasi</p>
                <p className='mb-1'>Jl. Guru Patimpus No. 11G Medan</p>
                <p className='mb-1'>Telp. 061-4158354 / 4556141 / 0811616989</p>
              </div>

              {/* Customer & Invoice Info */}
              <div className='pr-5'>
                {[
                  { label: 'Kode', value: so.code },
                  { label: 'Pelanggan', value: `${so.customerName} (${so.customerLicensePlate})` },
                  { label: 'Alamat Pelanggan', value: so.customerAddress || '-' },
                  { label: 'No. Telp. Pelanggan', value: so.customerPhoneNo || '-' },
                  { label: 'Tanggal Transaksi', value: isoStringToDateWithTime(so.salesDate) },
                  { label: 'Status Transaksi', value: so.progressStatus },
                ].map((item, index) => (
                  <div key={index} className='flex'>
                    <span className='w-40 font-medium'>{item.label}</span>:&nbsp;<span>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Details */}
            <table className='w-full border border-gray-300 mb-4'>
              <thead>
                <tr className='bg-gray-100 border-b'>
                  <th className='border p-2 text-left'>Banyaknya</th>
                  <th className='border p-2 text-left'>Nama Barang / Jasa</th>
                  <th className='border p-2 text-left'>Harga</th>
                  <th className='border p-2 text-left'>Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoiceDetails.map((item, index) => (
                  <tr key={index} className='border-b'>
                    <td className='border p-2'>{item.quantity}</td>
                    <td className='border p-2'>{item.name}</td>
                    <td className='border p-2'>Rp {formatToReadableNumber(item.sellingPrice)}</td>
                    <td className='border p-2'>Rp {formatToReadableNumber(item.totalPrice)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={3}></td>
                  <td className='border p-2'>Rp {formatToReadableNumber(so.grandTotal)}</td>
                </tr>
              </tbody>
            </table>

            <p>
              <strong>Tanggal Masuk:</strong> {isoStringToReadableDate(so.entryDate)}
            </p>
            <p>
              <strong>Keterangan:</strong> {so.remarks || '-'}
            </p>

            <div className='flex justify-between'>
              {/* Warning */}
              <div>
                <p>
                  <strong>Perhatian:</strong> Barang yang sudah dibeli tidak dapat dikembalikan.
                </p>
              </div>

              {/* Totals */}
              <div className='pr-5'>
                {[
                  { label: 'Sub Total', value: so.subTotal },
                  { label: 'Diskon Total', value: so.discount },
                  { label: 'Grand Total', value: so.grandTotal },
                ].map((item, index) => (
                  <div key={index} className='flex'>
                    <span className='w-28 font-medium'>{item.label}</span> : &nbsp;
                    <span>Rp {formatToReadableNumber(item.value)}</span>
                  </div>
                ))}
                <br />
                <div className='flex'>
                  <span className='w-28 font-medium'>Sudah Dibayar</span> : &nbsp;
                  <span>Rp {formatToReadableNumber(so.paidAmount)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className='mt-4 flex'>
              <div className='text-center'>
                <p className='font-medium'>Tanda Terima</p>
                <div className='flex items-end justify-center mt-16'>
                  <span className='text-lg pr-1'>(</span>
                  <div className='border-b border-gray-500 w-48'></div>
                  <span className='text-lg pl-1'>)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      <PrintProductSelectionModal
        isOpen={isModalOpen}
        includedProducts={includedProducts}
        setIncludedProducts={setIncludedProducts}
        productDetails={so.productDetails}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
