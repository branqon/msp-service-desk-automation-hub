import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { AppShell } from "@/components/app-shell";

import "./globals.css";

const sans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "MSP Service Desk Automation Hub",
    template: "%s | MSP Service Desk Automation Hub",
  },
  description:
    "Portfolio project demonstrating AI-assisted MSP service desk workflows, SLA routing, approvals, and reporting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
