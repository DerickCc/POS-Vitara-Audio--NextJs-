import { z } from 'zod';

export const PurchaseReturnDetailSchema = z.object({
  id: z.string().optional().nullable(),
  podId: z.string().min(1, { message: 'Mohon memilih barang yang diretur' }),
  returnQuantity: z.coerce.number().min(1, { message: 'Qty minimal harus 1' }),
  purchasePrice: z.coerce.number().min(0, { message: 'Harga beli tidak boleh negatif' }),
  reason: z.string().max(500, { message: 'Alasan tidak boleh lebih dari 500 huruf' }).optional().nullable(),
});

export class PurchaseReturnDetailModel {
  id: string;
  prId: string;
  podId: string;
  returnQuantity: number;
  reason: string;

  constructor(data: any = {}) {
    this.id = data.id;
    this.prId = data.prId || '';
    this.podId = data.podId || '';
    this.returnQuantity = data.returnQuantity || 0;
    this.reason = data.reason;
  }
}
