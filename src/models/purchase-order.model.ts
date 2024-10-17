import { z } from 'zod';
import { PurchaseOrderDetailModel, PurchaseOrderDetailSchema } from './purchase-order-detail.model';
import { getCurrDate } from '@/utils/helper-function';

export const PurchaseOrderSchema = z.object({
  supplierId: z.string().min(1, { message: 'Mohon memilih supplier' }),
  remarks: z.string().max(500, { message: 'Keterangan tidak boleh lebih dari 500 huruf' }).optional().nullable(),
  details: z
    .array(PurchaseOrderDetailSchema)
    .refine(
      (details) => {
        const productIds = details.map((d) => d.productId);
        return new Set(productIds).size === productIds.length;
      },
      {
        message: 'Mohon tidak memilih barang yang sama dalam 1 transaksi',
        path: ['refinement'],
      }
    )
    .refine(
      (details) => {
        return details.length > 0;
      },
      {
        message: 'Harap pilih minimal 1 barang yang ingin dibeli',
        path: ['refinement'],
      }
    ),
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
  grandTotal: number;
  status: 'Dalam Proses' | 'Selesai' | 'Batal';

  constructor(data: any = {}) {
    this.id = data.id;
    this.code = data.code;
    this.purchaseDate = data.purchaseDate || getCurrDate();
    this.supplierId = data.supplierId || '';
    this.supplierName = data.supplierName;
    this.remarks = data.remarks;
    this.details = data.details || [new PurchaseOrderDetailModel()];
    this.totalItem = data.totalItem;
    this.grandTotal = data.grandTotal;
    this.status = data.status || 'Dalam Proses';
  }
}
