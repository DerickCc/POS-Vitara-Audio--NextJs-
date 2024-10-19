'use client';
import SalesOrderPaymentModal from '@/components/modals/sales-order-payment-modal';
import React, { useState, useCallback } from 'react';

interface UseSalesOrderPaymentnModalReturnType {
  isOpen: boolean;
  openPaymentModal: (options: SalesOrderPaymentModalOptions) => void;
  closeModal: () => void;
  SalesOrderPaymentModalComponent: React.FC;
}

interface SalesOrderPaymentModalOptions {
  soId: string;
  soCode: string;
  grandTotal: number;
  paidAmount: number;
  isFromView?: boolean;
}

export function useSalesOrderPaymentModal(): UseSalesOrderPaymentnModalReturnType {
  const [isOpen, setIsOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState<SalesOrderPaymentModalOptions | null>(null);

  const openPaymentModal = useCallback((option: SalesOrderPaymentModalOptions) => {
    setModalOptions(option);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const SalesOrderPaymentModalComponent: React.FC = () => (
    <SalesOrderPaymentModal
      isOpen={isOpen}
      onClose={closeModal}
      soId={modalOptions?.soId ?? ''}
      soCode={modalOptions?.soCode ?? ''}
      grandTotal={modalOptions?.grandTotal ?? 0}
      paidAmount={modalOptions?.paidAmount ?? 0}
      isFromView={modalOptions?.isFromView ?? false}
    />
  );

  return {
    isOpen,
    openPaymentModal,
    closeModal,
    SalesOrderPaymentModalComponent,
  };
}
