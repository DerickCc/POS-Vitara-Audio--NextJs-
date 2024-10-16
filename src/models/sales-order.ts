import { getCurrDate } from '@/utils/helper-function';
import { z } from 'zod';
import { SalesOrderProductDetailModel, SalesOrderProductDetailSchema } from './sales-order-product-detail';
import { SalesOrderServiceDetailModel, SalesOrderServiceDetailSchema } from './sales-order-service-detail';

export const SalesOrderSchema = z.object({
  customerId: z.string().min(1, { message: 'Mohon memilih pelanggan' }),
  remarks: z.string().max(500, { message: 'Keterangan tidak boleh lebih dari 500 huruf' }).optional().nullable(),
  paymentType: z.string().min(1, { message: 'Mohon memilih tipe pembayaran' }),
  paymentMethod: z.string().min(1, { message: 'Mohon memilih metode pembayaran' }),
  paidAmount: z.coerce.number().min(1, { message: 'Harap mengisi jumlah yang sudah dibayar' }),
  grandTotal: z.coerce.number().min(0, { message: 'Grand Total tidak boleh bernilai negatif' }),
  productDetails: z.array(SalesOrderProductDetailSchema).refine(
    (details) => {
      const productIds = details.map((d) => d.productId);
      return new Set(productIds).size === productIds.length;
    },
    {
      message: 'Mohon tidak memilih barang yang sama dalam 1 transaksi',
      path: ['refinement'],
    }
  ),
  serviceDetails: z.array(SalesOrderServiceDetailSchema).refine(
    (details) => {
      const services = details.map((d) => d.serviceName);
      return new Set(services).size === services.length;
    },
    {
      message: 'Mohon tidak meng-input jasa yang sama dalam 1 transaksi',
      path: ['refinement'],
    }
  ),
})
.refine((data) => data.productDetails.length > 0 || data.serviceDetails.length > 0, {
  message: 'Harap pilih minimal 1 barang atau jasa untuk dijual',
  path: ['refinement']
})
.refine((data) => data.paidAmount <= data.grandTotal, {
  message: 'Jumlah yang sudah dibayar tidak boleh melebihi Grand Total',
  path: ['paidAmount']
});

export class SalesOrderModel {
  id: string;
  code: string;
  salesDate: string;
  customerId: string;
  customerName: string; // for UI
  remarks: string;
  paymentType: 'DP' | 'Lunas';
  paymentMethod: 'Tunai' | 'Non-tunai';
  subTotal: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  productDetails: SalesOrderProductDetailModel[];
  serviceDetails: SalesOrderServiceDetailModel[];
  status: 'Belum Lunas' | 'Lunas' | 'Batal';
  cashier: string;

  constructor(data: any = {}) {
    this.id = data.id;
    this.code = data.code;
    this.salesDate = data.salesDate || getCurrDate();
    this.customerId = data.customerId || '';
    this.customerName = data.customerName;
    this.remarks = data.remarks;
    this.paymentType = data.paymentType || 'DP';
    this.paymentMethod = data.paymentMethod || 'Non-tunai';
    this.subTotal = data.subTotal || 0;
    this.discount = data.discount || 0;
    this.grandTotal = data.grandTotal || 0;
    this.paidAmount = data.paidAmount || 0;
    this.productDetails = data.productDetails || [];
    this.serviceDetails = data.serviceDetails || [];
    this.status = data.status || 'Belum Lunas';
    this.cashier = data.cashier;
  }
}
