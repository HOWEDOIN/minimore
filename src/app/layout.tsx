import type { Metadata } from "next";
import localFont from "next/font/local";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import AnnouncementBar from "@/components/AnnouncementBar";
import "./globals.css";

const openSans = localFont({
  src: [
    {
      path: "../fonts/OpenSans/OpenSans-VariableFont_wdth,wght.ttf",
      style: "normal",
    },
    {
      path: "../fonts/OpenSans/OpenSans-Italic-VariableFont_wdth,wght.ttf",
      style: "italic",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

const georgia = localFont({
  src: [
    { path: "../fonts/Georgia/georgia.ttf", weight: "400", style: "normal" },
    { path: "../fonts/Georgia/georgiab.ttf", weight: "700", style: "normal" },
    { path: "../fonts/Georgia/georgiai.ttf", weight: "400", style: "italic" },
    { path: "../fonts/Georgia/georgiaz.ttf", weight: "700", style: "italic" },
  ],
  variable: "--font-display",
  display: "swap",
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
      <body className={`${openSans.variable} ${georgia.variable}`}>
        <AnnouncementBar />
        <main className="main-content">
          {children}
        </main>
        <CartDrawer />
        <Footer />
      </body>
    </html>
  );
}
