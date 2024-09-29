'use server';

import { SessionData } from '@/models/session.model';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export const getSession = async () => {
  const session = await getIronSession<SessionData>(cookies(), {
    password: process.env.SECRET_KEY!,
    cookieName: 'vitara-session',
    cookieOptions: {
      httpOnly: true, // to prevent js from accessing session cookie
      secure: process.env.NODE_ENV === 'production', // true for https
    },
  });
  return session;
};

export const saveSession = async (user: SessionData): Promise<void> => {
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
};
