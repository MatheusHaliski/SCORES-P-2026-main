import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SCORES - Basketball Manager",
  description: "Front-end base and data architecture for SCORES game manager",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
