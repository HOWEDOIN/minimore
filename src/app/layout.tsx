import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import AnnouncementBar from "@/components/AnnouncementBar";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
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
      <body className={nunito.variable}>
        <AnnouncementBar />
        {children}
        <CartDrawer />
        <Footer />
      </body>
    </html>
  );
}
