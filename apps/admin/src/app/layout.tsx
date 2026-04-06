import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { auth, signOut } from "@resenha/auth";
import { Sidebar } from "@resenha/ui";
import { redirect } from "next/navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Admin | Resenha FC",
  description: "Painel administrativo Resenha FC.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Simple check to make sure login is completely un-nested
  // The route protection relies on edge middleware and page-level checks.
  return (
    <html lang="pt-BR" className={`${inter.variable} ${outfit.variable}`}>
      <body className="antialiased selection:bg-blue-500 selection:text-cream-100 h-screen overflow-hidden text-cream-100">
        {children}
      </body>
    </html>
  );
}
