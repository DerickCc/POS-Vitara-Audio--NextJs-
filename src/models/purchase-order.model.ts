import { z } from 'zod';
import { PurchaseOrderDetailModel, PurchaseOrderDetailSchema } from './purchase-order-detail.model';
import { getCurrDate } from '@/utils/helper-function';

export const PurchaseOrderSchema = z.object({
  supplierId: z.string().min(1, { message: 'Mohon memilih Supplier' }),
  remarks: z.string().max(250, { message: 'Keterangan tidak boleh lebih dari 250 huruf' }).optional().nullable(),
  details: z.array(PurchaseOrderDetailSchema).refine(
    (details) => {
      const productIds = details.map((p) => p.productId);
      return new Set(productIds).size === productIds.length;
    },
    {
      message: 'Mohon tidak memilih barang yang sama dalam 1 transaksi',
      path: ['details'],
    }
  ),
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
  status: 'Dalam Proses' | 'Selesai' | 'Dibatalkan';

  constructor(data: any = {}) {
    this.id = data.id;
    this.code = data.code;
    this.purchaseDate = data.purchaseDate || getCurrDate();
    this.supplierId = data.supplierId || '';
    this.supplierName = data.supplierName;
    this.remarks = data.remarks;
    this.details = data.details || [new PurchaseOrderDetailModel()];
    this.totalItem = data.totalItem;
    this.totalPrice = data.totalPrice;
    this.status = data.status || 'Dalam Proses';
  }
}
