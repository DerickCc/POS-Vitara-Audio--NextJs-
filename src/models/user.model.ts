import { z } from "zod";

export class UserModel {
  id: string;
  name: string;
  username: string;
  password: string;
  accountStatus: boolean;
  role: "Admin" | "Kasir";

  constructor(data: any = {}) {
    this.id = data.id;
    this.name = data.name;
    this.username = data.username;
    this.password = data.password;
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

export class CreateUpdateUserModel {
  id: string;
  name: string;
  username: string;
  accountStatus: boolean;
  role: "Admin" | "Kasir" | '';
  // for create
  password: string;
  confirmPassword: string;
  // for update
  oldPassword: string;
  newPassword: string;

  constructor(data: any = {}) {
    this.id = data.id;
    this.name = data.name;
    this.username = data.username;
    this.accountStatus = data.accountStatus ?? true;
    this.role = data.role || "Kasir";

    this.password = data.password;
    this.confirmPassword = data.confirmPassword;

    this.oldPassword = data.oldPassword;
    this.newPassword = data.newPassword;
  }

  validateCreateUser() {
    return CreateUserSchema.safeParse(this);
  }

  validateUpdateUser() {
    return UpdateUserSchema.safeParse(this);
  }
} 


