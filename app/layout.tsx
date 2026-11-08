import type { Metadata } from "next";
import { Suspense } from "react";
import { Anton, Merriweather, Courier_Prime } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const anton = Anton({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-heading-family",
  display: "swap",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-body-family",
  display: "swap",
});

const courierPrime = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono-family",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ACES Broadsheet Gazette · Technical Publishing Platform & Creator Workbench",
  description:
    "The Official Academic Technical Chronicle & Editorial Publishing Platform. Department of Computer Engineering · ACES PVGCOET Pune.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${merriweather.variable} ${courierPrime.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try {
                var theme = localStorage.getItem('aces_theme') || 'light';
                document.documentElement.setAttribute('data-theme', theme);
              } catch(e){}
            })();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-body)] antialiased flex flex-col selection:bg-[var(--text-main)] selection:text-[var(--bg-canvas)]">
        <AuthProvider>
          <Suspense fallback={<div className="h-20 bg-[var(--bg-card)] border-b-4 border-[var(--border-black)]" />}>
            <Navbar />
          </Suspense>
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
