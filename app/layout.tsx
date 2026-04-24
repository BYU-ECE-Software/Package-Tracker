import type { Metadata } from "next";
import "./globals.css";
import HeaderBar from "@/components/layout/header";
import FooterBar from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "BYU ECE Mail",
  description: "Package tracking for the BYU ECE department",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <HeaderBar />
        <main className="px-6 md:px-12">{children}</main>
        <FooterBar />
      </body>
    </html>
  );
}