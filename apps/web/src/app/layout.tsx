import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Syne } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFFFFF",
};

export const metadata: Metadata = {
  title: "STAR — Spatial Temporal Automated Risk System | AI-Native AML Platform",
  description:
    "STAR is an AI-native financial intelligence platform for modern Anti-Money Laundering. Real-time detection powered by Isolation Forest (300 trees, 29 features), Graph Neural Networks, multi-hop tracing, and automated SAR generation.",
  keywords: [
    "AML",
    "Anti-Money Laundering",
    "Graph Intelligence",
    "Financial Crime",
    "AI Detection",
    "GNN",
    "Isolation Forest",
    "GraphSAGE",
    "Transaction Monitoring",
    "Neo4j",
    "Financial Crime Intelligence",
    "Suspicious Activity Report",
    "SAR Generation",
  ],
  openGraph: {
    title: "STAR — AI-Native Financial Crime Intelligence",
    description:
      "Follow the money. Isolation Forest anomaly detection, GNN investigation, and real-time graph intelligence for modern AML compliance.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${syne.variable}`}>
      <body className="antialiased bg-[#FFFFFF] text-[#0F172A]">
        {children}
      </body>
    </html>
  );
}
