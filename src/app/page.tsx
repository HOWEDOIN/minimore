import Navbar from "@/components/Navbar";
import "./page.css";
import { wooApi } from "@/lib/woocommerce";
import HomePageClient from "./HomePageClient";
import ComingSoonOverlay from "@/components/ComingSoonOverlay";

export default async function Home() {
  const { data: products } = await wooApi.get("products", { per_page: 100 }).catch(() => ({ data: [] }));

  let homepageContent: any = {
    hero_title: `<span class="hero-line-1"><span class="hero-word-more">More</span> <span class="hero-word-at">at</span></span><span class="hero-line-2">the price of</span><span class="hero-line-3">Mini</span>`,
    hero_subtitle: `<div class="hero-subtitle-main">Authentic Mini Luxury</div><div class="hero-subtitle-categories"><span>Cosmetic</span><span>Beauty</span><span>Skincare</span><span>Perfume</span></div>`,
    hero_images: ["/images/hero.png"],
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
      
      // Fallback for transition: if the backend only sends a single hero_image but no hero_images array
      if (data.hero_image && (!data.hero_images || !Array.isArray(data.hero_images) || data.hero_images.length === 0)) {
        homepageContent.hero_images = [
          data.hero_image, 
          // TEMPORARY MOCK IMAGE for local testing of the carousel UI.
          // The carousel controls only appear when there are 2 or more images.
          "https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=1024&auto=format&fit=crop"
        ];
        homepageContent.hero_links = [
          "/products",
          "/products"
        ];
      }
    }

    // Try fetching from the new 1-click install Carousel Plugin API
    const carouselRes = await fetch(`${process.env.NEXT_PUBLIC_WP_URL || 'https://admin.minimore.my'}/wp-json/minimore/v1/carousel`, { 
      next: { revalidate: 60 } 
    }).catch(() => null);
    
    if (carouselRes && carouselRes.ok) {
      const carouselData = await carouselRes.json();
      if (carouselData.hero_images && Array.isArray(carouselData.hero_images) && carouselData.hero_images.length > 0) {
        homepageContent.hero_images = carouselData.hero_images;
        
        if (carouselData.hero_links && Array.isArray(carouselData.hero_links)) {
          homepageContent.hero_links = carouselData.hero_links;
        }
      }
    }
  } catch (err) {
    console.error("Failed to fetch homepage content:", err);
  }

  // Ensure the hero section matches the redesigned screenshot layout
  homepageContent.hero_title = `<span class="hero-line-1"><span class="hero-word-more">More</span> <span class="hero-word-at">at</span></span><span class="hero-line-2">the price of</span><span class="hero-line-3">Mini</span>`;
  homepageContent.hero_subtitle = `<div class="hero-subtitle-main">Authentic Mini Luxury</div><div class="hero-subtitle-categories"><span>Cosmetic</span><span>Beauty</span><span>Skincare</span><span>Perfume</span></div>`;

  const sectionOrder: string[] = homepageContent.section_order?.map((s: string) => s === 'why' ? 'contact_locate' : s) || ['hero', 'trending', 'contact_locate'];
  const collectionTabs: string[] = ['Miniature', 'Vials', 'Make Up & Cosmetics', 'Gift Sets', 'Limited Editions'];

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
