import { randomInt } from "node:crypto";

/** Human-friendly unique-ish reference: DRK-261105-4831 */
export function makeReference(prefix: string) {
  const d = new Date();
  const ymd = `${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  return `${prefix}-${ymd}-${randomInt(1000, 10000)}${randomInt(10, 100)}`;
}

/** 6-digit numeric OTP (crypto-strong). */
export const makeOtp = () => String(randomInt(0, 1_000_000)).padStart(6, "0");

export const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export const money = (n: number) => Math.round(n * 100) / 100;
