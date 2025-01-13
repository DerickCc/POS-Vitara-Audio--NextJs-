import { z } from 'zod';
import { BasicSelectOptions } from './global.model';

export const ProductSchema = z.object({
  name: z.string().min(1, { message: 'Nama harus diisi' }),
  type: z.string().min(1, { message: 'Mohon memilih tipe barang' }),
  stock: z.coerce.number().min(0, { message: 'Stok tidak boleh negatif' }),
  restockThreshold: z.coerce.number().min(0, { message: 'Ambang Batas Restok tidak boleh negatif' }),
  uom: z.string().min(1, { message: 'Satuan harus diisi' }),
  purchasePrice: z.coerce.number().min(0, { message: 'Harga beli tidak boleh negatif' }),
  sellingPrice: z.coerce.number().min(0, { message: 'Harga Jual Restok tidak boleh negatif' }),
  remarks: z.string().max(500, { message: 'Keterangan tidak boleh lebih dari 500 huruf' }).optional().nullable(),
});

export class ProductModel {
  id: string;
  code: string;
  name: string;
  type: 'Barang Jadi' | 'Material';
  stock: number;
  restockThreshold: number;
  uom: string;
  costPrice: number;
  purchasePrice: number;
  purchasePriceCode: string;
  sellingPrice: number;
  remarks: string;

  constructor(data: any = {}) {
    this.id = data.id;
    this.code = data.code;
    this.name = data.name || '';
    this.type = data.type || 'Barang Jadi';
    this.stock = data.stock || 0;
    this.restockThreshold = data.restockThreshold || 0;
    this.uom = data.uom;
    this.costPrice = data.costPrice || 0;
    this.purchasePrice = data.purchasePrice || 0;
    this.purchasePriceCode = data.purchasePriceCode;
    this.sellingPrice = data.sellingPrice || 0;
    this.remarks = data.remarks;
  }
}

export interface ProductCurrPriceModel {
  id: string;
  name: string;
  costPrice: number;
}

export interface SearchProductModel extends BasicSelectOptions {
  id: string;
  code: string;
  name: string;
  purchasePrice: number;
  purchasePriceCode: string;
  sellingPrice: number;
  uom: string;
  stock: number;
}

export interface ProductHistoryModel {
  date: string;
  id: string;
  code: string;
  type: string;
  supOrCus: string;
  price: number;
  quantity: number;
  totalPrice: number;
}
