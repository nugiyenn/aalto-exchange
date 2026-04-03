import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UniversityProvider } from "../context/UniversityContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aalto Exchange Dashboard",
  description: "Shadow Frontend for Aalto University's MoveON exchange database",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-slate-100 text-slate-900`}
    >
      <body className="min-h-full flex flex-col m-0 p-0">
        <UniversityProvider>{children}</UniversityProvider>
      </body>
    </html>
  );
}
