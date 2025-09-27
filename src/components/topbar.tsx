"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

// If you have a dedicated logo font, import and use it here:
// import { logoFont } from "@/lib/fonts";
const logoClass = ""; // e.g. logoFont.className

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = theme === "dark";

  return (
    <header
      className="
        sticky top-0 z-40 h-14
        bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/75
        border-b border-border   /* ← horizontal separator */
      "
    >
      <div className="mx-auto flex h-14 items-center gap-3 px-3 sm:px-4">
        {/* wordmark (no gradient) */}
        <Link href="/" className="inline-flex items-center gap-2 select-none">
          <span
            className={`text-[15px] sm:text-[16px] font-semibold tracking-tight leading-none ${logoClass}`}
            style={{ letterSpacing: "-0.02em" }}
          >
            Sentinel<span className="opacity-70"> AI</span>
          </span>
        </Link>

        {/* spacer */}
        <div className="ml-auto" />

        {/* theme toggle — round, no border/square */}
        <button
          type="button"
          aria-label="Toggle theme"
          onClick={() => mounted && setTheme(isDark ? "light" : "dark")}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted/60 transition-colors"
        >
          {mounted ? (isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />) : <span className="h-5 w-5" />}
        </button>

        {/* avatar stub */}
        <div className="inline-grid h-8 w-8 place-items-center rounded-full bg-muted text-[10px] font-semibold">
          SA
        </div>
      </div>
    </header>
  );
}
