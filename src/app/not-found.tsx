import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-site flex min-h-[70vh] flex-col items-start justify-center pt-32">
      <p className="eyebrow">404</p>
      <h1 className="mt-6 font-display text-[clamp(2.4rem,6vw,4.6rem)] font-semibold">This page isn&apos;t in the forge.</h1>
      <p className="mt-4 max-w-lg text-muted">The link may be old or mistyped. Let&apos;s get you back on track.</p>
      <Link href="/" className="btn btn-primary mt-8">Back to home</Link>
    </section>
  );
}
