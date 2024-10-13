import { z } from "zod";
import { BasicSelectOptions } from "./global.model";
import { Decimal } from "@prisma/client/runtime/library";

export const ProductSchema = z.object({
  name: z.string().min(1, { message: 'Nama harus diisi' }),
  photo: z.string().optional().nullable(),
  stock: z.coerce.number().min(0, { message: 'Stok tidak boleh negatif' }),
  restockThreshold: z.coerce.number().min(0, { message: 'Ambang Batas Restok tidak boleh negatif' }),
  uom: z.string().min(1, { message: 'Satuan harus diisi' }),
  purchasePrice: z.coerce.number().min(0, { message: 'Harga beli tidak boleh negatif' }),
  sellingPrice: z.coerce.number().min(0, { message: 'Harga Jual Restok tidak boleh negatif' }),
  remarks: z.string().max(250, { message: 'Keterangan tidak boleh lebih dari 250 huruf' }).optional().nullable(),
});

export class ProductModel {
  id: string;
  code: string;
  name: string;
  photo: string;
  stock: Decimal;
  restockThreshold: Decimal;
  uom: string;
  costPrice: Decimal;
  costPriceCode: string;
  purchasePrice: Decimal;
  sellingPrice: Decimal;
  remarks: string;

  constructor(data: any = {}) {
    this.id = data.id;
    this.code = data.code;
    this.name = data.name || '';
    this.photo = data.photo || '';
    this.stock = data.stock || 0;
    this.restockThreshold = data.restockThreshold || 0;
    this.uom = data.uom;
    this.costPrice = data.costPrice || 0;
    this.costPriceCode = data.costPriceCode;
    this.purchasePrice = data.purchasePrice || 0;
    this.sellingPrice = data.sellingPrice || 0;
    this.remarks = data.remarks;
  }
}

export interface SearchProductModel extends BasicSelectOptions {
  id: string;
  code: string;
  name: string;
  purchasePrice: number;
  sellingPrice: number;
  uom: string;
}