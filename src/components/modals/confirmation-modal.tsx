import cn from '@/utils/class-names';
import { baseButtonClass, buttonColorClass } from '@/utils/tailwind-classes';
import { Button, Modal } from 'rizzui';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onClose: () => void;
  handleConfirm: () => void;
}

export default function ConfirmationModal({
  isOpen,
  title,
  description,
  onClose,
  handleConfirm,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className='m-auto p-7 text-center'>
        <h2 className='mb-8'>{title}</h2>
        <p className='mb-8' style={{ fontSize: 16 }}>
          {description}
        </p>
        <div className='flex items-center justify-center gap-4'>
          <Button variant='outline' style={{ width: 75 }} onClick={onClose}>
            Tidak
          </Button>
          <Button className={cn(buttonColorClass.red, baseButtonClass)} style={{ width: 75 }} onClick={handleConfirm}>
            Ya
          </Button>
        </div>
      </div>
    </Modal>
  );
}
