import { z } from 'zod';
import { BasicSelectOptions } from './global.model';

export const SalesReturnProductDetailSchema = z.object({
  id: z.string().optional().nullable(),
  sopdId: z.string().min(1, { message: 'Mohon memilih barang yang diretur' }),
  returnPrice: z.coerce.number().min(0, { message: 'Harga beli tidak boleh negatif' }),
  returnQuantity: z.coerce.number().gt(0, { message: 'Qty harus lebih besar dari 0' }),
  reason: z
    .string()
    .min(1, { message: 'Mohon mengisi alasan retur' })
    .max(500, { message: 'Alasan tidak boleh lebih dari 500 karakter' }),
});

export class SalesReturnProductDetailModel {
  id: string;
  srId: string;
  sopdId: string;
  productId: string; // for UI
  productName: string; // for UI
  productUom: string; // for UI
  productStock: number; // for UI
  returnPrice: number;
  returnQuantity: number; // qty that wanted to be return
  salesQuantity: number; // for UI
  returnedQuantity: number; // for UI (qty of product that have been returned in previous transaction)
  reason: string;
  totalPrice: number; // for UI

  constructor(data: any = {}) {
    this.id = data.id;
    this.srId = data.srId || '';
    this.sopdId = data.sopdId || '';
    this.productId = data.productId || '';
    this.productName = data.productName;
    this.productUom = data.productUom;
    this.productStock = data.productStock || 0;
    this.returnPrice = data.returnPrice || 0;
    this.returnQuantity = data.returnQuantity || 0;
    this.salesQuantity = data.salesQuantity || 0;
    this.returnedQuantity = data.returnedQuantity || 0;
    this.reason = data.reason;
    this.totalPrice = data.totalPrice || 0;
  }
}

export interface SearchSalesOrderProductDetailModel extends BasicSelectOptions {
  id: string;
  productId: string;
  productName: string;
  productUom: string;
  productStock: number;
  salesPrice: number;
  quantity: number;
  returnedQuantity: number; 
}
