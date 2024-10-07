import { z } from 'zod';

export class SessionData {
  id: string;
  name: string;
  username: string;
  role: string;

  constructor(data: any = {}) {
    this.id = data.id;
    this.name = data.name;
    this.username = data.username;
    this.role = data.role || 'Kasir';
  }
}

export const LoginSchema = z.object({
  username: z
    .string()
    .nullable()
    .refine((val) => val !== null && val.trim().length > 0, { message: 'Usernama harus diisi' }),
  password: z
    .string()
    .nullable()
    .refine((val) => val !== null && val.trim().length > 0, { message: 'Password harus diisi' }),
});

export class LoginModel {
  username: string;
  password: string;

  constructor(data: any = {}) {
    this.username = data.username || null;
    this.password = data.password || null;
  }
}
