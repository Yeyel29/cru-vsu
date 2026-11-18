import type { Metadata } from "next";
import { GlassNavbar } from "@/components/layout/GlassNavbar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cru VSU — Campus Ministry & Discipleship Network",
  description:
    "Helping students at Visayas State University know Jesus, grow in their faith, and multiply spiritual generations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white font-sans text-cru-charcoal antialiased">
        <GlassNavbar />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
