import { SignJWT, jwtVerify, errors as joseErrors } from "jose";
import { createHash, randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import type { Role } from "../models/User.js";

export interface AccessPayload { sub: string; role: Role; sid: string; jti: string; exp: number; type: "access" }
export interface RefreshPayload { sub: string; sid: string; jti: string; exp: number; type: "refresh" }

const ISSUER = "darak-api";
const accessKey = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
const refreshKey = new TextEncoder().encode(env.JWT_REFRESH_SECRET);

export const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

export async function signAccessToken(input: { userId: string; role: Role; sid: string }) {
  const jti = randomUUID();
  const token = await new SignJWT({ role: input.role, sid: input.sid, type: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(input.userId).setJti(jti).setIssuer(ISSUER).setIssuedAt()
    .setExpirationTime(`${env.ACCESS_TOKEN_TTL}s`)
    .sign(accessKey);
  return { token, jti };
}

export async function signRefreshToken(input: { userId: string; sid: string }) {
  const jti = randomUUID();
  const token = await new SignJWT({ sid: input.sid, type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(input.userId).setJti(jti).setIssuer(ISSUER).setIssuedAt()
    .setExpirationTime(`${env.REFRESH_TOKEN_TTL}s`)
    .sign(refreshKey);
  return { token, jti };
}

async function verify<T extends { type: string }>(token: string, key: Uint8Array, type: T["type"]): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, key, { issuer: ISSUER, algorithms: ["HS256"] });
    return payload.type === type ? (payload as unknown as T) : null;
  } catch (e) {
    if (e instanceof joseErrors.JOSEError) return null;
    throw e;
  }
}

export const verifyAccessToken = (t: string) => verify<AccessPayload>(t, accessKey, "access");
export const verifyRefreshToken = (t: string) => verify<RefreshPayload>(t, refreshKey, "refresh");
