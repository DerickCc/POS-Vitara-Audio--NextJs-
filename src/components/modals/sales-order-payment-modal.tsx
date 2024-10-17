import cn from '@/utils/class-names';
import { baseButtonClass, buttonColorClass } from '@/utils/tailwind-classes';
import { Controller, useForm } from 'react-hook-form';
import { Button, Modal } from 'rizzui';
import RupiahFormInput from '../form-inputs/rupiah-form-input';

interface SalesOrderPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  handlePayment: () => void;
}

export default function SalesOrderPaymentModal({ isOpen, onClose, handlePayment }: SalesOrderPaymentModalProps) {
  const {
    register,
    setValue,
    getValues,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    defaultValues: null,
    resolver: undefined,
  });

  if (!isOpen) return null;

  return (
    <Modal size='lg' isOpen={isOpen} onClose={onClose}>
      <div className='m-auto p-7'>
        <h2 className='mb-8 text-center'>Pembayaran</h2>

        <form onSubmit={handleSubmit(handlePayment)}>
          <div className='grid sm:grid-cols-2 gap-6'>
            <Controller
              control={control}
              name='discount'
              render={({ field: { value } }) => (
                <RupiahFormInput
                  label='Total Diskon'
                  setValue={setValue}
                  fieldName={`discount`}
                  defaultValue={value}
                  readOnly={true}
                />
              )}
            />
            <Controller
              control={control}
              name='discount'
              render={({ field: { value } }) => (
                <RupiahFormInput
                  label='Total Diskon'
                  setValue={setValue}
                  fieldName={`discount`}
                  defaultValue={value}
                  readOnly={true}
                />
              )}
            />
            <Controller
              control={control}
              name='discount'
              render={({ field: { value } }) => (
                <RupiahFormInput
                  label='Total Diskon'
                  setValue={setValue}
                  fieldName={`discount`}
                  defaultValue={value}
                  readOnly={true}
                />
              )}
            />
            <Controller
              control={control}
              name='discount'
              render={({ field: { value } }) => (
                <RupiahFormInput
                  label='Total Diskon'
                  setValue={setValue}
                  fieldName={`discount`}
                  defaultValue={value}
                  readOnly={true}
                />
              )}
            />
            <Controller
              control={control}
              name='discount'
              render={({ field: { value } }) => (
                <RupiahFormInput
                  label='Total Diskon'
                  setValue={setValue}
                  fieldName={`discount`}
                  defaultValue={value}
                  readOnly={true}
                />
              )}
            />
            <Controller
              control={control}
              name='discount'
              render={({ field: { value } }) => (
                <RupiahFormInput
                  label='Total Diskon'
                  setValue={setValue}
                  fieldName={`discount`}
                  defaultValue={value}
                  readOnly={true}
                />
              )}
            />
          </div>

          <div className='flex items-center justify-between mt-8'>
            <Button variant='outline' style={{ width: 75 }} onClick={onClose}>
              Tidak
            </Button>
            <Button className={cn(buttonColorClass.red, baseButtonClass)} style={{ width: 75 }} onClick={handlePayment}>
              Ya
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
