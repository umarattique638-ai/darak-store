import nodemailer, { type Transporter } from "nodemailer";
import { allowedOrigins, env, isProd, notifyEmails } from "../config/env.js";
import type { DesignDTO, LeadDTO, OrderDTO } from "../dto/index.js";

let transporter: Transporter | null = null;
function getTransporter() {
  if (!env.SMTP_HOST) return null;
  transporter ??= nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });
  return transporter;
}

const site = () => allowedOrigins[0] ?? "";
/** Escape user-supplied text before it goes into an HTML email. */
const esc = (v: unknown) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const fmt = (n: number) => `${env.CURRENCY} ${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const layout = (title: string, body: string, cta?: { label: string; url: string }) => `
<!doctype html><html><body style="margin:0;background:#f6f1ea;font-family:Georgia,'Times New Roman',serif;color:#1d1b19">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:36px 14px">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:18px;padding:36px;border:1px solid #ebe3d8">
      <tr><td style="font-size:24px;font-weight:700;letter-spacing:.5px">Al Sharq<span style="color:#8a1538">.</span> <span style="font-size:13px;color:#9a8f82;letter-spacing:3px">EXHIBITION</span></td></tr>
      <tr><td style="padding-top:22px;font-size:21px;font-weight:700">${title}</td></tr>
      <tr><td style="padding-top:12px;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#5b544c">${body}</td></tr>
      ${cta ? `<tr><td style="padding-top:26px"><a href="${cta.url}" style="background:#8a1538;color:#fff;text-decoration:none;font-family:Arial,sans-serif;font-weight:700;padding:14px 26px;border-radius:999px;display:inline-block">${cta.label}</a></td></tr>` : ""}
      <tr><td style="padding-top:28px;font-family:Arial,sans-serif;font-size:12px;color:#9a8f82">Al Sharq Exhibition · Salwa Road, Doha, Qatar</td></tr>
    </table>
  </td></tr></table>
</body></html>`;

async function send(to: string | string[], subject: string, html: string, text: string, replyTo?: string) {
  const t = getTransporter();
  if (!t) {
    if (isProd) console.error("[mail] SMTP is not configured — email NOT sent:", subject);
    else console.info(`\n📧 [dev mail] to=${[to].flat().join(",")} | ${subject}\n${text}\n`);
    return;
  }
  try {
    await Promise.race([
      t.sendMail({ from: env.MAIL_FROM, to, subject, html, text, replyTo }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("SMTP timeout")), 10_000)),
    ]);
  } catch (e) {
    console.error("[mail] failed:", subject, e);
  }
}

const itemsTable = (o: OrderDTO) =>
  `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;border-collapse:collapse">${o.items
    .map((i: OrderDTO["items"][number]) => `<tr><td style="padding:8px 0;border-bottom:1px solid #f0e9df">${esc(i.name)}${i.color ? ` · ${esc(i.color)}` : ""} × ${i.quantity}</td><td align="right" style="padding:8px 0;border-bottom:1px solid #f0e9df">${fmt(i.lineTotal)}</td></tr>`)
    .join("")}
    <tr><td style="padding:8px 0">Shipping</td><td align="right">${o.shippingFee ? fmt(o.shippingFee) : "Free"}</td></tr>
    <tr><td style="padding:8px 0;font-weight:700;color:#1d1b19">Total</td><td align="right" style="font-weight:700;color:#1d1b19">${fmt(o.total)}</td></tr></table>`;

const paymentNote = (o: OrderDTO) =>
  o.paymentMethod === "bank_transfer"
    ? `<p style="background:#f6f1ea;border-radius:12px;padding:14px 16px;margin-top:16px"><b>Bank transfer details</b><br>Bank: ${esc(env.BANK_NAME)}<br>Account name: ${esc(env.BANK_ACCOUNT_NAME)}<br>IBAN: ${esc(env.BANK_IBAN)}<br>Reference: <b>${esc(o.orderNumber)}</b></p>`
    : `<p style="margin-top:16px">Payment: <b>Cash on delivery</b> — please keep ${fmt(o.total)} ready.</p>`;

const STATUS_TEXT: Record<string, string> = {
  pending: "We received your order.",
  confirmed: "Your order is confirmed and being prepared.",
  processing: "Your furniture is being prepared and quality-checked.",
  shipped: "Your order is on its way!",
  delivered: "Your order has been delivered. Enjoy your new piece!",
  cancelled: "Your order has been cancelled.",
};

export const mailService = {
  async sendOtp(to: string, name: string, code: string, purpose: "verify_email" | "reset_password") {
    const title = purpose === "verify_email" ? "Your verification code" : "Reset your password";
    const intro = purpose === "verify_email" ? "Use this code to verify your email address." : "Use this code to reset your password. If you didn't ask for this, ignore this email.";
    const body = `Hi ${esc(name)},<br>${intro}<div style="margin:22px 0;font-size:34px;letter-spacing:10px;font-weight:700;color:#8a1538;font-family:Arial,sans-serif">${code}</div>The code expires in ${env.OTP_TTL_MINUTES} minutes. Never share it with anyone.`;
    await send(to, `${code} is your Al Sharq Exhibition code`, layout(title, body), `${title}: ${code} (expires in ${env.OTP_TTL_MINUTES} minutes)`);
  },

  async orderPlaced(o: OrderDTO, name: string) {
    const url = `${site()}/track?order=${encodeURIComponent(o.orderNumber)}`;
    const body = `Hi ${esc(name)}, thank you for your order <b>${esc(o.orderNumber)}</b>.${itemsTable(o)}${paymentNote(o)}`;
    await send(o.email, `Order ${o.orderNumber} received — Al Sharq Exhibition`, layout("Thank you for your order", body, { label: "Track your order", url }), `Order ${o.orderNumber} received. Total ${fmt(o.total)}. Track: ${url}`);
    const admins = notifyEmails();
    if (admins.length) {
      const a = o.shippingAddress as Record<string, string>;
      const adminBody = `<b>${esc(o.orderNumber)}</b> · ${esc(o.paymentMethod === "cod" ? "Cash on delivery" : "Bank transfer")}<br>${esc(a.fullName)} · ${esc(a.phone)} · ${esc(o.email)}<br>${esc(a.street)}, ${esc(a.area)}, ${esc(a.city)}${itemsTable(o)}`;
      await send(admins, `🛋️ New order ${o.orderNumber} — ${fmt(o.total)}`, layout("New order received", adminBody, { label: "Open in dashboard", url: `${site()}/dashboard/orders/${o.id}` }), `New order ${o.orderNumber} ${fmt(o.total)}`, o.email);
    }
  },

  async orderStatus(o: OrderDTO, name: string) {
    const url = `${site()}/track?order=${encodeURIComponent(o.orderNumber)}`;
    const track = o.trackingNumber ? `<br>Tracking: <b>${esc(o.courier)} ${esc(o.trackingNumber)}</b>` : "";
    const body = `Hi ${esc(name)},<br>${STATUS_TEXT[o.status] ?? ""}<br>Order <b>${esc(o.orderNumber)}</b> — status: <b>${esc(o.status)}</b>${track}`;
    await send(o.email, `Order ${o.orderNumber}: ${o.status}`, layout("Order update", body, { label: "Track order", url }), `Order ${o.orderNumber} is now ${o.status}. ${url}`);
  },

  async designRequested(d: DesignDTO) {
    await send(d.email, `Custom design request ${d.requestNumber} received`, layout("We received your design request", `Hi ${esc(d.name)},<br>Thank you! Our designers will review request <b>${esc(d.requestNumber)}</b> and send you a quote within 2 business days.`), `Request ${d.requestNumber} received.`);
    const admins = notifyEmails();
    if (admins.length) {
      const body = `<b>${esc(d.requestNumber)}</b> · ${esc(d.furnitureType)} × ${d.quantity}<br>${esc(d.name)} · ${esc(d.phone)} · ${esc(d.email)}<br>Size: ${d.dimensions?.width ?? "-"} × ${d.dimensions?.depth ?? "-"} × ${d.dimensions?.height ?? "-"} cm · Material: ${esc(d.material)} · Colour: ${esc(d.color)} · Budget: ${d.budget ? fmt(d.budget) : "-"}<p style="white-space:pre-wrap;background:#f6f1ea;padding:12px;border-radius:10px">${esc(d.description)}</p>`;
      await send(admins, `✏️ Custom design request ${d.requestNumber}`, layout("New custom design request", body, { label: "Open in dashboard", url: `${site()}/dashboard/designs` }), `New design request ${d.requestNumber}`, d.email);
    }
  },

  async designUpdated(d: DesignDTO) {
    const quote = d.quotedPrice ? `<br>Quoted price: <b>${fmt(d.quotedPrice)}</b>` : "";
    await send(d.email, `Update on design request ${d.requestNumber}`, layout("Your custom design request", `Hi ${esc(d.name)},<br>Status: <b>${esc(d.status)}</b>${quote}${d.adminNote ? `<p style="white-space:pre-wrap">${esc(d.adminNote)}</p>` : ""}`, { label: "View in your account", url: `${site()}/account/designs` }), `Request ${d.requestNumber}: ${d.status}`);
  },

  async leadReceived(l: LeadDTO) {
    const admins = notifyEmails();
    if (!admins.length) return;
    const body = `${esc(l.name)} · ${esc(l.email)} · ${esc(l.phone)}<br><b>${esc(l.subject)}</b><p style="white-space:pre-wrap;background:#f6f1ea;padding:12px;border-radius:10px">${esc(l.message)}</p>`;
    await send(admins, `📩 New message from ${l.name}`, layout("New contact message", body, { label: "Open in dashboard", url: `${site()}/dashboard/leads` }), `${l.name}: ${l.message}`, l.email);
  },

  async lowStock(products: { name: string; sku: string; stock: number }[]) {
    const admins = notifyEmails();
    if (!admins.length || !products.length) return;
    const body = products.map((p) => `${esc(p.name)} (${esc(p.sku)}) — <b>${p.stock}</b> left`).join("<br>");
    await send(admins, `⚠️ Low stock: ${products.length} product(s)`, layout("Low stock alert", body, { label: "Open inventory", url: `${site()}/dashboard/inventory` }), body.replace(/<[^>]+>/g, ""));
  },
};
