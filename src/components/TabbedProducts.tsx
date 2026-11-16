"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import "./TabbedProducts.css";
import { getProductImage } from "@/utils/imageHelper";
import { getDisplayCategory } from "@/lib/categoryUtils";

const DEFAULT_TABS = ["Cosmetic", "Skin Care", "Perfume", "Gift Set", "Limited Edition"];

export default function TabbedProducts({ products, collectionTabs = DEFAULT_TABS, hidePrices = true }: { products: any[], collectionTabs?: string[], hidePrices?: boolean }) {
  const tabs = collectionTabs.length > 0 ? collectionTabs : DEFAULT_TABS;
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollByFraction = (direction: -1 | 1) => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth * 0.75 * direction;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (sliderRef.current) {
      sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const getProductsForTab = (tab: string) => {
    const norm = tab.toLowerCase().trim();
    const scored = products.map((p) => {
      let score = 0;
      const title = (p.name || p.title || '').toLowerCase();
      const cats = (p.categories || [])
        .map((c: any) => (c.name || '').toLowerCase() + ' ' + (c.slug || '').toLowerCase())
        .join(' ');

      if (norm === 'cosmetic' || norm === 'cosmetics' || norm === 'makeup' || norm === 'make up') {
        if (cats.includes('cosmetic') || cats.includes('makeup') || cats.includes('make up') || cats.includes('beauty')) {
          score += 100;
        }
        if (
          title.includes('lipstick') ||
          title.includes('lip liner') ||
          title.includes('blush') ||
          title.includes('foundation') ||
          title.includes('mascara') ||
          title.includes('eyeliner') ||
          title.includes('powder') ||
          title.includes('primer') ||
          title.includes('shadow') ||
          title.includes('tint') ||
          title.includes('gloss') ||
          title.includes('concealer')
        ) {
          score += 80;
        }
        if (title.includes('lip ')) score += 40;
      } else if (norm === 'skin care' || norm === 'skincare') {
        if (cats.includes('skin') || cats.includes('care')) {
          score += 100;
        }
        if (
          title.includes('serum') ||
          title.includes('cream') ||
          title.includes('lotion') ||
          title.includes('cleanser') ||
          title.includes('mask') ||
          title.includes('masque') ||
          title.includes('balm') ||
          title.includes('essence') ||
          title.includes('concentrate') ||
          title.includes('gel') ||
          title.includes('oil') ||
          title.includes('toner') ||
          title.includes('moisturizer') ||
          title.includes('eye')
        ) {
          score += 80;
        }
        if (title.includes('lip balm') || title.includes('perfumed')) score -= 50;
      } else if (norm === 'perfume' || norm === 'fragrance' || norm === 'perfumes') {
        if (cats.includes('perfume') || cats.includes('fragrance') || cats.includes('scent') || cats.includes('cologne')) {
          score += 100;
        }
        if (
          title.includes('eau de') ||
          title.includes('parfum') ||
          title.includes('cologne') ||
          title.includes('edt') ||
          title.includes('edp')
        ) {
          score += 100;
        }
        if (title.includes('perfume') || title.includes('fragrance') || title.includes('scent') || title.includes('aroma')) {
          score += 80;
        }
        if (title.includes('lotion') || title.includes('body balm')) score -= 50;
      } else if (norm === 'gift set' || norm === 'gift sets') {
        if (cats.includes('gift') || cats.includes('set')) {
          score += 100;
        }
        if (
          title.includes('set') ||
          title.includes('gift') ||
          title.includes('duo') ||
          title.includes('trio') ||
          title.includes('kit') ||
          title.includes('collection') ||
          title.includes('box') ||
          title.includes('pack')
        ) {
          score += 80;
        }
      } else if (norm === 'limited edition' || norm === 'limited editions') {
        if (cats.includes('limited') || cats.includes('edition') || cats.includes('exclusive')) {
          score += 100;
        }
        if (
          title.includes('limited') ||
          title.includes('edition') ||
          title.includes('gold') ||
          title.includes('privé') ||
          title.includes('couture') ||
          title.includes('absolue') ||
          title.includes('intense') ||
          title.includes('rare') ||
          title.includes('supreme') ||
          title.includes('exclusive') ||
          title.includes('luxury')
        ) {
          score += 80;
        }
      }

      return { ...p, _score: score };
    });

    const matches = scored.filter((p) => p._score > 0).sort((a, b) => b._score - a._score);
    if (matches.length > 0) {
      return matches;
    }

    return products.slice(0, 16);
  };

  const visibleProducts = getProductsForTab(activeTab);

  const renderProductCard = (product: any) => {
    const price = product.price || product.regular_price || 0;
    const isOnSale = product.on_sale || (product.regular_price && product.price && product.regular_price !== product.price);
    const savings = isOnSale ? (parseFloat(product.regular_price) - parseFloat(product.price)).toFixed(2) : 0;

    return (
      <motion.div
        key={`tab-${product.id}`}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -8 }}
        className="slider-card-wrapper"
      >
        <Link href={`/products/${product.slug || product.id}`} className="product-card">
          <div className="product-image-container">
            <Image
              src={getProductImage(product)}
              alt={product.name}
              fill
              className="product-image"
              sizes="(max-width: 768px) 60vw, (max-width: 1024px) 35vw, 25vw"
            />
            {isOnSale && Number(savings) > 0 && (
              <div className="product-badge">
                Sale
              </div>
            )}
          </div>
          <div className="product-info">
            <span className="brand">
              {getDisplayCategory(product, activeTab)}
            </span>
            <h3 className="product-name">
              {product.name}
            </h3>
            {!hidePrices && (
              <div className="price-container" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className="price">RM {price}</span>
                {isOnSale && product.regular_price && product.regular_price !== product.price && (
                  <span style={{ textDecoration: 'line-through', color: 'var(--foreground-dim)', fontSize: '0.9rem' }}>
                    RM {product.regular_price}
                  </span>
                )}
              </div>
            )}
          </div>
        </Link>
      </motion.div>
    );
  };

  return (
    <div className="tabbed-products-container">
      <div className="carousel-section">
        <div className="tabs-scroll-wrapper">
          <ul className="collection-tabs">
            {tabs.map((tab) => (
              <li key={tab}>
                <button
                  className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                  onClick={() => handleTabChange(tab)}
                  type="button"
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="slider-container-wrapper">
          {visibleProducts.length > 4 && (
            <>
              <button
                className="slider-nav-btn slider-nav-prev"
                onClick={() => scrollByFraction(-1)}
                aria-label="Previous products"
                type="button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <button
                className="slider-nav-btn slider-nav-next"
                onClick={() => scrollByFraction(1)}
                aria-label="Next products"
                type="button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </>
          )}

          <div ref={sliderRef} className="product-horizontal-slider">
            <AnimatePresence mode="popLayout">
              {visibleProducts.map((product: any) => renderProductCard(product))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── BOTTOM CTA BUTTON: Shop All ── */}
      <motion.div
        className="section-shop-btn-container"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          href="/products"
          className="btn-primary hero-btn section-shop-btn"
        >
          Shop All
        </Link>
      </motion.div>
    </div>
  );
}
