import Navbar from "@/components/Navbar";
import "./page.css";
import { wooApi } from "@/lib/woocommerce";
import HomePageClient from "./HomePageClient";
import ComingSoonOverlay from "@/components/ComingSoonOverlay";

export default async function Home() {
  const { data: products } = await wooApi.get("products", { per_page: 100 }).catch(() => ({ data: [] }));

  let homepageContent: any = {
    hero_title: "<em class='text-gradient'>More</em> at the price of <em class='text-gradient'>mini.</em>",
    hero_subtitle: "Discover our curated collection of authentic premium cosmetic and fragrance miniatures — perfect for gifting, travel, or simply treating yourself.",
    hero_image: "/images/hero.png",
    is_coming_soon: false
  };

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_WP_URL || 'https://admin.minimore.my'}/wp-json/minimore/v1/homepage`, { 
      next: { revalidate: 60 } 
    });
    if (res.ok) {
      const data = await res.json();
      homepageContent = { ...homepageContent, ...data };
    }
  } catch (err) {
    console.error("Failed to fetch homepage content:", err);
  }

  const sectionOrder: string[] = homepageContent.section_order?.map((s: string) => s === 'why' ? 'contact_locate' : s) || ['hero', 'trending', 'contact_locate'];
  const collectionTabs: string[] = homepageContent.collection_tabs ? homepageContent.collection_tabs.split(',').map((t: string) => t.trim()) : ['Limited Editions', 'Merchandise', 'Miniature', 'Vials', 'Gift Sets', 'Make Up & Cosmetics'];

  return (
    <div className="page-wrapper">
      <Navbar />
      <HomePageClient 
        products={products}
        homepageContent={homepageContent}
        sectionOrder={sectionOrder}
        collectionTabs={collectionTabs}
      />
      {homepageContent.is_coming_soon && <ComingSoonOverlay />}
    </div>
  );
}
