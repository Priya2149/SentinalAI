import "@/app/globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Providers } from "@/components/Providers";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export const metadata: Metadata = {
  title: { default: process.env.NEXT_PUBLIC_APP_NAME ?? "SentinelAI", template: "%s • SentinelAI" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
          <Topbar />
          <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-[15rem_1fr]">
            <Sidebar />
            <main className="p-4 md:p-6">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
