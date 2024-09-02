import { z } from "zod";

export const CustomerSchema = z.object({
  name: z.string().min(1, { message: "Nama harus diisi" }),
  licensePlate: z.string().min(1, { message: "No. Plat harus diisi" }),
  phoneNo: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || /^\d+$/.test(val), {
      message: "No. Telepon harus berupa angka",
    }),
  address: z.string().max(255, { message: "Alamat tidak boleh lebih dari 255 huruf" }).optional().nullable(),
});

export class CustomerModel {
  name: string;
  licensePlate: string;
  phoneNo: string | null;
  address: string | null;

  constructor(data: any = {}) {
    this.name = data.name;
    this.licensePlate = data.licensePlate;
    this.phoneNo = data.phoneNo || null;
    this.address = data.address || null;
  }

  validate() {
    return CustomerSchema.safeParse(this);
  }
}