/** Only allow same-site relative redirects (blocks open-redirects like //evil.com or /\evil.com). */
export function safeNext(v: string | null | undefined, fallback = "/") {
  if (!v || !v.startsWith("/") || v.startsWith("//") || v.startsWith("/\\") || v.includes("://")) return fallback;
  if (v.startsWith("/login") || v.startsWith("/register") || v.startsWith("/api/")) return fallback;
  return v.slice(0, 300);
}
