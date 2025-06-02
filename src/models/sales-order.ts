import { getCurrDate } from '@/utils/helper-function';
import { z } from 'zod';
import { SalesOrderProductDetailModel, SalesOrderProductDetailSchema } from './sales-order-product-detail';
import { SalesOrderServiceDetailModel, SalesOrderServiceDetailSchema } from './sales-order-service-detail';
import { PaymentHistoryModel } from './payment-history.model';

export const CreateSalesOrderSchema = z
  .object({
    customerId: z.string().min(1, { message: 'Mohon memilih pelanggan' }),
    entryDate: z
      .union([z.string(), z.date()])
      .transform((val) => (typeof val === 'string' ? new Date(val) : val)),
    remarks: z.string().max(500, { message: 'Keterangan tidak boleh lebih dari 500 karakter' }).optional().nullable(),
    paymentType: z.string().min(1, { message: 'Mohon memilih tipe pembayaran' }),
    paymentMethod: z.string().min(1, { message: 'Mohon memilih metode pembayaran' }),
    paidAmount: z.coerce.number().min(0, { message: 'Jumlah yang telah dibayar tidak boleh bernilai negatif' }),
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
    path: ['refinement'],
  })
  .refine((data) => data.paidAmount <= data.grandTotal, {
    message: 'Jumlah yang telah dibayar tidak boleh melebihi Grand Total',
    path: ['paidAmount'],
  });

export const UpdateSalesOrderSchema = z
  .object({
    customerId: z.string().min(1, { message: 'Mohon memilih pelanggan' }),
    entryDate: z
      .union([z.string(), z.date()])
      .transform((val) => (typeof val === 'string' ? new Date(val) : val)),
    remarks: z.string().max(500, { message: 'Keterangan tidak boleh lebih dari 500 karakter' }).optional().nullable(),
    paidAmount: z.coerce.number().min(0, { message: 'Jumlah yang telah dibayar tidak boleh bernilai negatif' }),
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
    path: ['refinement'],
  });

export class SalesOrderModel {
  id: string;
  code: string;
  salesDate: string;
  entryDate: string;
  customerId: string;
  customerName: string; // for UI
  customerLicensePlate: string; // for UI
  customerAddress: string; // for UI
  customerPhoneNo: string; // for UI
  remarks: string;
  paymentType: 'DP' | 'Lunas';
  paymentMethod: 'Tunai' | 'Non-tunai'; // for UI
  subTotal: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  paymentHistory: PaymentHistoryModel[];
  productDetails: SalesOrderProductDetailModel[];
  serviceDetails: SalesOrderServiceDetailModel[];
  progressStatus: 'Belum Dikerjakan' | 'Selesai' | 'Batal';
  paymentStatus: 'Belum Lunas' | 'Lunas' | 'Batal';
  cashier: string;

  constructor(data: any = {}) {
    this.id = data.id;
    this.code = data.code || '';
    this.salesDate = data.salesDate || getCurrDate();
    this.entryDate = data.entryDate || new Date();
    this.customerId = data.customerId || '';
    this.customerName = data.customerName;
    this.customerLicensePlate = data.customerLicensePlate;
    this.customerAddress = data.customerAddress;
    this.customerPhoneNo = data.customerPhoneNo;
    this.remarks = data.remarks;
    this.paymentType = data.paymentType || 'DP';
    this.paymentMethod = data.paymentMethod || 'Non-tunai';
    this.subTotal = data.subTotal || 0;
    this.discount = data.discount || 0;
    this.grandTotal = data.grandTotal || 0;
    this.paidAmount = data.paidAmount || 0;
    this.paymentHistory = data.paymentHistory || [];
    this.productDetails = data.productDetails || [];
    this.serviceDetails = data.serviceDetails || [];
    this.progressStatus = data.progressStatus || 'Belum Dikerjakan';
    this.paymentStatus = data.paymentStatus || 'Belum Lunas';
    this.cashier = data.cashier;
  }
}

export interface InvoiceDetailModel {
  name: string;
  quantity: number;
  oriSellingPrice: number;
  sellingPrice: number;
  totalPrice: number;
}
