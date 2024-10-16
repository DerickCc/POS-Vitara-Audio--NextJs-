'use client';
import SalesOrderPaymentModal from '@/components/modals/sales-order-payment-modal';
import React, { useState, useCallback } from 'react';

export function useSalesOrderPaymentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [handlePayment, setHandlePayment] = useState<() => void>(() => {});

  const openPaymentModal = useCallback((handlePayment: () => void) => {
    setHandlePayment(handlePayment);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const SalesOrderPaymentModalComponent: React.FC = () => (
    <SalesOrderPaymentModal
      isOpen={isOpen}
      onClose={closeModal}
      handlePayment={() => {
        handlePayment();
        closeModal();
      }}
    />
  );

  return {
    isOpen,
    openPaymentModal,
    closeModal,
    SalesOrderPaymentModalComponent,
  };
}
