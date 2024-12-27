'use client';

import Card from '@/components/card';
import PageHeader from '@/components/page-header';
import Spinner from '@/components/spinner';
import { routes } from '@/config/routes';
import { baseButtonClass, buttonColorClass } from '@/config/tailwind-classes';
import { SalesOrderModel } from '@/models/sales-order';
import { getSoById } from '@/services/sales-order-service';
import cn from '@/utils/class-names';
import { formatToReadableNumber, isoStringToDateWithTime } from '@/utils/helper-function';
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPo = async () => {
      try {
        setIsLoading(true);
        setSo(await getSoById(id));
      } catch (e) {
        toast.error(e + '', { duration: 5000 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPo();
  }, [id]);

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
          <Button onClick={() => window.print()} className={cn(baseButtonClass, buttonColorClass.purple)}>
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
            <div className='flex justify-between'>
              <div>
                <h1 className='text-3xl font-bold mb-2'>VITARA AUDIO</h1>
                <p className='mb-1'>Spesial Pemasangan: AC Mobil - Tape Mobil - Variasi</p>
                <p className='mb-1'>Jl. Guru Patimpus No. 11G Medan</p>
                <p className='mb-1'>Telp. 061-4158354 / 4556141 / 0811616989</p>
              </div>

              {/* Customer & Invoice Info */}
              <div className='pr-5 mb-4'>
                {[
                  { label: 'No. Invoice', value: so.code },
                  { label: 'Nama Pelanggan', value: so.customerName },
                  { label: 'Alamat Pelanggan', value: so.customerAddress || '-' },
                  { label: 'No. Telp. Pelanggan', value: so.customerPhoneNo || '-' },
                  { label: 'Tanggal Transaksi', value: isoStringToDateWithTime(so.salesDate) },
                  { label: 'Status Transaksi', value: so.status },
                ].map((item, index) => (
                  <div key={index} className='flex'>
                    <span className='w-40 font-medium'>{item.label}</span>:&nbsp;<span>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <table className='w-full border border-collapse border-gray-300 mb-4'>
              <thead>
                <tr className='bg-gray-100 border-b'>
                  <th className='border p-2 text-left'>Banyaknya</th>
                  <th className='border p-2 text-left'>Nama Barang / Jasa</th>
                  <th className='border p-2 text-left'>Harga</th>
                  <th className='border p-2 text-left'>Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {so.productDetails.map((item, index) => (
                  <tr key={index} className='border-b'>
                    <td className='border p-2'>{item.quantity}</td>
                    <td className='border p-2'>{item.productName}</td>
                    <td className='border p-2'>Rp {formatToReadableNumber(item.sellingPrice)}</td>
                    <td className='border p-2'>Rp {formatToReadableNumber(item.totalPrice)}</td>
                  </tr>
                ))}
                {so.serviceDetails.map((item, index) => (
                  <tr key={index} className='border-b'>
                    <td className='border p-2'>{item.quantity}</td>
                    <td className='border p-2'>{item.serviceName}</td>
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
              <strong>Keterangan:</strong> {so.remarks}
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
    </>
  );
}
