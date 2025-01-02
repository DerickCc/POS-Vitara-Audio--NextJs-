import { z } from 'zod';
import {
  PurchaseOrderDetailModel,
  PurchaseOrderDetailSchema,
  SearchPurchaseOrderDetailModel,
} from './purchase-order-detail.model';
import { getCurrDate } from '@/utils/helper-function';
import { BasicSelectOptions } from './global.model';

export const PurchaseOrderSchema = z.object({
  supplierId: z.string().min(1, { message: 'Mohon memilih supplier' }),
  remarks: z.string().max(500, { message: 'Keterangan tidak boleh lebih dari 500 huruf' }).optional().nullable(),
  appliedReceivables: z.coerce.number().min(0, { message: 'Potong Piutang tidak boleh negatif' }),
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
  supplierReceivable: number; // for UI
  appliedReceivables: number;
  remarks: string;
  details: PurchaseOrderDetailModel[]; // detail po
  totalItem: number;
  subTotal: number;
  grandTotal: number;
  paidAmount: number; // for UI
  status: 'Dalam Proses' | 'Selesai' | 'Batal';

  constructor(data: any = {}) {
    this.id = data.id;
    this.code = data.code;
    this.purchaseDate = data.purchaseDate || getCurrDate();
    this.supplierId = data.supplierId || '';
    this.supplierName = data.supplierName;
    this.supplierReceivable = data.supplierReceivable || 0;
    this.appliedReceivables = data.appliedReceivables || 0;
    this.remarks = data.remarks;
    this.details = data.details || [];
    this.totalItem = data.totalItem;
    this.subTotal = data.subTotal || 0;
    this.grandTotal = data.grandTotal || 0;
    this.paidAmount = data.paidAmount || 0;
    this.status = data.status || 'Dalam Proses';
  }
}

export interface SearchPurchaseOrderModel extends BasicSelectOptions {
  id: string;
  code: string;
  supplierName: string;
  details: SearchPurchaseOrderDetailModel[];
}
