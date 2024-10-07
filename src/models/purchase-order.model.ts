import { z } from 'zod';
import { PurchaseOrderDetailModel, PurchaseOrderDetailSchema } from './purchase-order-detail.model';

export const PurchaseOrderSchema = z.object({
  purchaseDate: z.string(),
  supplierId: z.string().min(1, { message: 'Mohon memilih Supplier' }),
  remarks: z.string().max(250, { message: 'Keterangan tidak boleh lebih dari 250 huruf' }).optional().nullable(),
  detail: PurchaseOrderDetailSchema,
  // totalItem and totalPrice will be processed from backend
});

export class PurchaseOrderModel {
  id: string;
  code: string;
  purchaseDate: string;
  supplierId: string;
  supplierName: string; // for UI
  remarks: string;
  details: PurchaseOrderDetailModel[]; // detail po
  totalItem: number;
  totalPrice: number;
  status: 'Dalam Proses' | 'Selesai' | 'Dibatalkan' | '';

  constructor(data: any = {}) {
    this.id = data.id;
    this.code = data.code;
    this.purchaseDate = data.purchaseDate;
    this.supplierId = data.supplierId || '';
    this.supplierName = data.supplierName;
    this.remarks = data.remarks;
    this.details = data.details || [new PurchaseOrderDetailModel()];
    this.totalItem = data.totalItem;
    this.totalPrice = data.totalPrice;
    this.status = data.status || 'Dalam Proses';
  }
}
