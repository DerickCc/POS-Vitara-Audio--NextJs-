import { SessionOptions } from "iron-session";

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