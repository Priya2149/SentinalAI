"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useEffect, useState } from "react";
import {
  Home,
  BarChart3,
  ListTree,
  FileText,
  PlaySquare,
  ChevronLeft,
  X,
  TrendingUp,
  Activity,
  Shield,
} from "lucide-react";

type NavItem = { 
  href: string; 
  label: string; 
  icon: React.ElementType; 
  badge?: number;
  description?: string;
  color?: string;
};

const NAV: NavItem[] = [
  { 
    href: "/", 
    label: "Overview", 
    icon: Home, 
    description: "Dashboard home",
    color: "from-blue-500 to-cyan-500"
  },
  { 
    href: "/analytics", 
    label: "Analytics", 
    icon: TrendingUp, 
    description: "Deep insights",
    color: "from-purple-500 to-pink-500"
  },
  { 
    href: "/metrics", 
    label: "Metrics", 
    icon: BarChart3, 
    description: "Performance data",
    color: "from-green-500 to-emerald-500"
  },
  { 
    href: "/logs", 
    label: "Logs", 
    icon: ListTree, 
    badge: 3, 
    description: "System activity",
    color: "from-yellow-500 to-orange-500"
  },
  { 
    href: "/reports", 
    label: "Reports", 
    icon: FileText, 
    description: "Export & compliance",
    color: "from-indigo-500 to-blue-500"
  },
  { 
    href: "/playground", 
    label: "Playground", 
    icon: PlaySquare, 
    description: "Test AI models",
    color: "from-red-500 to-pink-500"
  },
];

/* -------------------- DESKTOP SIDEBAR (md+) -------------------- */
export default function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar:collapsed");
    if (saved) setCollapsed(saved === "1");
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar:collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  return (
    <aside
      aria-label="Sidebar"
      className="
        hidden md:flex shrink-0 h-screen relative
        bg-gradient-to-b from-slate-50/80 via-white/50 to-slate-50/80 
        dark:from-slate-900/80 dark:via-slate-800/50 dark:to-slate-900/80
        backdrop-blur-xl supports-[backdrop-filter]:bg-white/10
        border-r border-slate-200/50 dark:border-slate-700/50
      "
      style={{ width: collapsed ? '80px' : '280px' }}
    >
      <div className="flex h-full flex-col z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <Link href="/" className="inline-flex items-center gap-3 select-none group" aria-label="Home">
            <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold shadow-lg">
              <Shield className="h-5 w-5" />
            </div>
            
            <div className={`transition-all duration-300 ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"}`}>
              <div className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Sentinel
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 -mt-1">
                AI Governance
              </div>
            </div>
          </Link>

          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="h-8 w-8 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
            onClick={() => setCollapsed((s) => !s)}
          >
            <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          <div className={`text-xs font-semibold text-slate-400 dark:text-slate-500 mb-4 transition-all ${collapsed ? "opacity-0" : "opacity-100"}`}>
            NAVIGATION
          </div>

          {NAV.map((item, index) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            
            return (
              <div key={item.href} className="relative">
                <Link
                  href={item.href}
                  className={`
                    relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${active 
                      ? 'bg-white/80 dark:bg-slate-800/80 shadow-lg border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-white' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                    }
                  `}
                >
                  <div className={`
                    relative flex h-8 w-8 items-center justify-center rounded-lg transition-all
                    ${active 
                      ? `bg-gradient-to-br ${item.color} text-white shadow-md` 
                      : 'bg-slate-100 dark:bg-slate-700/50 group-hover:bg-slate-200 dark:group-hover:bg-slate-600'
                    }
                  `}>
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className={`flex-1 transition-all duration-300 ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"}`}>
                    <div className={`font-medium text-sm ${active ? 'text-slate-900 dark:text-white' : ''}`}>
                      {item.label}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 -mt-0.5">
                      {item.description}
                    </div>
                  </div>

                  {item.badge && (
                    <div className={`
                      px-2 py-0.5 rounded-full text-xs font-medium transition-all
                      ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"}
                      ${active 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                        : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                      }
                    `}>
                      {item.badge}
                    </div>
                  )}
                </Link>

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium rounded-lg shadow-lg whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 pointer-events-none">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-4" style={{ opacity: collapsed ? 0 : 1 }}>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl p-4 border border-blue-200/30 dark:border-blue-800/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                System Status
              </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              All systems operational
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                99.9% Uptime
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* -------------------- MOBILE SIDEBAR (< md) -------------------- */
export function SidebarMobile({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => {
    onClose?.();
  }, [pathname, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm md:hidden"
        onClick={onClose}
      />
      
      {/* Panel */}
      <aside
        className="
          fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] md:hidden
          bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl
          border-r border-slate-200/50 dark:border-slate-700/50
          flex flex-col shadow-2xl
        "
        role="dialog"
        aria-modal="true"
      >
        {/* Mobile header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                Sentinel AI
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                AI Governance Platform
              </div>
            </div>
          </div>
          <button
            aria-label="Close menu"
            className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {NAV.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-4 px-4 py-3 rounded-xl transition-all
                  ${active 
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }
                `}
              >
                <div className={`
                  h-10 w-10 rounded-lg flex items-center justify-center transition-all
                  ${active 
                    ? `bg-gradient-to-br ${item.color} text-white shadow-md` 
                    : 'bg-slate-100 dark:bg-slate-700'
                  }
                `}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {item.description}
                  </div>
                </div>
                {item.badge && (
                  <div className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    {item.badge}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}