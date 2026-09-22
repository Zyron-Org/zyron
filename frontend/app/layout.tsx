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
import { ThemeProvider } from "@/lib/theme-context";
import { ThemedToaster } from "@/components/themed-toaster";
import { Web3ErrorHandler } from "@/components/web3-error-handler";

export const metadata: Metadata = {
  title: "Zyron — Smart Contract Security & Auditing",
  description: "Automated vulnerability scanning and manual review platform for smart contracts.",
};

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('zyron_theme');
    var isLight = stored === 'light' || (!stored && window.matchMedia('(prefers-color-scheme: light)').matches);
    if (isLight) {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.style.colorScheme = 'light';
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.colorScheme = 'dark';
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-bg-void text-text-primary font-sans antialiased min-h-screen selection:bg-accent-scan/20 selection:text-accent-scan">
        <ThemeProvider>
          <Web3ErrorHandler />
          <React.Suspense fallback={null}>
            <AuthProvider>{children}</AuthProvider>
          </React.Suspense>
          <ThemedToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
