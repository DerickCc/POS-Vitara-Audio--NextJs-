import { Popover } from 'rizzui';
import { badgeColorClass, baseBadgeClass } from '@/config/tailwind-classes';
import cn from '@/utils/class-names';
import { Colors } from '@/models/global.model';
import { formatToReadableNumber, isoStringToReadableDate } from '@/utils/helper-function';
import { PurchaseOrderModel } from '@/models/purchase-order.model';
import { SalesOrderModel } from '@/models/sales-order';

type PaymentHistoryPopoverProps = {
  row: PurchaseOrderModel | SalesOrderModel;
  color: Colors;
};

export default function PaymentHistoryPopover({ row, color }: PaymentHistoryPopoverProps) {
  return (
    <Popover enableOverlay>
      <Popover.Trigger>
        <span className={cn(badgeColorClass[color], baseBadgeClass, 'cursor-pointer')}>{row.paymentStatus}</span>
      </Popover.Trigger>
      <Popover.Content className='w-[300px] p-3'>
        <div className='flex flex-col gap-2'>
          {row.paymentHistory.map((payment, i) => (
            <div
              key={i + payment.paymentDate}
              className={cn('flex justify-between', i !== row.paymentHistory.length - 1 && 'border-b-2 pb-2')}
            >
              <div className='flex flex-col'>
                <div className='font-semibold'>{payment.paymentMethod}</div>
                <div>{isoStringToReadableDate(payment.paymentDate)}</div>
              </div>
              <div className='font-semibold'>Rp {formatToReadableNumber(payment.amount)}</div>
            </div>
          ))}
        </div>
      </Popover.Content>
    </Popover>
  );
}
