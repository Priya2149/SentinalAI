"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileText, Home, ListTree } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/logs", label: "Logs", icon: ListTree },
  { href: "/metrics", label: "Metrics", icon: BarChart3 },
  { href: "/reports", label: "Reports", icon: FileText },
    { href: "/playground", label: "Playground", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 border-r border-border hidden md:block">
      <div className="p-3 font-semibold">Navigation</div>
      <nav className="space-y-1 p-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={cn("flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted/60",
                active && "bg-muted/80 font-medium")}>
              <Icon size={18} />
              <span>{label}</span>
              {active && (
                <motion.div layoutId="active-pill" className="ml-auto h-1 w-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
