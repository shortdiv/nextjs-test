import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MeAI Dashboard",
  description: "Internal dashboard for MeAI platform metrics",
  keywords: ["dashboard", "metrics", "analytics"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="border-b border-gray-200 bg-white px-6 py-3 flex items-center justify-between">
          <span className="font-semibold text-lg">MeAI</span>
          <div className="flex gap-4 text-sm">
            <a href="/" className="text-gray-600 hover:text-black">Home</a>
            <a href="/dashboard" className="text-gray-600 hover:text-black">Dashboard</a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
