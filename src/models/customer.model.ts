import { z } from 'zod';
import { BasicSelectOptions } from './global.model';

export const CustomerSchema = z.object({
  name: z.string().min(2, { message: 'Nama harus lebih dari 2 karakter' }),
  licensePlate: z
    .string()
    .min(1, { message: 'No. Plat harus diisi' })
    .refine((val) => /^[A-Z]{1,2} \d{1,4} [A-Z]{1,3}$/.test(val), {
      message: 'Format tidak valid. Contoh BK 1234 ABC',
    }),
  phoneNo: z
    .string()
    .refine((val) => !val || /^\d+$/.test(val), {
      message: 'No. Telepon harus berupa angka',
    })
    .optional()
    .nullable(),
  address: z.string().max(250, { message: 'Alamat tidak boleh lebih dari 250 karakter' }).optional().nullable(),
});

export class CustomerModel {
  id: string;
  code: string;
  name: string;
  licensePlate: string;
  phoneNo: string;
  address: string;

  constructor(data: any = {}) {
    this.id = data.id;
    this.code = data.code;
    this.name = data.name;
    this.licensePlate = data.licensePlate;
    this.phoneNo = data.phoneNo;
    this.address = data.address;
  }
}

export interface SearchCustomerModel extends BasicSelectOptions {
  id: string;
  code: string;
  name: string;
  licensePlate: string;
}

export interface CustomerHistoryModel {
  date: string;
  id: string;
  code: string;
  type: string;
  progressStatus: string;
  paymentStatus?: string;
  grandTotal: number;
}
