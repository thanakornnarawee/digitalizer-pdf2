import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ภาพไปเป็น pdf | img to pdf ",
  description: "searchable PDF conversion entirely in your browser.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* This wrapper ensures the background covers the whole screen */}
        <div className="main-viewport">
          {children}
        </div>
      </body>
    </html>
  );
}
