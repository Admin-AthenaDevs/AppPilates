import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { getBaseStudioConfig } from "@/lib/studio-config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateMetadata(): Metadata {
  const studio = getBaseStudioConfig();
  return {
    title: `${studio.name} | Gestión del estudio`,
    description: `Agenda, alumnos y biblioteca de movimiento para ${studio.name} Pilates.`,
  };
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const studio = getBaseStudioConfig();
  return (
    <html
      lang={studio.locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
