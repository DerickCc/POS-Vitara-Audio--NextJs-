import { z } from 'zod';

export const CustomerSchema = z.object({
  name: z.string().min(1, { message: 'Nama harus diisi' }),
  licensePlate: z.string().min(1, { message: 'No. Plat harus diisi' }),
  phoneNo: z
    .string()
    .refine((val) => !val || /^\d+$/.test(val), {
      message: 'No. Telepon harus berupa angka',
    })
    .optional()
    .nullable(),
  address: z.string().max(100, { message: 'Alamat tidak boleh lebih dari 100 huruf' }).optional().nullable(),
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

  validate() {
    return CustomerSchema.safeParse(this);
  }
}
