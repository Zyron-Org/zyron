import type { Metadata } from "next";
import React from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "sonner";
import { Web3ErrorHandler } from "@/components/web3-error-handler";

export const metadata: Metadata = {
  title: "Zyron — Smart Contract Security & Auditing",
  description: "Automated vulnerability scanning and manual review platform for smart contracts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg-void text-text-primary font-sans antialiased min-h-screen selection:bg-accent-scan/20 selection:text-accent-scan">
        <Web3ErrorHandler />
        <React.Suspense fallback={null}>
          <AuthProvider>{children}</AuthProvider>
        </React.Suspense>
        <Toaster position="top-right" theme="dark" richColors />
      </body>
    </html>
  );
}
