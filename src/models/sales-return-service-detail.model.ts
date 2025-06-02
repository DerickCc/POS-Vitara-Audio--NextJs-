import { z } from 'zod';

export const SalesReturnServiceDetailSchema = z.object({
  id: z.string().optional().nullable(),
  serviceName: z.string().min(1, { message: 'Mohon mengisi jasa yang diretur' }),
  returnQuantity: z.coerce.number().gt(0, { message: 'Qty harus lebih besar dari 0' }),
  reason: z
    .string()
    .min(1, { message: 'Mohon mengisi alasan retur' })
    .max(500, { message: 'Alasan tidak boleh lebih dari 500 karakter' }),
});

export class SalesReturnServiceDetailModel {
  id: string;
  srId: string;
  serviceName: string;
  returnQuantity: number;
  reason: string;

  constructor(data: any = {}) {
    this.id = data.id;
    this.srId = data.srId || '';
    this.serviceName = data.serviceName;
    this.returnQuantity = data.returnQuantity || 0;
    this.reason = data.reason;
  }
}
