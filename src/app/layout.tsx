import type { Metadata } from "next";
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
      <body className="min-h-screen bg-white font-sans text-cru-charcoal antialiased">
        {children}
      </body>
    </html>
  );
}
