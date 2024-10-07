import { z } from 'zod';
import { BasicSelectOptions } from './global.model';

export const SupplierSchema = z
  .object({
    name: z.string().min(1, { message: 'Nama harus diisi' }),
    pic: z.string().min(1, { message: 'PIC harus diisi' }),
    phoneNo: z
      .string()
      .refine((val) => !val || /^\d+$/.test(val), {
        message: 'No. Telepon harus berupa angka',
      })
      .optional()
      .nullable(),
    address: z.string().max(100, { message: 'Alamat tidak boleh lebih dari 100 huruf' }).optional().nullable(),
    remarks: z.string().max(250, { message: 'Keterangan tidak boleh lebih dari 250 huruf' }).optional().nullable(),
    receivables: z.coerce.number().min(0, { message: 'Piutang tidak boleh negatif' }),
    receivablesLimit: z.coerce.number().min(0, { message: 'Limit Piutang tidak boleh negatif' }),
  })
  .refine((data) => data.receivables <= data.receivablesLimit, {
    message: 'Piutang tidak boleh lebih besar dari Limit Piutang',
    path: ['receivablesLimit'],
  });

export class SupplierModel {
  id: string;
  code: string;
  name: string;
  pic: string;
  phoneNo: string;
  address: string;
  remarks: string;
  receivablesLimit: number;
  receivables: number;

  constructor(data: any = {}) {
    this.id = data.id;
    this.code = data.code;
    this.name = data.name;
    this.pic = data.pic;
    this.phoneNo = data.phoneNo;
    this.address = data.address;
    this.remarks = data.remarks;
    this.receivablesLimit = data.receivablesLimit || 0;
    this.receivables = data.receivables || 0;
  }
}

export interface SearchSupplierModel extends BasicSelectOptions {
  id: string;
  code: string;
  name: string;
}
