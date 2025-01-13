import { z } from 'zod';

export const SalesOrderServiceDetailSchema = z.object({
  id: z.string().optional().nullable(),
  serviceName: z.string().min(1, { message: 'Mohon mengisi nama jasa' }),
  sellingPrice: z.coerce.number().min(0, { message: 'Harga jual tidak boleh negatif' }),
  quantity: z.coerce.number().gt(0, { message: 'Qty harus lebih besar dari 0' }),
});

export class SalesOrderServiceDetailModel {
  id: string;
  soId: string;
  serviceName: string;
  sellingPrice: number;
  quantity: number;
  totalPrice: number;

  constructor(data: any = {}) {
    this.id = data.id;
    this.soId = data.soId || '';
    this.serviceName = data.serviceName || '';
    this.sellingPrice = data.sellingPrice || 0;
    this.quantity = data.quantity || 0;
    this.totalPrice = data.totalPrice || 0;
  }
}