import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CustomToaster } from "../components/CustomToaster";
import Script from "next/script";
const monaSans = localFont({
  src: [
    {
      path: "../public/fonts/MonaSans-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/MonaSans-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/MonaSans-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-mona-sans",
});

export const metadata: Metadata = {
  title: "ATM360 - Smart ATM Monitoring",
  description: "ATM fault detection and monitoring system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={monaSans.variable}>
      <body className="font-sans antialiased">
        {children}
        <CustomToaster />
      </body>
      <Script src="https://js.puter.com/v2/"></Script>
    </html>
  );
}
