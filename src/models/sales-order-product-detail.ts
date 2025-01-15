import { z } from 'zod';

export const SalesOrderProductDetailSchema = z.object({
  id: z.string().optional().nullable(),
  productId: z.string().min(1, { message: 'Mohon memilih barang' }),
  sellingPrice: z.coerce.number().min(0, { message: 'Harga jual tidak boleh negatif' }),
  quantity: z.coerce.number().gt(0, { message: 'Qty harus lebih besar dari 0' }),
});

export class SalesOrderProductDetailModel {
  id: string;
  soId: string;
  productId: string;
  productName: string; // for UI
  costPrice: number;
  oriSellingPrice: number;
  sellingPrice: number;
  quantity: number;
  uom: string; // for UI
  stock: number; // for UI
  type: 'Barang Jadi' | 'Material'; // for UI
  totalPrice: number;

  constructor(data: any = {}) {
    this.id = data.id;
    this.soId = data.soId || '';
    this.productId = data.productId || '';
    this.productName = data.productName || '';
    this.costPrice = data.costPrice;
    this.oriSellingPrice = data.oriSellingPrice;
    this.sellingPrice = data.sellingPrice || 0;
    this.quantity = data.quantity || 0;
    this.uom = data.uom;
    this.stock = data.stock || 0;
    this.type = data.type;
    this.totalPrice = data.totalPrice || 0;
  }
}