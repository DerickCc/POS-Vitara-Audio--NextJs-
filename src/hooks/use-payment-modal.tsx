'use client';
import PaymentModal from '@/components/modals/payment-modal';
import React, { useState, useCallback } from 'react';

interface UsePaymentnModalReturnType {
  isOpen: boolean;
  openPaymentModal: (options: PaymentModalOptions) => void;
  closeModal: () => void;
  PaymentModalComponent: React.FC;
}

interface PaymentModalOptions {
  id: string;
  code: string;
  type: 'po' | 'so';
  grandTotal: number;
  paidAmount: number;
  redirectTo?: string | undefined;
  fetchData?: () => void;
}

export function usePaymentModal(): UsePaymentnModalReturnType {
  const [isOpen, setIsOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState<PaymentModalOptions | null>(null);

  const openPaymentModal = useCallback((option: PaymentModalOptions) => {
    setModalOptions(option);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const PaymentModalComponent: React.FC = () => (
    <PaymentModal
      isOpen={isOpen}
      onClose={closeModal}
      id={modalOptions?.id ?? ''}
      code={modalOptions?.code ?? ''}
      type={modalOptions?.type}
      grandTotal={modalOptions?.grandTotal ?? 0}
      paidAmount={modalOptions?.paidAmount ?? 0}
      redirectTo={modalOptions?.redirectTo}
      fetchData={modalOptions?.fetchData ?? (() => {})}
    />
  );

  return {
    isOpen,
    openPaymentModal,
    closeModal,
    PaymentModalComponent,
  };
}
