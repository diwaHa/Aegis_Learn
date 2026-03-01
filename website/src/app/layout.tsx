import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aegis Learn — Multi-Mode Intelligent AI Platform",
  description:
    "Privacy-First, Cost-Optimized, Multi-Mode AI Platform with PII redaction, structured academic outputs, semantic caching, and on-prem deployment.",
  keywords: "AI Platform, Privacy AI, LLM Middleware, Semantic Caching, PII Redaction, Academic AI, Code Generation",
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  openGraph: {
    title: "Aegis Learn — Multi-Mode Intelligent AI Platform",
    description:
      "Privacy-First, Cost-Optimized, Multi-Mode AI Platform built for enterprise and education.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}

