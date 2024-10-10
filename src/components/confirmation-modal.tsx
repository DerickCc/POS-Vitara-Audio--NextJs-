import { ModalProps } from '@/models/global.model';
import cn from '@/utils/class-names';
import { baseButtonClass, buttonColorClass } from '@/utils/tailwind-classes';
import { Button, Modal } from 'rizzui';

export default function ConfirmationModal({
  isOpen = false,
  size = 'md',
  id,
  title,
  description,
  setModalState,
  handleConfirm,
}: ModalProps) {
  return (
    <Modal isOpen={isOpen} size={size} onClose={() => setModalState(false)}>
      <div className="m-auto p-7">
        <h4>{title}</h4>
        <span>{description}</span>
        <div className='flex items-center justify-between mt-4'>
          <Button className={cn(buttonColorClass.red, baseButtonClass)} onClick={() => handleConfirm(id)}>Ya</Button>
          <Button onClick={() => setModalState(false)} >Tidak</Button>
        </div>
      </div>
    </Modal>
  );
}
