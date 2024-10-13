import { getCurrDate } from '@/utils/helper-function';
import { z } from 'zod';
import { SalesOrderProductDetailModel, SalesOrderProductDetailSchema } from './sales-order-product-detail';
import { SalesOrderServiceDetailModel, SalesOrderServiceDetailSchema } from './sales-order-service-detail';

export const SalesOrderSchema = z.object({
  customerId: z.string().min(1, { message: 'Mohon memilih pelanggan' }),
  remarks: z.string().max(250, { message: 'Keterangan tidak boleh lebih dari 250 huruf' }).optional().nullable(),
  paymentType: z.string().min(1, { message: 'Mohon memilih tipe pembayaran' }),
  paymentMethod: z.string().min(1, { message: 'Mohon memilih metode pembayaran' }),
  productDetails: z.array(SalesOrderProductDetailSchema).refine(
    (details) => {
      const productIds = details.map((d) => d.productId);
      return new Set(productIds).size === productIds.length;
    },
    {
      message: 'Mohon tidak memilih barang yang sama dalam 1 transaksi',
      path: ['productDetails'],
    }
  ),
  serviceDetails: z.array(SalesOrderServiceDetailSchema).refine(
    (details) => {
      const services = details.map((d) => d.serviceName);
      return new Set(services).size === services.length;
    },
    {
      message: 'Mohon tidak meng-input jasa yang sama dalam 1 transaksi',
      path: ['serviceDetails'],
    }
  ),
});

export class SalesOrderModel {
  id: string;
  code: string;
  salesDate: string;
  customerId: string;
  customerName: string; // for UI
  remarks: string;
  paymentType: string;
  paymentMethod: string;
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
    this.paymentType = data.paymentType;
    this.paymentMethod = data.paymentMethod;
    this.subTotal = data.subTotal;
    this.discount = data.discount;
    this.grandTotal = data.grandTotal;
    this.paidAmount = data.paidAmount;
    this.productDetails = data.productDetails || [];
    this.serviceDetails = data.serviceDetails || [];
    this.status = data.status || 'Belum Lunas';
    this.cashier = data.cashier;
  }
}
