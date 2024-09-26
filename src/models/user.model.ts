import { z } from "zod";

export class UserModel {
  id: number;
  name: string;
  username: string;
  password: string;
  accountStatus: boolean;
  role: "Admin" | "Kasir";

  constructor(data: any = {}) {
    this.id = data.id || null;
    this.name = data.name || null;
    this.username = data.username || null;
    this.password = data.password || null;
    this.accountStatus = data.accountStatus ?? true;
    this.role = data.role || "Kasir";
  }
}

export const CreateUserSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Nama minimal harus 1 karakter" })
    .max(50, { message: "Nama tidak boleh lebih dari 50 karakter" }),
  username: z
    .string()
    .min(5, { message: "Usernama minimal harus 5 karakter" })
    .max(50, { message: "Usernama tidak boleh lebih dari 50 karakter" }),
  password: z
    .string()
    .min(6, { message: "Password minimal harus 6 karakter" })
    .max(100, { message: "Password tidak boleh lebih dari 100 karakter" }),
  confirmPassword: z
    .string()
    .min(6, { message: "Password minimal harus 6 karakter" })
    .max(100, { message: "Password tidak boleh lebih dari 100 karakter" }),
  accountStatus: z.boolean().optional(),
  role: z.string(),
})
.refine((data) => data.password === data.confirmPassword, {
  message: 'Password dan Konfirmasi Password harus sama',
  path: ['confirmPassword'],
});

export class CreateUserModel {
  id: number;
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
  accountStatus: boolean;
  role: "Admin" | "Kasir";

  constructor(data: any = {}) {
    this.id = data.id || null;
    this.name = data.name || null;
    this.username = data.username || null;
    this.password = data.password || null;
    this.confirmPassword = data.confirmPassword || null;
    this.accountStatus = data.accountStatus ?? true;
    this.role = data.role || "Kasir";
  }

  validate() {
    return CreateUserSchema.safeParse(this);
  }
} 

export const UpdateUserSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Nama minimal harus 1 karakter" })
    .max(50, { message: "Nama tidak boleh lebih dari 50 karakter" }),
  username: z
    .string()
    .min(5, { message: "Usernama minimal harus 5 karakter" })
    .max(50, { message: "Usernama tidak boleh lebih dari 50 karakter" }),
  oldPassword: z
    .string()
    .min(6, { message: "Password minimal harus 6 karakter" })
    .max(100, { message: "Password tidak boleh lebih dari 100 karakter" }),
  newPassword: z
    .string()
    .min(6, { message: "Password minimal harus 6 karakter" })
    .max(100, { message: "Password tidak boleh lebih dari 100 karakter" }),
  accountStatus: z.boolean().optional(),
  role: z.string(),
});

export class UpdateUserModel {
  id: number;
  name: string;
  username: string;
  oldPassword: string;
  newPassword: string;
  accountStatus: boolean;
  role: "Admin" | "Kasir";

  constructor(data: any = {}) {
    this.id = data.id || null;
    this.name = data.name || null;
    this.username = data.username || null;
    this.oldPassword = data.oldPassword || null;
    this.newPassword = data.newPassword || null;
    this.accountStatus = data.accountStatus ?? true;
    this.role = data.role || "Kasir";
  }

  validate() {
    return UpdateUserSchema.safeParse(this);
  }
} 

export const UpdateAccountStatusSchema = z.object({
  accountStatus: z.boolean(),
});


