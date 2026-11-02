import type { Metadata } from "next";
import { Anton, Merriweather, Courier_Prime } from "next/font/google";
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
  title: "Aarav Sharma · Editorial Profile & Dispatch | Blog Aces",
  description: "ACES Blog - Broadside Technical Gazette, Writer Profile & Editorial Workbench.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${anton.variable} ${merriweather.variable} ${courierPrime.variable}`}>
      <body className="min-h-screen bg-white text-black antialiased flex flex-col selection:bg-black selection:text-white">
        {children}
      </body>
    </html>
  );
}
