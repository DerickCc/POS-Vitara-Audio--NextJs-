import { z } from "zod";

export const UserSchema = z.object({
  id: z.number().optional(),
  name: z
    .string()
    .min(5, { message: "Nama minimal harus 5 karakter" })
    .max(50, { message: "Nama tidak boleh lebih dari 50 karakter" }),
  username: z
    .string()
    .min(5, { message: "Usernama minimal harus 5 karakter" })
    .max(50, { message: "Usernama tidak boleh lebih dari 50 karakter" }),
  password: z
    .string()
    .min(6, { message: "Password minimal harus 6 karakter" }),
  accountStatus: z.boolean().optional(),
  role: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type UserModel = z.infer<typeof UserSchema>;
