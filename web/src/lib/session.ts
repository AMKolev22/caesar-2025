import { SessionOptions } from "iron-session";
import { getIronSession } from "iron-session";
export type SessionData = {
  user?: {
    email: string;
  };
};

export const sessionOptions: SessionOptions = {
  cookieName: "caesar_session",
  password: "n8M3zmxdf1VEEJ7tf7VLyvGFiBpt4nBU",
  cookieOptions: {
    secure: false,
  },
};

export function getSession(req: Request) {
  return getIronSession<SessionData>(, sessionOptions);
}