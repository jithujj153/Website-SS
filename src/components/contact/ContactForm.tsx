"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { contactSchema } from "@/lib/contact-schema";
import { interestOptions } from "@/config/content";
import { site } from "@/config/site";
import { ArrowRight, Check } from "@/components/ui/icons";

type Errors = Partial<Record<"name" | "email" | "phone" | "company" | "interest" | "message", string>>;
type Status = "idle" | "sending" | "sent" | "error";

const field =
  "mt-2 w-full rounded-[var(--radius-md)] border border-line-strong bg-bg/70 px-4 py-3 text-text placeholder:text-muted/70 transition-colors focus:border-cyan focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40";
const groups = ["Services", "Products", "Other"] as const;

export function ContactForm() {
  const uid = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState("");
  const [interest, setInterest] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // pre-select the product/service coming from a "Request demo" link: /contact?interest=hrms
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("interest");
    if (q && interestOptions.some((o) => o.value === q)) setInterest(q);
  }, []);

  useEffect(() => {
    if (status === "sent") headingRef.current?.focus();
  }, [status]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries()) as Record<string, string>;
    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors as Record<string, string[] | undefined>;
      const next: Errors = {};
      (["name", "email", "phone", "company", "interest", "message"] as const).forEach((k) => {
        if (f[k]?.[0]) next[k] = f[k]![0];
      });
      setErrors(next);
      setServerError("");
      const first = Object.keys(next)[0];
      if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setErrors({});
    setServerError("");
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fields?: Record<string, string[]> };
      if (res.ok && json.ok) {
        setStatus("sent");
        return;
      }
      if (json.fields) {
        const next: Errors = {};
        for (const [k, v] of Object.entries(json.fields)) if (v?.[0]) (next as Record<string, string>)[k] = v[0];
        setErrors(next);
      }
      setServerError(json.error ?? "Something went wrong. Please try again.");
      setStatus("error");
    } catch {
      setServerError(`Network problem. Please try again, or email ${site.email}.`);
      setStatus("error");
    }
  }

  const err = (k: keyof Errors) => (errors[k] ? `${uid}-${k}-err` : undefined);

  return (
    <div className="panel relative overflow-hidden rounded-[var(--radius-xl)] p-6 sm:p-10">
      <AnimatePresence mode="wait" initial={false}>
        {status === "sent" ? (
          <motion.div key="sent" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="py-10 text-center" role="status">
            <span className="mx-auto grid h-16 w-16 rotate-45 place-items-center rounded-[10px] bg-[image:var(--brand-gradient)]">
              <Check className="-rotate-45 text-white" size={28} />
            </span>
            <h2 ref={headingRef} tabIndex={-1} className="mt-10 font-display text-3xl font-semibold outline-none">Message sent.</h2>
            <p className="mx-auto mt-4 max-w-md text-muted">Thank you. We have your message and will reply to you by email.</p>
            <button type="button" className="btn btn-ghost mt-8" onClick={() => { setStatus("idle"); formRef.current?.reset(); setInterest(""); }}>
              Send another message
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" ref={formRef} onSubmit={onSubmit} noValidate initial={false} exit={{ opacity: 0 }} aria-describedby={serverError ? `${uid}-server` : undefined} className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor={`${uid}-name`} className="text-sm text-text">Name <span className="text-muted">(required)</span></label>
              <input id={`${uid}-name`} name="name" autoComplete="name" required className={field} aria-invalid={!!errors.name} aria-describedby={err("name")} />
              {errors.name && <p id={err("name")} className="mt-1.5 text-sm text-danger">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor={`${uid}-email`} className="text-sm text-text">Email <span className="text-muted">(required)</span></label>
              <input id={`${uid}-email`} name="email" type="email" autoComplete="email" required className={field} aria-invalid={!!errors.email} aria-describedby={err("email")} />
              {errors.email && <p id={err("email")} className="mt-1.5 text-sm text-danger">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor={`${uid}-phone`} className="text-sm text-text">Phone</label>
              <input id={`${uid}-phone`} name="phone" type="tel" autoComplete="tel" className={field} aria-invalid={!!errors.phone} aria-describedby={err("phone")} />
              {errors.phone && <p id={err("phone")} className="mt-1.5 text-sm text-danger">{errors.phone}</p>}
            </div>
            <div>
              <label htmlFor={`${uid}-company`} className="text-sm text-text">Company</label>
              <input id={`${uid}-company`} name="company" autoComplete="organization" className={field} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor={`${uid}-interest`} className="text-sm text-text">I&apos;m interested in <span className="text-muted">(required)</span></label>
              <select id={`${uid}-interest`} name="interest" required value={interest} onChange={(e) => setInterest(e.target.value)} className={`${field} appearance-none`} aria-invalid={!!errors.interest} aria-describedby={err("interest")}>
                <option value="" disabled>Choose a service or product</option>
                {groups.map((g) => (
                  <optgroup key={g} label={g}>
                    {interestOptions.filter((o) => o.group === g).map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {errors.interest && <p id={err("interest")} className="mt-1.5 text-sm text-danger">{errors.interest}</p>}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor={`${uid}-message`} className="text-sm text-text">Message <span className="text-muted">(required)</span></label>
              <textarea id={`${uid}-message`} name="message" rows={6} required className={`${field} resize-y`} placeholder="What are you trying to run, fix or build?" aria-invalid={!!errors.message} aria-describedby={err("message")} />
              {errors.message && <p id={err("message")} className="mt-1.5 text-sm text-danger">{errors.message}</p>}
            </div>

            {/* honeypot: hidden from people and assistive tech, bots fill it */}
            <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
              <label>Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" /></label>
            </div>

            <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <button type="submit" className="btn btn-primary" disabled={status === "sending"} data-cursor="hover">
                {status === "sending" ? "Sending..." : <>Send message <ArrowRight /></>}
              </button>
              <p className="text-xs text-muted">We only use your details to reply to this enquiry.</p>
            </div>
            <p id={`${uid}-server`} role="alert" className={`sm:col-span-2 text-sm text-danger ${serverError ? "" : "hidden"}`}>{serverError}</p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
