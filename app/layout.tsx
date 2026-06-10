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

// ◄ UPDATED BRANDING METADATA FOR BROWSER TABS
export const metadata: Metadata = {
  title: "UNIRESOLVE | Student Issue Management System",
  description: "An official digital resolution portal to file, route, and track university claims, payment challenges, academic requests, and support tickets seamlessly.",
  icons: {
    icon: "/logo.png", // Points to public/logo.png where your logo asset resides
    apple: "/logo.png", // Optional setup copy for iOS home-screen bookmark icons
  },
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
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}