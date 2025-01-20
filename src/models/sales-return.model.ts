import { getCurrDate } from '@/utils/helper-function';
import { z } from 'zod';
import {
  SalesReturnProductDetailModel,
  SalesReturnProductDetailSchema,
  SearchSalesOrderProductDetailModel,
} from './sales-return-product-detail.model';
import { SalesReturnServiceDetailModel, SalesReturnServiceDetailSchema } from './sales-return-service-detail.model';
import { BasicSelectOptions } from './global.model';

export const SalesReturnSchema = z
  .object({
    soId: z.string().min(1, { message: 'Mohon memilih transaksi pembelian' }),
    productDetails: z.array(SalesReturnProductDetailSchema),
    serviceDetails: z.array(SalesReturnServiceDetailSchema),
  })
  .refine((data) => data.productDetails.length > 0 || data.serviceDetails.length > 0, {
    message: 'Harap pilih minimal 1 barang atau jasa yang ingin diretur',
    path: ['refinement'],
  });

export class SalesReturnModel {
  id: string;
  code: string;
  soId: string;
  soCode: string; // for UI
  customerName: string; // for UI
  customerLicensePlate: string; // for UI
  returnDate: string;
  productDetails: SalesReturnProductDetailModel[]; // detail product
  serviceDetails: SalesReturnServiceDetailModel[]; // detail service
  grandTotal: number;
  status: 'Belum Dikerjakan' | 'Selesai' | 'Batal';

  constructor(data: any = {}) {
    this.id = data.id;
    this.code = data.code;
    this.soId = data.soId || '';
    this.soCode = data.soCode;
    this.customerName = data.customerName;
    this.customerLicensePlate = data.customerLicensePlate;
    this.returnDate = data.returnDate || getCurrDate();
    this.productDetails = data.productDetails || [];
    this.serviceDetails = data.serviceDetails || [];
    this.grandTotal = data.grandTotal;
    this.status = data.status || 'Belum Dikerjakan';
  }
}

export interface SearchSalesOrderModel extends BasicSelectOptions {
  id: string;
  code: string;
  customerName: string;
  customerLicensePlate: string;
  productDetails: SearchSalesOrderProductDetailModel[];
}
