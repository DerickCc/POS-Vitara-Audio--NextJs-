import cn from '@/utils/class-names';
import { baseButtonClass, buttonColorClass } from '@/utils/tailwind-classes';
import { Button, Modal } from 'rizzui';

interface SalesOrderPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  handlePayment: () => void;
}

export default function SalesOrderPaymentModal({
  isOpen,
  onClose,
  handlePayment,
}: SalesOrderPaymentModalProps) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className='m-auto p-7 text-center'>
        <h2 className='mb-8'>Pembayaran</h2>

        <div className='flex items-center justify-center gap-4'>
          <Button className={cn(buttonColorClass.red, baseButtonClass)} style={{ width: 75 }} onClick={handlePayment}>
            Ya
          </Button>
          <Button variant='outline' style={{ width: 75 }} onClick={onClose}>
            Tidak
          </Button>
        </div>
      </div>
    </Modal>
  );
}
