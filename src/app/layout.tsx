import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import AnnouncementBar from "@/components/AnnouncementBar";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Minimore | Premium Miniature Cosmetics",
  description: "Authentic miniature perfumes and travel-sized luxury skincare.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${fredoka.variable}`}>
        <AnnouncementBar />
        {children}
        <CartDrawer />
        <Footer />
      </body>
    </html>
  );
}
