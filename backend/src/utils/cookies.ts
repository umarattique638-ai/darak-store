import type { CookieOptions, Response } from "express";
import { env, isProd } from "../config/env.js";

export const ACCESS_COOKIE = "darak_at";
export const REFRESH_COOKIE = "darak_rt";
/** The refresh cookie is only ever sent to /api/auth/* — never to pages or other endpoints. */
export const REFRESH_COOKIE_PATH = "/api/auth";

const base: CookieOptions = { httpOnly: true, secure: isProd };

export function setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
  res.cookie(ACCESS_COOKIE, tokens.accessToken, { ...base, sameSite: "lax", path: "/", maxAge: env.ACCESS_TOKEN_TTL * 1000 });
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, { ...base, sameSite: "strict", path: REFRESH_COOKIE_PATH, maxAge: env.REFRESH_TOKEN_TTL * 1000 });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE, { ...base, sameSite: "lax", path: "/" });
  res.clearCookie(REFRESH_COOKIE, { ...base, sameSite: "strict", path: REFRESH_COOKIE_PATH });
}
