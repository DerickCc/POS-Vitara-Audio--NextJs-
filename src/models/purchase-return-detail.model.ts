import { z } from 'zod';

export const PurchaseReturnDetailSchema = z.object({
  id: z.string().optional().nullable(),
  podId: z.string().min(1, { message: 'Mohon memilih barang yang diretur' }),
  returnPrice: z.coerce.number().min(0, { message: 'Harga beli tidak boleh negatif' }),
  returnQuantity: z.coerce.number().gt(0, { message: 'Qty harus lebih besar dari 0' }),
  reason: z
    .string()
    .min(1, { message: 'Mohon mengisi alasan retur' })
    .max(500, { message: 'Alasan tidak boleh lebih dari 500 huruf' }),
});

export class PurchaseReturnDetailModel {
  id: string;
  prId: string;
  podId: string;
  productId: string; // for UI
  productName: string; // for UI
  productUom: string; // for UI
  returnPrice: number;
  returnQuantity: number; // qty that wanted to be return
  purchaseQuantity: number; // for UI
  returnedQuantity: number; // for UI (qty of product that have been returned in previous transaction)
  reason: string;
  totalPrice: number; // for UI

  constructor(data: any = {}) {
    this.id = data.id;
    this.prId = data.prId || '';
    this.podId = data.podId || '';
    this.productId = data.productId || '';
    this.productName = data.productName;
    this.productUom = data.productUom;
    this.returnPrice = data.returnPrice || 0;
    this.returnQuantity = data.returnQuantity || 0;
    this.purchaseQuantity = data.purchaseQuantity || 0;
    this.returnedQuantity = data.returnedQuantity || 0;
    this.reason = data.reason;
    this.totalPrice = data.totalPrice || 0;
  }
}
