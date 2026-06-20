import Navbar from "@/components/Navbar";
import "./page.css";
import { wooApi } from "@/lib/woocommerce";
import HomePageClient from "./HomePageClient";
import ComingSoonOverlay from "@/components/ComingSoonOverlay";

export default async function Home() {
  const { data: products } = await wooApi.get("products", { per_page: 3 }).catch(() => ({ data: [] }));

  // Fetch dynamic homepage content
  const homepageContent = await fetch(`${process.env.NEXT_PUBLIC_WP_URL || 'https://admin.minimore.my'}/wp-json/minimore/v1/homepage`, { 
    next: { revalidate: 60 } // Cache for 60 seconds
  }).then(res => res.json()).catch(() => ({
    hero_title: "<em class='text-gradient'>More</em> at the price of <em class='text-gradient'>mini.</em>",
    hero_subtitle: "Discover our curated collection of authentic premium cosmetic and fragrance miniatures — perfect for gifting, travel, or simply treating yourself.",
    hero_image: "/images/hero.png",
    is_coming_soon: true // Default to true if fetch fails or is missing, or whatever suits the testing! I'll set it to false as a safe fallback.
  }));

  const sectionOrder: string[] = homepageContent.section_order || ['hero', 'trending', 'why'];

  return (
    <div className="page-wrapper">
      <Navbar />
      <HomePageClient 
        products={products}
        homepageContent={homepageContent}
        sectionOrder={sectionOrder}
      />
      {homepageContent.is_coming_soon && <ComingSoonOverlay />}
    </div>
  );
}
