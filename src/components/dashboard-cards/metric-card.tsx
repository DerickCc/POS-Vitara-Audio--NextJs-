import { badgeColorClass, baseBadgeClass, metricCardClass } from '@/config/tailwind-classes';
import { Colors } from '@/models/global.model';
import cn from '@/utils/class-names';
import Link from 'next/link';
import { Text, Title } from 'rizzui';

interface MetricCardProps {
  title: string;
  metric: React.ReactNode;
  icon: React.ReactNode;
  iconColor: Colors;
  chart?: React.ReactNode;
  navigateTo: string;
  isLoading: boolean;
}

export default function MetricCard({ title, metric, icon, iconColor, chart, navigateTo, isLoading }: MetricCardProps) {
  return (
    <Link href={navigateTo}>
      <div className={metricCardClass}>
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <div
              className={cn(
                baseBadgeClass,
                badgeColorClass[iconColor],
                'me-3.5 flex h-12 w-12 items-center justify-center p-[9px]'
              )}
            >
              {icon}
            </div>
            <div>
              <Text className='mb-1 text-gray-700'>{title}</Text>
              <Title as='h5' className='font-semibold'>
                {isLoading ? 'Loading...' : metric}
              </Title>
            </div>
          </div>
          {chart && <div className='h-12 w-20'>{chart}</div>}
        </div>
      </div>
    </Link>
  );
}
