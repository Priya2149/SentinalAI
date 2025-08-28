import "@/app/globals.css";
import { ReactNode } from "react";

export const metadata = { title: process.env.NEXT_PUBLIC_APP_NAME ?? "SentinelAI" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="max-w-7xl mx-auto p-6">{children}</div>
      </body>
    </html>
  );
}
