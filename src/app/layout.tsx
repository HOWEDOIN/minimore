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
  weight: "300 800",
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

const neueHelvetica = localFont({
  src: [
    {
      path: "../fonts/NeueHelvetica/helveticaneuelt_roman.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-neue",
  display: "swap",
});

const quincyCF = localFont({
  src: [
    { path: "../fonts/QuincyCF/Demo_Fonts/Fontspring-DEMO-quincycf-regular.otf", weight: "400", style: "normal" },
    { path: "../fonts/QuincyCF/Demo_Fonts/Fontspring-DEMO-quincycf-regularitalic.otf", weight: "400", style: "italic" },
    { path: "../fonts/QuincyCF/Demo_Fonts/Fontspring-DEMO-quincycf-medium.otf", weight: "500", style: "normal" },
    { path: "../fonts/QuincyCF/Demo_Fonts/Fontspring-DEMO-quincycf-mediumitalic.otf", weight: "500", style: "italic" },
    { path: "../fonts/QuincyCF/Demo_Fonts/Fontspring-DEMO-quincycf-bold.otf", weight: "700", style: "normal" },
    { path: "../fonts/QuincyCF/Demo_Fonts/Fontspring-DEMO-quincycf-bolditalic.otf", weight: "700", style: "italic" },
  ],
  variable: "--font-quincy",
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
      <body className={`${openSans.variable} ${georgia.variable} ${neueHelvetica.variable} ${quincyCF.variable}`}>
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
