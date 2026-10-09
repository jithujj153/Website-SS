/**
 * All marketing copy lives here so wording stays identical everywhere.
 * Verified facts (the ONLY numbers used on the site): 40+ projects delivered, 20+ clients served,
 * MVP in as little as 2 days (timelines vary with scope).
 */

export const stats = [
  { id: "projects", value: 40, suffix: "+", eyebrow: "", label: "projects delivered", note: "" },
  { id: "clients", value: 20, suffix: "+", eyebrow: "", label: "clients served", note: "" },
  { id: "mvp", value: 2, suffix: " days", eyebrow: "MVP in as little as", label: "", note: "Timelines vary with scope." },
] as const;

/** Full sentence form of the proof points (used in metadata, a11y labels, blog copy). */
export const proofPoints = {
  projects: "40+ projects delivered",
  clients: "20+ clients served",
  mvp: "MVP in as little as 2 days",
  mvpNote: "Timelines vary with scope.",
} as const;

export type ServiceIcon = "cog" | "cube" | "migrate" | "factory" | "browser" | "boxes" | "bolt";

export interface Service {
  slug: string;
  title: string;
  short: string; // card heading variant when title is long
  icon: ServiceIcon;
  value: string; // one-line value
  description: string;
}

export const services: Service[] = [
  {
    slug: "workflow-automation",
    title: "Workflow Automation",
    short: "Workflow Automation",
    icon: "cog",
    value: "Turn repeated manual steps into systems that run themselves.",
    description:
      "We map how work really moves through your business, then automate the hand-offs, approvals, reminders and reports that eat your team's day.",
  },
  {
    slug: "custom-erp",
    title: "Custom ERP Solutions",
    short: "Custom ERP",
    icon: "cube",
    value: "One system shaped around how you operate, not the other way round.",
    description:
      "Sales, purchasing, stock, accounts and people in a single system built for your processes, and extended as your business grows.",
  },
  {
    slug: "platform-migration",
    title: "Platform Migration",
    short: "Platform Migration",
    icon: "migrate",
    value: "Move to modern software without losing your data or your week.",
    description:
      "Careful migration from spreadsheets, legacy desktop tools and ageing platforms to a maintainable stack, with parallel running and a clear cut-over plan.",
  },
  {
    slug: "factory-management",
    title: "Factory Management Systems",
    short: "Factory Management",
    icon: "factory",
    value: "See production, stock and downtime on one screen.",
    description:
      "Work orders, material tracking, machine status and shift reporting that connect the shop floor to the office.",
  },
  {
    slug: "website-development",
    title: "Website Development",
    short: "Website Development",
    icon: "browser",
    value: "Fast, clear websites that earn enquiries.",
    description:
      "Performance-minded sites and web apps, built to be found, easy to maintain, and connected to the systems running behind your business.",
  },
  {
    slug: "inventory-optimization",
    title: "Inventory Optimization & Management",
    short: "Inventory Optimization",
    icon: "boxes",
    value: "Know what you have, where it is, and what to reorder.",
    description:
      "Live stock tracking, reorder points, batch and location control, and reports that make purchasing decisions obvious.",
  },
  {
    slug: "automation-platforms",
    title: "Automation Platforms",
    short: "Automation Platforms",
    icon: "bolt",
    value: "Reusable automation foundations your team can build on.",
    description:
      "Platforms that connect your tools, schedule jobs and raise alerts, so the next workflow becomes configuration instead of a brand-new project.",
  },
];

export type ProductSlug =
  | "fuel-pump-erp"
  | "student-relationship-management"
  | "restaurant-cafe-billing"
  | "hrms";

export interface Product {
  slug: ProductSlug;
  name: string;
  audience: string;
  tagline: string;
  summary: string;
  features: string[];
}

export const products: Product[] = [
  {
    slug: "fuel-pump-erp",
    name: "Fuel Pump ERP",
    audience: "For fuel stations",
    tagline: "Pumps, tanks, shifts and billing in one system.",
    summary:
      "A ready-to-deploy system for running a fuel station. It keeps nozzle sales, tank stock and shift handovers reconciled, so the books match the forecourt.",
    features: [
      "Nozzle-wise sales and shift handover",
      "Tank stock and dip reconciliation",
      "Credit customers and invoicing",
      "Daily, shift and product reports",
      "Role-based access for staff and owners",
    ],
  },
  {
    slug: "student-relationship-management",
    name: "Student Relationship Management",
    audience: "For Montessori schools",
    tagline: "Admissions, parents and progress, kept together.",
    summary:
      "A school-friendly system that follows a child from first enquiry to daily updates, so staff and parents always work from the same record.",
    features: [
      "Enquiry-to-admission pipeline",
      "Student and guardian records",
      "Attendance and daily updates",
      "Fee schedules and receipts",
      "Parent communication log",
    ],
  },
  {
    slug: "restaurant-cafe-billing",
    name: "Restaurant & Cafe Management / Billing System",
    audience: "For restaurants and cafes",
    tagline: "Orders, tables and bills that keep up with the rush.",
    summary:
      "Take orders, send them to the kitchen and bill quickly, with menu and ingredient stock tracked behind the counter.",
    features: [
      "Table and counter ordering",
      "Kitchen order tickets",
      "Fast billing with split and tax handling",
      "Menu and ingredient stock",
      "End-of-day sales summary",
    ],
  },
  {
    slug: "hrms",
    name: "HRMS",
    audience: "For growing teams",
    tagline: "People, attendance, leave and payroll in one place.",
    summary:
      "A human-resources system that keeps employee records, attendance and leave tidy, and gets payroll inputs ready without spreadsheet gymnastics.",
    features: [
      "Employee records and documents",
      "Attendance and shift rosters",
      "Leave requests and approvals",
      "Payroll-ready summaries",
      "Simple self-service for staff",
    ],
  },
];

export const process = [
  { step: "Discover", line: "We sit with your team and map how work really happens." },
  { step: "Design", line: "Screens, data and workflows agreed in plain language before code." },
  { step: "Build", line: "Short cycles and working software early, AI-assisted where it helps." },
  { step: "Deploy", line: "Careful cut-over, training and a clean hand-off." },
  { step: "Support", line: "We stay close as your operation changes." },
] as const;

/** The five story scenes: copy is short (<= ~15 words) and rendered as real DOM text. */
export const storyCopy = {
  chaos: { kicker: "01 / The mess", line: "Every business starts messy." },
  forge: { kicker: "02 / The forge", line: "We take the mess. We forge the system." },
  build: { kicker: "03 / The build", line: "Software that runs your operations, not just your website." },
  city: { kicker: "04 / The products", line: "Ready-to-run products, built from the same forge." },
  live: { kicker: "05 / Live", line: "Have an idea? Let's build it." },
} as const;

/** SCENE 1 (factory variant) and the matching SCENE 2 copy. Overlay lines are real DOM text, max ~15 words. */
export const floorCopy = {
  kicker: "01 / The floor",
  beat1: "A factory runs on a thousand moving parts.",
  beat3: "He can't see what's happening on his own floor.",
  tablet: "I need to see everything.",
  forge: { kicker: "02 / The forge", line: "We take the guesswork. We forge the system." },
  /** words for the no-3D / screen-reader version of the story */
  summary:
    "A busy factory floor: racks and a forklift in inventory, CNC machines, a press, robot arms and a conveyor in production, an inspection table in QC. The floor manager stands in the middle with a clipboard and a radio, and cannot see which order is where. Questions pile up: Which orders are running right now? Is the raw material actually in stock? Which job is stuck on that machine? Which orders will miss the deadline? How many parts failed QC today? Why is that machine idle? The client is calling, where is their order? Who changed this job card?",
} as const;

/** The five buildings of the Product City. `interest` is the contact-form pre-selection. */
export const cityBuildings = [
  {
    id: "fuel",
    kind: "Fuel station",
    name: "Fuel Pump ERP",
    line: "Pumps, tanks, shifts and billing in one system.",
    interest: "fuel-pump-erp",
  },
  {
    id: "school",
    kind: "Montessori school",
    name: "Student Relationship Management",
    line: "Admissions, parents and progress, kept together.",
    interest: "student-relationship-management",
  },
  {
    id: "cafe",
    kind: "Cafe",
    name: "Restaurant & Cafe Management / Billing",
    line: "Orders, tables and bills that keep up with the rush.",
    interest: "restaurant-cafe-billing",
  },
  {
    id: "tower",
    kind: "Office tower",
    name: "HRMS",
    line: "People, attendance, leave and payroll in one place.",
    interest: "hrms",
  },
  {
    id: "factory",
    kind: "Factory",
    name: "Factory Management Systems",
    line: "Production, stock and downtime on one screen.",
    interest: "factory-management",
  },
] as const;

export type CityBuildingId = (typeof cityBuildings)[number]["id"];

export const overview = {
  heading: "Software for businesses that run on operations.",
  body:
    "System-Smiths is a software and automation company. We build custom business systems for operations-heavy businesses, and we ship our own ready-to-deploy SaaS products for the sectors we know best.",
  pillars: [
    {
      title: "Custom systems",
      body: "ERP, workflow automation, migrations and factory systems, designed around the way you actually work.",
    },
    {
      title: "Ready-to-run products",
      body: "Fuel Pump ERP, a Montessori school system, restaurant and cafe billing, and HRMS: deploy something proven, then tailor it.",
    },
    {
      title: "Fast, careful delivery",
      body: "Tight scope, reusable modules and AI-assisted engineering get a working MVP in front of you quickly, without cutting quality.",
    },
  ],
} as const;

export interface InterestOption {
  value: string;
  label: string;
  group: "Services" | "Products" | "Other";
}

export const interestOptions: InterestOption[] = [
  ...services.map((s) => ({ value: s.slug, label: s.title, group: "Services" as const })),
  ...products.map((p) => ({ value: p.slug, label: p.name, group: "Products" as const })),
  { value: "something-else", label: "Something else / not sure yet", group: "Other" as const },
];

export function interestLabel(value: string): string {
  return interestOptions.find((o) => o.value === value)?.label ?? value;
}
