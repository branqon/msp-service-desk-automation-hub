import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, Sora } from "next/font/google";

import { AppShell } from "@/components/app-shell";

import "./globals.css";

const sans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const display = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
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
      <body className={`${sans.variable} ${mono.variable} ${display.variable} antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
