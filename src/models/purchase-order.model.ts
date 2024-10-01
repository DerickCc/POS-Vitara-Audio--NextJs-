import { z } from "zod";

export const PurchaseOrderSchema = z.object

export class PurchaseOrderModel {
  id: string;
  poCode: string;
  purchaseDate: string;
  supplierId: string;
  supplierName: string;
  remarks: string;
  totalItem: number;
  totalPrice: number;
  status: 'Dalam Proses' | 'Selesai' | 'Dibatalkan' | '';

  constructor(data: any = {}) {
    this.id = data.id;
    this.poCode = data.poCode;
    this.purchaseDate = data.purchaseDate;
    this.supplierId = data.supplierId;
    this.supplierName = data.supplierName;
    this.remarks = data.remarks;
    this.totalItem = data.totalItem;
    this.totalPrice = data.totalPrice;
    this.status = data.status || 'Dalam Proses';
  }
}