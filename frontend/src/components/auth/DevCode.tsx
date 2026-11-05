"use client";

/** Local development only: the API returns the OTP when SMTP isn't configured. Never rendered in production builds. */
export function DevCode({ code }: { code?: string | null }) {
  if (process.env.NODE_ENV === "production" || !code) return null;
  return <p className="mb-6 rounded-xl border border-dashed border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900">Dev mode — your code is <b className="font-mono tracking-widest">{code}</b></p>;
}
