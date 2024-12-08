'use client';

import { routes } from '@/config/routes';
import { Colors } from '@/models/global.model';
import { getOverviewMetrics } from '@/services/dashboard-service';
import { formatToReadableNumber } from '@/utils/helper-function';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiMoneyBold, PiPackageDuotone, PiTruckDuotone, PiUsersBold } from 'react-icons/pi';
import { Title } from 'rizzui';
import { OverviewMetricsResult } from '@/models/dashboard.model';
import MetricCard from '@/components/dashboard/metric-card';
import IncompletePaymentTable from '@/components/dashboard/incomplete-payment-table';
import LowStockProductTable from '@/components/dashboard/low-stock-product-table';
import TopProfitGeneratingProductChart from '@/components/dashboard/top-profit-generating-product-chart';

interface OverviewMetricsModel {
  key: keyof OverviewMetricsResult;
  title: string;
  metric: number;
  icon: React.ReactNode;
  iconColor: Colors;
  link: string;
}

const defaultOverviewMetricsData: OverviewMetricsModel[] = [
  {
    key: 'newCustomers',
    title: 'Pelanggan Baru Bulan ini',
    metric: 0,
    icon: <PiUsersBold className='h-6 w-6' />,
    iconColor: 'purple' as Colors,
    link: routes.master.customer.data,
  },
  {
    key: 'newProducts',
    title: 'Barang Baru Bulan ini',
    metric: 0,
    icon: <PiPackageDuotone className='h-6 w-6' />,
    iconColor: 'blue' as Colors,
    link: routes.inventory.product.data,
  },
  {
    key: 'totalSales',
    title: 'Total Penjualan Bulan ini',
    metric: 0,
    icon: <PiMoneyBold className='h-6 w-6' />,
    iconColor: 'green' as Colors,
    link: routes.transaction.salesOrder.data,
  },
  {
    key: 'onGoingPo',
    title: 'Pesanan Sedang Dikirim',
    metric: 0,
    icon: <PiTruckDuotone className='h-6 w-6' />,
    iconColor: 'red' as Colors,
    link: routes.transaction.purchaseOrder.data,
  },
];

export default function DashboardPage() {
  const [overviewMetrics, setOverviewMetrics] = useState<OverviewMetricsModel[]>(defaultOverviewMetricsData);
  const [isOverviewMetricsLoading, setIsOverviewMetricsLoading] = useState(true);

  const fetchOverviewMetrics = async () => {
    try {
      const result = await getOverviewMetrics();

      setOverviewMetrics((prev: any) =>
        prev.map((data: any) => ({
          ...data,
          metric: result[data.key as keyof OverviewMetricsResult] || 0,
        }))
      );
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    } finally {
      setIsOverviewMetricsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewMetrics();
  }, []);

  return (
    <>
      <header className='my-2'>
        <Title className='mb-2 text-[22px] lg:text-2xl'>Dashboard</Title>
      </header>

      <div className='grid gap-6'>
        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {overviewMetrics.map((data: any) => (
            <MetricCard
              key={data.title}
              title={data.title}
              metric={data.key === 'totalSales' ? `Rp. ${formatToReadableNumber(data.metric)}` : data.metric}
              icon={data.icon}
              iconColor={data.iconColor}
              navigateTo={data.link}
              isLoading={isOverviewMetricsLoading}
            />
          ))}
        </div>

        <TopProfitGeneratingProductChart />

        <div className='grid md:grid-cols-5 gap-6'>
          <div className='md:col-span-3'>
            <IncompletePaymentTable />
          </div>
          <div className='md:col-span-2'>
            <LowStockProductTable />
          </div>
        </div>
      </div>
    </>
  );
}
