"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Search, Bell, Menu, Shield, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { SidebarMobile } from "./sidebar";

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [notificationCount] = useState(3);

  useEffect(() => setMounted(true), []);
  const isDark = theme === "dark";

  return (
    <>
      <header
        className="
          sticky top-0 z-40 h-16
          bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl 
          border-b border-slate-200/50 dark:border-slate-700/50
          supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-slate-900/70
        "
        role="banner"
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-transparent to-purple-50/30 dark:from-blue-950/10 dark:via-transparent dark:to-purple-950/10" />
        
        <div className="relative mx-auto flex h-16 items-center gap-4 px-4 sm:px-6">
          {/* Mobile menu button */}
          <button
            type="button"
            aria-label="Open menu"
            className="md:hidden h-10 w-10 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo for mobile */}
          <Link href="/" className="md:hidden flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
              <Shield className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Sentinel
            </span>
          </Link>

          {/* Search bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className={`
              group relative flex w-full items-center gap-3 rounded-2xl transition-all duration-300
              ${searchFocused 
                ? 'bg-white dark:bg-slate-800 border-2 border-blue-200 dark:border-blue-800 shadow-lg shadow-blue-500/10' 
                : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800'
              }
              px-4 py-3
            `}>
              <Search className={`h-4 w-4 transition-colors ${
                searchFocused ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-600'
              }`} />
              <input
                aria-label="Search"
                placeholder="Search anything..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 text-slate-900 dark:text-white"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <div className="flex items-center gap-1">
                <kbd className="hidden sm:inline-flex select-none items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-700 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className="ml-auto flex items-center gap-2">
            {/* Status indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200/50 dark:border-green-800/50">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                All systems operational
              </span>
            </div>

            {/* Notifications */}
            <button
              type="button"
              aria-label="Notifications"
              className="relative h-10 w-10 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
            >
              <Bell className="h-4 w-4" />
              {notificationCount > 0 && (
                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                  {notificationCount}
                </div>
              )}
            </button>

            {/* Theme toggle */}
            <button
              type="button"
              aria-label="Toggle theme"
              onClick={() => mounted && setTheme(isDark ? "light" : "dark")}
              className="h-10 w-10 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
            >
              {mounted && (isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                type="button"
                aria-label="Account menu"
                className="flex items-center gap-3 pl-2 pr-3 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
              >
                <div className="relative">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    SA
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-400 border-2 border-white dark:border-slate-800" />
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    Admin
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    System Administrator
                  </div>
                </div>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Search overlay for mobile */}
        {searchFocused && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 p-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
              <Search className="h-4 w-4 text-blue-500" />
              <input
                placeholder="Search anything..."
                className="flex-1 bg-transparent text-sm outline-none text-slate-900 dark:text-white"
                autoFocus
              />
            </div>
          </div>
        )}
      </header>

      {/* Mobile sidebar */}
      <SidebarMobile open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}