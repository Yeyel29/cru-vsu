import type { Metadata } from "next";
import { GlassNavbar } from "@/components/layout/GlassNavbar";
import { PullChainLamp } from "@/components/layout/PullChainLamp";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { THEME_STORAGE_KEY } from "@/components/theme/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cru VSU | Campus Ministry & Discipleship Network",
  description:
    "Helping students at Visayas State University know Jesus, grow in their faith, and multiply spiritual generations.",
};

/** Applies a saved dark theme before first paint so there is no white flash. */
const THEME_INIT_SCRIPT = `(function(){try{if(localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY
)})==="dark"){var r=document.documentElement;r.classList.add("dark");r.style.colorScheme="dark";}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col overflow-x-clip bg-white font-sans text-cru-charcoal antialiased dark:bg-cru-night dark:text-cru-ink">
        <GlassNavbar />
        <PullChainLamp />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
