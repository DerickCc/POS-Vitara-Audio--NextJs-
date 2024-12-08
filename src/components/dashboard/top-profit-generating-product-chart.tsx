import { PiMedalDuotone } from 'react-icons/pi';
import Card from '../card';
import SimpleBar from 'simplebar-react';
import { Bar, XAxis, YAxis, Tooltip, CartesianGrid, ComposedChart, ResponsiveContainer, TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { Select, Text } from 'rizzui';
import { useCallback, useEffect, useState } from 'react';
import { TopProfitGeneratingProductModel } from '@/models/dashboard.model';
import { GetTopProfitGeneratingProduct } from '@/services/dashboard-service';
import toast from 'react-hot-toast';
import { formatToReadableNumber } from '@/utils/helper-function';
import { BasicSelectOptions } from '@/models/global.model';
import { topProductLimitOptions, topProductPeriodOptions } from '@/config/global-variables';
import Spinner from '../spinner';

const data = [
  {
    label: 'Barang A',
    sales: 98,
    profit: 80,
    uom: 'mek',
  },
  {
    label: 'Barang B',
    sales: 87,
    profit: 49,
  },
  {
    label: 'Barang C',
    sales: 50,
    profit: 86,
  },
  {
    label: 'Barang D',
    sales: 45,
    profit: 68,
  },
  {
    label: 'Barang E',
    sales: 25,
    profit: 38,
  },
  {
    label: 'Barang F',
    sales: 80,
    profit: 59,
  },
  {
    label: 'Barang G',
    sales: 87,
    profit: 48,
  },
];

export default function TopProfitGeneratingProductChart() {
  const [topProfitGeneratingProducts, setTopProfitGeneratingProducts] = useState<TopProfitGeneratingProductModel[]>([]);
  const [period, setPeriod] = useState<string>('all-time');
  const [limit, setLimit] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTopProfitGeneratingProducts = useCallback(async () => {
    try {
      setIsLoading(true);

      const result = await GetTopProfitGeneratingProduct({ limit, period });

      setTopProfitGeneratingProducts(result);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  }, [period, limit]);

  useEffect(() => {
    fetchTopProfitGeneratingProducts();
  }, [fetchTopProfitGeneratingProducts]);

  return (
    <Card className='px-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center'>
          <PiMedalDuotone className='size-11 sm:size-6 me-2 text-yellow-600' />
          <h5 className='font-medium'>Barang dengan Total Keuntungan Tertinggi</h5>
        </div>
        <div className='flex-col sm:flex-row sm:flex items-center gap-6'>
          <div className='flex items-center gap-2 sm:mb-0 mb-5'>
            <span>Top</span>
            <Select<BasicSelectOptions>
              value={limit}
              onChange={(value: number) => setLimit(value)}
              options={topProductLimitOptions}
              displayValue={(value: number) =>
                topProductLimitOptions.find((option) => option.value === value)?.label ?? ''
              }
              getOptionValue={(option) => option.value}
              clearable={false}
              className='w-16'
            />
          </div>
          <Select<BasicSelectOptions>
            value={period}
            onChange={(value: string) => setPeriod(value)}
            options={topProductPeriodOptions}
            displayValue={(value: string) =>
              topProductPeriodOptions.find((option) => option.value === value)?.label ?? ''
            }
            getOptionValue={(option) => option.value}
            clearable={false}
            className='w-44'
          />
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : topProfitGeneratingProducts.length === 0 ? (
        <div className='my-5 mx-8'>
          <Text className='text-[16px]'>Data tidak tersedia...</Text>
        </div>
      ) : (
        <SimpleBar>
          <div className='h-[24rem] w-full pt-6'>
            <ResponsiveContainer width='100%' height='100%'>
              <ComposedChart data={topProfitGeneratingProducts} margin={{ top: 20, right: 20, left: 40 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey='label' axisLine={true} tickLine={false} />
                <YAxis
                  axisLine={true}
                  tickLine={false}
                  tickFormatter={(label) =>
                    period === 'month' || period === 'day'
                      ? `Rp\u00A0${formatToReadableNumber(label)}`
                      : `Rp\u00A0${formatToReadableNumber(label / 1_000_000)}\u00A0juta`
                  }
                  tickCount={8}
                />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar dataKey='totalProfit' fill='#0047AB' stroke='#003366' barSize={28} radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </SimpleBar>
      )}
    </Card>
  );
}

function CustomTooltip({ label, active, payload }: TooltipProps<ValueType, NameType>) {
  if (!active) return null;

  return (
    <div className='rounded-md border border-gray-300 bg-gray-0 shadow-2xl'>
      <Text className='label mb-0.5 block bg-blue-100 p-2 px-2.5 text-center font-lexend text-xs font-semibold text-gray-600'>
        {label}
      </Text>
      <div className='px-3 py-1 5 text-xs'>
        {payload?.map((item: any, idx: number) => (
          <div key={item.dataKey + idx} className='chart-tooltip-item py-1.5'>
            <div className='mb-1'>
              <Text as='span'>Total Keuntungan:</Text>{' '}
              <Text as='span' className='font-medium text-gray-900'>
                Rp {formatToReadableNumber(item.payload.totalProfit)}
              </Text>
            </div>
            <span>
              (Terjual {formatToReadableNumber(item.payload.itemSold)} {item.payload.uom})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
