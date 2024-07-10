"use server"

import { SessionData, sessionOptions } from "@/models/session.model"
import { getIronSession } from "iron-session"
import { cookies } from "next/headers"

export const getSession = async() => {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  return session;
}

export async function saveSession(user: SessionData): Promise<void> {
  const session = await getSession();

  session.id = user.id;
  session.name = user.name;
  session.username = user.username;
  session.role = user.role;

  await session.save();
}

export const destroySession = async () => {
  const session = await getSession();
  session.destroy();
}