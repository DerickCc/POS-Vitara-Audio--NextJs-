import { z } from 'zod';
import { BasicSelectOptions } from './global.model';

export const PurchaseOrderDetailSchema = z.object({
  id: z.string().optional().nullable(),
  productId: z.string().min(1, { message: 'Mohon memilih barang' }),
  purchasePrice: z.coerce.number().min(0, { message: 'Harga beli tidak boleh negatif' }),
  quantity: z.coerce.number().min(1, { message: 'Qty minimal harus 1' }),
});

export class PurchaseOrderDetailModel {
  id: string;
  poId: string;
  productId: string; // for UI
  productName: string; // for UI
  purchasePrice: number;
  quantity: number;
  uom: string; // for UI
  totalPrice: number;

  constructor(data: any = {}) {
    this.id = data.id;
    this.poId = data.poId || '';
    this.productId = data.productId || '';
    this.productName = data.productName || '';
    this.purchasePrice = data.purchasePrice || 0;
    this.quantity = data.quantity || 0;
    this.uom = data.uom;
    this.totalPrice = data.totalPrice || 0;
  }
}

export interface SearchPurchaseOrderDetailModel extends BasicSelectOptions {
  id: string;
  productId: string;
  productName: string;
  productUom: string;
  purchasePrice: number;
  quantity: number;
}
