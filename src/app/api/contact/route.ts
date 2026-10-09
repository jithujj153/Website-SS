import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { contactSchema } from "@/lib/contact-schema";
import { interestLabel } from "@/config/content";
import { site } from "@/config/site";

export const runtime = "nodejs";

/* ---------- rate limiting ----------
   5 submissions / 10 minutes per IP. Uses Upstash Redis (REST) when configured, which is durable across
   serverless instances; otherwise falls back to an in-memory map (fine for one instance / dev). */
const WINDOW_S = 600;
const MAX = 5;
const mem = new Map<string, { n: number; reset: number }>();

async function limited(ip: string): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      const key = `ss:contact:${ip}`;
      const res = await fetch(`${url}/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify([["INCR", key], ["EXPIRE", key, WINDOW_S, "NX"]]),
      });
      const out = (await res.json()) as { result: number }[];
      return (out?.[0]?.result ?? 0) > MAX;
    } catch {
      /* fall through to memory */
    }
  }
  const now = Date.now();
  const hit = mem.get(ip);
  if (!hit || hit.reset < now) {
    mem.set(ip, { n: 1, reset: now + WINDOW_S * 1000 });
    if (mem.size > 5000) for (const [k, v] of mem) if (v.reset < now) mem.delete(k);
    return false;
  }
  hit.n += 1;
  return hit.n > MAX;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").slice(0, 200);

export async function POST(req: Request) {
  // basic same-origin check (blocks cross-site form posts)
  const origin = req.headers.get("origin");
  if (origin && process.env.NODE_ENV === "production") {
    const host = req.headers.get("host");
    try {
      if (new URL(origin).host !== host) return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
    } catch {
      return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
    }
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // honeypot: pretend success so bots learn nothing
  if (typeof body === "object" && body && "website" in body && (body as { website?: unknown }).website) {
    return NextResponse.json({ ok: true });
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
  if (await limited(ip)) {
    return NextResponse.json({ ok: false, error: "Too many requests. Please try again in a few minutes, or email us directly." }, { status: 429 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Please check the highlighted fields.", fields: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  const d = parsed.data;

  // Delivery: SMTP through the Hostinger mailbox (preferred), or Resend if that is what is configured instead.
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL || smtpUser;
  const to = process.env.CONTACT_TO_EMAIL || site.email;
  const useSmtp = Boolean(smtpUser && smtpPass);
  if ((!useSmtp && !resendKey) || !from) {
    console.error("[contact] No mail delivery configured: set SMTP_USER and SMTP_PASS (or RESEND_API_KEY and CONTACT_FROM_EMAIL).");
    return NextResponse.json({ ok: false, error: `We could not send that just now. Please email ${site.email} directly.` }, { status: 503 });
  }

  const interest = interestLabel(d.interest);
  const rows: [string, string][] = [
    ["Name", d.name],
    ["Email", d.email],
    ["Phone", d.phone || "-"],
    ["Company", d.company || "-"],
    ["Interested in", interest],
  ];
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#111">
    <h2 style="margin:0 0 12px">New enquiry from the System-Smiths website</h2>
    <table cellpadding="6" style="border-collapse:collapse">${rows.map(([k, v]) => `<tr><td style="color:#555">${k}</td><td><strong>${esc(v)}</strong></td></tr>`).join("")}</table>
    <h3 style="margin:18px 0 6px">Message</h3>
    <p style="white-space:pre-wrap;margin:0">${esc(d.message)}</p></div>`;
  const text = `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nMessage:\n${d.message}`;

  const subject = `New enquiry: ${oneLine(interest)} (${oneLine(d.name)})`;
  try {
    if (useSmtp) {
      const port = Number(process.env.SMTP_PORT) || 465;
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.hostinger.com",
        port,
        secure: port === 465, // 465 = implicit TLS (Hostinger default); 587 = STARTTLS
        auth: { user: smtpUser, pass: smtpPass },
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 15_000,
      });
      await transport.sendMail({ from, to, replyTo: d.email, subject, html, text });
    } else {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: [to], reply_to: d.email, subject, html, text }),
      });
      if (!res.ok) {
        console.error("[contact] Resend error", res.status, await res.text());
        return NextResponse.json({ ok: false, error: `We could not send that just now. Please email ${site.email} directly.` }, { status: 502 });
      }
    }
  } catch (e) {
    console.error("[contact] send failed", e);
    return NextResponse.json({ ok: false, error: `We could not send that just now. Please email ${site.email} directly.` }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
