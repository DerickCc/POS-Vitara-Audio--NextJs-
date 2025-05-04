import { z } from "zod";

export interface PaymentHistoryModel {
  paymentDate: string;
  paymentMethod: string;
  amount: number;
}

export const PaymentSchema = z.object({
  id: z.string().min(1, { message: 'Id Transaksi tidak boleh kosong' }),
  code: z.string().min(1, { message: 'Kode Transaksi tidak boleh kosong' }),
  type: z
    .string()
    .refine((type) => type === 'so' || type === 'po', { message: 'Tipe transaksi pembayaran tidak valid'}),
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