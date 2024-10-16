'use client';
import { useState, useCallback } from 'react';
import ConfirmationModal from '@/components/modals/confirmation-modal';

interface UseConfirmationModalReturnType {
  isOpen: boolean;
  openConfirmationModal: (options: ConfirmationModalOptions) => void;
  closeModal: () => void;
  ConfirmationModalComponent: React.FC;
}

interface ConfirmationModalOptions {
  title: string;
  description: string;
  handleConfirm: () => void;
}

export function useConfirmationModal(): UseConfirmationModalReturnType {
  const [isOpen, setIsOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState<ConfirmationModalOptions | null>(null);

  const openConfirmationModal = useCallback((options: ConfirmationModalOptions) => {
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
      handleConfirm={() => {
        modalOptions?.handleConfirm();
        closeModal();
      }}
    />
  );

  return {
    isOpen,
    openConfirmationModal,
    closeModal,
    ConfirmationModalComponent,
  };
}
