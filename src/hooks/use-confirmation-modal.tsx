'use client';
import { useState, useCallback } from 'react';
import ConfirmationModal from '@/components/confirmation-modal';

interface UseModalReturnType {
  isOpen: boolean;
  openModal: (options: ModalOptions) => void;
  closeModal: () => void;
  ConfirmationModalComponent: React.FC;
}

export interface ModalOptions {
  title: string;
  description: string;
  additionalText?: string;
  handleConfirm: () => void;
}

export function useConfirmationModal(): UseModalReturnType {
  const [isOpen, setIsOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState<ModalOptions | null>(null);

  const openModal = useCallback((options: ModalOptions) => {
    setModalOptions(options);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const ConfirmationModalComponent: React.FC = () => (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={closeModal}
      title={modalOptions?.title ?? ''}
      description={modalOptions?.description ?? ''}
      additionalText={modalOptions?.additionalText ?? ''}
      handleConfirm={() => {
        modalOptions?.handleConfirm();
        closeModal();
      }}
    />
  );

  return {
    isOpen,
    openModal,
    closeModal,
    ConfirmationModalComponent,
  };
}
