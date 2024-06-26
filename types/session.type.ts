import { SessionOptions } from "iron-session";

export class SessionData {
  id: string;
  name: string;
  username: string;
  role: string;

  constructor(data: any = {}) {
    this.id = data.id || null;
    this.name = data.name || null;
    this.username = data.username || null;
    this.role = data.role || 'Kasir';
  }
}

export const sessionOptions: SessionOptions = {
  password: process.env.SECRET_KEY!,
  cookieName: "vitara-session",
  cookieOptions: {
    httpOnly: true, // to prevent js from accessing session cookie
    secure: process.env.NODE_ENV === "production" // true for https
  }
}