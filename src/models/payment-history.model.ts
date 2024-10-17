export class PaymentHistoryModel {
  id: string;
  soId: string;
  paymentDate: string;
  paymentMethod: string;
  paidAmount: number;

  constructor(data: any = {}) {
    this.id = data.id;
    this.soId = data.soId || '';
    this.paymentDate = data.paymentDate || '';
    this.paymentMethod = data.paymentMethod || 'Non-tunai';
    this.paidAmount = data.paidAmount || 0;
  }
}