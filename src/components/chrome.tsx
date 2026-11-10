import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** The Airlock mark: a sealed ring with a red core and an amber latch. */
export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="7" fill="var(--text)" />
      <circle cx="16" cy="16" r="9.5" fill="none" stroke="var(--knowledge-fill)" strokeWidth="2.6" />
      <circle cx="16" cy="16" r="3.6" fill="var(--safety-fill)" />
      <rect x="14.7" y="4.6" width="2.6" height="5" rx="1" fill="var(--core-fill)" />
    </svg>
  );
}

export function TopBar({ active }: { active: "home" | "console" }) {
  const links = [
    { href: "/#how", label: "How it works" },
    { href: "/#endpoints", label: "Endpoints" },
    { href: "/#scenarios", label: "Scenarios" },
    { href: "/#reproduce", label: "Run it" },
  ];
  return (
    <header
      className="sticky top-0 z-30 border-b"
      style={{ borderColor: "var(--line-soft)", background: "rgba(255,255,255,0.92)", backdropFilter: "saturate(1.4) blur(10px)" }}
    >
      <div className="mx-auto flex h-14 max-w-[1240px] items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Airlock home">
          <Mark size={26} />
          <span className="display text-[22px] font-bold leading-none" style={{ color: "var(--text)" }}>
            Airlock
          </span>
        </Link>
        <nav className="hidden items-center gap-5 md:flex" aria-label="Sections">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[13px] font-medium no-underline transition-colors hover:underline"
              style={{ color: "var(--text-dim)" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto">
          <Link
            href="/console"
            aria-current={active === "console" ? "page" : undefined}
            className="tap inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-[13px] font-semibold no-underline"
            style={
              active === "console"
                ? { background: "var(--bg-sunken)", color: "var(--text)", border: "1px solid var(--line)" }
                : { background: "var(--text)", color: "#ffffff", border: "1px solid var(--text)" }
            }
          >
            {active === "console" ? "Console" : "Open the console"}
            {active !== "console" && <ArrowRight size={15} strokeWidth={2.2} aria-hidden />}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t" style={{ borderColor: "var(--line-soft)" }}>
      <div className="mx-auto flex max-w-[1240px] flex-col gap-3 px-4 py-8 text-[12px] sm:flex-row sm:items-center sm:justify-between sm:px-6" style={{ color: "var(--text-faint)" }}>
        <div className="flex items-center gap-2.5">
          <Mark size={20} />
          <span>Airlock · a Clocked Build Challenge entry · built on the Clocked API by Rezolve.ai</span>
        </div>
        <span>All ticket data is fictional. Clocked calls run server-side only; keys never reach the browser.</span>
      </div>
    </footer>
  );
}
