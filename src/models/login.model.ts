import { z } from "zod";

export const LoginSchema = z.object({
  username: z.string().min(1, { message: "Usernama harus diisi" }),
  password: z.string().min(1, { message: "Password harus diisi" }),
});

export class LoginModel {
  username: string;
  password: string;

  constructor(data: any = {}) {
    this.username = data.username || null;
    this.password = data.password || null;
  }

  validate() {
    return LoginSchema.safeParse(this);
  }
}