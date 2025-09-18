"use client";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4">
      <div className="font-medium">SentinelAI</div>
      <Button onClick={() => setTheme(isDark ? "light" : "dark")} aria-label="Toggle theme">
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
        <span className="ml-2 hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
      </Button>
    </header>
  );
}
