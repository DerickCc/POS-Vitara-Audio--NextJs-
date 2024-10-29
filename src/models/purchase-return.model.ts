import { getCurrDate } from '@/utils/helper-function';
import { PurchaseReturnDetailModel, PurchaseReturnDetailSchema } from './purchase-return-detail.model';
import { z } from 'zod';

export const PurchaseReturnSchema = z.object({
  poId: z.string().min(1, { message: 'Mohon memilih transaksi pembelian' }),
  returnType: z.string().max(1, { message: 'Mohon memilih tipe retur' }),
  details: z
    .array(PurchaseReturnDetailSchema)
    .refine(
      (details) => {
        const podIds = details.map((d) => d.podId);
        return new Set(podIds).size === podIds.length;
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
        message: 'Harap pilih minimal 1 barang yang ingin diretur',
        path: ['refinement'],
      }
    ),
});

export class PurchaseReturnModel {
  id: string;
  code: string;
  poId: string;
  poCode: string; // for UI
  supplierId: string; // for UI
  supplierName: string; // for UI
  returnDate: string;
  returnType: 'Penggantian Barang' | 'Pengembalian Dana' | 'Piutang';
  details: PurchaseReturnDetailModel[]; // detail po
  grandTotal: number;
  status: 'Dalam Proses' | 'Selesai' | 'Batal';

  constructor(data: any = {}) {
    this.id = data.id;
    this.code = data.code;
    this.poId = data.poId || '';
    this.poCode = data.poCode;
    this.supplierId = data.supplierId || '';
    this.supplierName = data.supplierName;
    this.returnDate = data.returnDate || getCurrDate();
    this.returnType = data.returnType || 'Penggantian Barang';
    this.details = data.details || [];
    this.grandTotal = data.grandTotal;
    this.status = data.status || 'Dalam Proses';
  }
}
