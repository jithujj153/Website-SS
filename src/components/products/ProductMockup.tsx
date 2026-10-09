import type { ProductSlug } from "@/config/content";

/**
 * Illustrative product UI mockups, built in HTML/CSS in the brand style.
 * No real customer data or logos: all labels and figures are generic and the frame says "Illustrative".
 */

const bar = "rounded-full bg-royal/70";
const line = "h-2 rounded bg-white/10";

function Chrome({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div role="img" aria-label={`Illustrative interface preview: ${title}`} className="overflow-hidden rounded-[var(--radius-lg)] border border-line-strong bg-[#08102a] shadow-[var(--shadow-panel)]">
      <div className="flex items-center gap-2 border-b border-line bg-surface px-4 py-2.5">
        <i className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <i className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <i className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="ml-3 font-mono text-[0.65rem] text-muted">{title}</span>
        <span className="ml-auto rounded-full border border-line px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-muted">Illustrative</span>
      </div>
      <div aria-hidden className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

function Kpi({ label, w = "w-16" }: { label: string; w?: string }) {
  return (
    <div className="rounded-md border border-line bg-surface/70 p-3">
      <p className="text-[0.6rem] uppercase tracking-wider text-muted">{label}</p>
      <div className={`mt-2 h-4 ${w} rounded bg-gradient-to-r from-cyan to-royal`} />
    </div>
  );
}

function Fuel() {
  return (
    <Chrome title="Fuel Pump ERP / Shift overview">
      <div className="grid grid-cols-3 gap-2.5">
        <Kpi label="Nozzle sales" />
        <Kpi label="Tank stock" w="w-20" />
        <Kpi label="Shift variance" w="w-12" />
      </div>
      <div className="mt-3 grid grid-cols-[1.3fr_1fr] gap-2.5">
        <div className="rounded-md border border-line bg-surface/70 p-3">
          <p className="mb-3 text-[0.6rem] uppercase tracking-wider text-muted">Tanks</p>
          {[78, 52, 34].map((h, i) => (
            <div key={i} className="mb-2 flex items-center gap-2">
              <span className="w-10 text-[0.6rem] text-muted">Tank {i + 1}</span>
              <div className="h-2.5 flex-1 rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan to-royal" style={{ width: `${h}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="rounded-md border border-line bg-surface/70 p-3">
          <p className="mb-3 text-[0.6rem] uppercase tracking-wider text-muted">Nozzles</p>
          <div className="grid grid-cols-4 gap-1.5">
            {Array.from({ length: 8 }).map((_, i) => <i key={i} className={`h-5 rounded ${i === 5 ? "bg-cyan/80" : "bg-royal/50"}`} />)}
          </div>
        </div>
      </div>
    </Chrome>
  );
}

function School() {
  const cols = ["Enquiry", "Visit", "Admitted"];
  return (
    <Chrome title="Student Relationship Management / Admissions">
      <div className="grid grid-cols-3 gap-2.5">
        {cols.map((c, ci) => (
          <div key={c} className="rounded-md border border-line bg-surface/70 p-2.5">
            <p className="mb-2 text-[0.6rem] uppercase tracking-wider text-muted">{c}</p>
            {Array.from({ length: 3 - ci + 1 }).map((_, i) => (
              <div key={i} className="mb-2 rounded border border-line bg-bg/60 p-2">
                <div className={`${line} w-3/4`} />
                <div className={`${line} mt-1.5 w-1/2`} />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3 rounded-md border border-line bg-surface/70 p-3">
        <i className="grid h-8 w-8 place-items-center rounded-full bg-royal/60" />
        <div className="flex-1"><div className={`${line} w-1/3`} /><div className={`${line} mt-1.5 w-1/2`} /></div>
        <i className="h-6 w-16 rounded bg-gradient-to-r from-cyan to-royal" />
      </div>
    </Chrome>
  );
}

function Cafe() {
  return (
    <Chrome title="Restaurant & Cafe / Billing">
      <div className="grid grid-cols-[1.4fr_1fr] gap-2.5">
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-md border border-line bg-surface/70 p-2">
              <div className="mb-2 h-8 rounded bg-royal/40" />
              <div className={`${line} w-3/4`} />
            </div>
          ))}
        </div>
        <div className="rounded-md border border-line bg-surface/70 p-3">
          <p className="mb-2 text-[0.6rem] uppercase tracking-wider text-muted">Bill</p>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="mb-2 flex justify-between gap-2"><div className={`${line} w-2/3`} /><div className={`${line} w-1/5`} /></div>
          ))}
          <div className="mt-3 border-t border-line pt-3"><div className="h-7 rounded bg-gradient-to-r from-cyan to-royal" /></div>
        </div>
      </div>
    </Chrome>
  );
}

function Hrms() {
  return (
    <Chrome title="HRMS / Team overview">
      <div className="grid grid-cols-3 gap-2.5">
        <Kpi label="Present today" />
        <Kpi label="On leave" w="w-10" />
        <Kpi label="Pending approvals" w="w-14" />
      </div>
      <div className="mt-3 rounded-md border border-line bg-surface/70 p-3">
        <p className="mb-3 text-[0.6rem] uppercase tracking-wider text-muted">Weekly roster</p>
        {[0, 1, 2, 3].map((r) => (
          <div key={r} className="mb-1.5 grid grid-cols-[1.4fr_repeat(7,1fr)] items-center gap-1.5">
            <div className={`${line} w-3/4`} />
            {Array.from({ length: 7 }).map((_, c) => <i key={c} className={`h-4 rounded ${(r + c) % 5 === 0 ? "bg-white/5" : bar}`} />)}
          </div>
        ))}
      </div>
    </Chrome>
  );
}

export function ProductMockup({ slug }: { slug: ProductSlug }) {
  switch (slug) {
    case "fuel-pump-erp": return <Fuel />;
    case "student-relationship-management": return <School />;
    case "restaurant-cafe-billing": return <Cafe />;
    case "hrms": return <Hrms />;
  }
}
