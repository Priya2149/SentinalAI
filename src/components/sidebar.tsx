"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import { Home, BarChart3, ListTree, FileText, PlaySquare } from "lucide-react";

type NavItem = { href: string; label: string; icon: React.ElementType; badge?: number };

const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/metrics", label: "Metrics", icon: BarChart3 },
  { href: "/logs", label: "Logs", icon: ListTree, badge: 3 },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/playground", label: "Playground", icon: PlaySquare },
];

export default function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const activeIndex = useMemo(() => Math.max(0, NAV.findIndex((l) => isActive(l.href))), [pathname]);

  return (
    <aside
      aria-label="Sidebar"
      className="
        hidden md:flex shrink-0 w-64
        bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70
        /* no border-r — clean edge */
      "
    >
      <div className="relative flex h-screen w-full flex-col px-2 py-4">
        {/* animated left accent bar */}
        <motion.span
          aria-hidden
          className="absolute left-0 w-[2px] rounded-full bg-foreground/80"
          initial={false}
          animate={{ top: 64 + activeIndex * 48, height: 28, opacity: 0.85 }}
          transition={{ type: "spring", stiffness: 700, damping: 40, mass: 0.5 }}
        />

        {/* section label */}
        <div className="px-3 pb-2">
          <div className="text-[10px] font-medium tracking-widest text-muted-foreground/80">
            NAVIGATION
          </div>
        </div>

        <nav className="relative flex-1">
          {NAV.map(({ href, label, icon: Icon, badge }, i) => {
            const active = isActive(href);
            return (
              <div key={href} className="relative h-12">
                {/* soft active pill */}
                <AnimatePresence initial={false}>
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-y-1 left-2 right-2 rounded-lg bg-muted/70"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 36 }}
                    />
                  )}
                </AnimatePresence>

                <Link
                  href={href}
                  className={`
                    relative z-10 mx-2 flex h-12 items-center gap-3 rounded-lg px-3
                    text-sm transition
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                    ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}
                  `}
                >
                  {/* icon (monochrome, consistent size) */}
                  <span className={`grid h-8 w-8 place-items-center rounded-md ${active ? "bg-muted/80" : "bg-muted/60"}`}>
                    <Icon className="h-4 w-4" />
                  </span>

                  {/* label */}
                  <span className="truncate">{label}</span>

                  {/* tiny numeric badge (mono) */}
                  {badge ? (
                    <span className="ml-auto inline-flex items-center rounded-md bg-foreground/10 px-1.5 py-0.5 text-[10px] font-mono">
                      {badge}
                    </span>
                  ) : null}

                  {/* subtle hover sheen */}
                  <span
                    aria-hidden
                    className="
                      pointer-events-none absolute inset-0 rounded-lg opacity-0
                      transition group-hover:opacity-100
                      [background:radial-gradient(45%_60%_at_10%_50%,hsl(var(--foreground)/.08),transparent_60%)]
                      motion-reduce:hidden
                    "
                  />
                </Link>
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
