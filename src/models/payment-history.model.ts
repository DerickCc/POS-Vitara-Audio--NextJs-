import { z } from "zod";

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

export const PaymentSchema = z.object({
  id: z.string().min(1, { message: 'Id Transaksi tidak boleh kosong' }),
  code: z.string().min(1, { message: 'Kode Transaksi tidak boleh kosong' }),
  paymentMethod: z.string().min(1, { message: 'Mohon memilih metode pembayaran' }),
  paymentAmount: z.coerce.number().min(1, { message: 'Harap mengisi jumlah pembayaran' }),
});

export interface PaymentModel {
  id: string;
  code: string;
  type: 'po' | 'so';
  grandTotal: number;
  paidAmount: number; // total
  paymentAmount: number;
  paymentMethod: string;
}