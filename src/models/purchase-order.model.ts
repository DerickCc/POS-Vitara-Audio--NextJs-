import { z } from 'zod';
import {
  PurchaseOrderDetailModel,
  PurchaseOrderDetailSchema,
  SearchPurchaseOrderDetailModel,
} from './purchase-order-detail.model';
import { getCurrDate } from '@/utils/helper-function';
import { BasicSelectOptions } from './global.model';

export const CreatePurchaseOrderSchema = z
  .object({
    supplierId: z.string().min(1, { message: 'Mohon memilih supplier' }),
    remarks: z.string().max(500, { message: 'Keterangan tidak boleh lebih dari 500 huruf' }).optional().nullable(),
    appliedReceivables: z.coerce.number().min(0, { message: 'Potong Piutang tidak boleh negatif' }),
    paidAmount: z.coerce.number().min(0, { message: 'Jumlah yang telah dibayar tidak boleh bernilai negatif' }),
    paymentMethod: z.string().min(1, { message: 'Mohon memilih metode pembayaran' }),
    details: z
      .array(PurchaseOrderDetailSchema)
      .refine(
        (details) => {
          const seen = new Map<string, number>();
          for (const product of details) {
            const key = `${product.productId}-${product.purchasePrice}`;
            if (seen.has(key)) return false;
            seen.set(key, 1);
          }
          return true;
        },
        {
          message: 'Barang yang sama tidak boleh memiliki harga beli yang sama',
          path: ['refinement'],
        }
      )
      .refine(
        (details) => {
          return details.length > 0;
        },
        {
          message: 'Mohon pilih minimal 1 barang yang ingin dibeli',
          path: ['refinement'],
        }
      ),
  })
  .refine((data) => data.paidAmount <= data.details.reduce((acc, d) => acc + d.quantity * d.purchasePrice, 0), {
    message: 'Jumlah yang telah dibayar tidak boleh melebihi Grand Total',
    path: ['paidAmount'],
  });

export const UpdatePurchaseOrderSchema = z
  .object({
    supplierId: z.string().min(1, { message: 'Mohon memilih supplier' }),
    remarks: z.string().max(500, { message: 'Keterangan tidak boleh lebih dari 500 huruf' }).optional().nullable(),
    appliedReceivables: z.coerce.number().min(0, { message: 'Potong Piutang tidak boleh negatif' }),
    paidAmount: z.coerce.number().min(0, { message: 'Jumlah yang telah dibayar tidak boleh bernilai negatif' }),
    paymentMethod: z.string().optional().nullable(),
    details: z
      .array(PurchaseOrderDetailSchema)
      .refine(
        (details) => {
          const seen = new Map<string, number>();
          for (const product of details) {
            const key = `${product.productId}-${product.purchasePrice}`;
            if (seen.has(key)) return false;
            seen.set(key, 1);
          }
          return true;
        },
        {
          message: 'Barang yang sama tidak boleh memiliki harga beli yang sama',
          path: ['refinement'],
        }
      )
      .refine(
        (details) => {
          return details.length > 0;
        },
        {
          message: 'Mohon pilih minimal 1 barang yang ingin dibeli',
          path: ['refinement'],
        }
      ),
  })

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
  paidAmount: number;
  paymentMethod: 'Tunai' | 'Non-tunai'; // for UI
  progressStatus: 'Dalam Proses' | 'Selesai' | 'Batal';
  paymentStatus: 'Belum Lunas' | 'Lunas' | 'Batal';

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
    this.paymentMethod = data.paymentMethod || 'Non-tunai';
    this.progressStatus = data.progressStatus || 'Dalam Proses';
    this.paymentStatus = data.paymentStatus || 'Belum Lunas';
  }
}

export interface SearchPurchaseOrderModel extends BasicSelectOptions {
  id: string;
  code: string;
  supplierName: string;
  details: SearchPurchaseOrderDetailModel[];
}
