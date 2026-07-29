"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import "./TabbedProducts.css";
import { getProductImage } from "@/utils/imageHelper";

export default function TabbedProducts({ products }: { products: any[], collectionTabs?: string[] }) {
  const [row1Tab, setRow1Tab] = useState("Cosmetic");
  const [row2Tab, setRow2Tab] = useState("Gift Set");
  
  const slider1Ref = useRef<HTMLDivElement>(null);
  const slider2Ref = useRef<HTMLDivElement>(null);

  const scrollLeft1 = () => {
    if (slider1Ref.current) {
      const scrollAmount = slider1Ref.current.clientWidth * 0.75;
      slider1Ref.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight1 = () => {
    if (slider1Ref.current) {
      const scrollAmount = slider1Ref.current.clientWidth * 0.75;
      slider1Ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollLeft2 = () => {
    if (slider2Ref.current) {
      const scrollAmount = slider2Ref.current.clientWidth * 0.75;
      slider2Ref.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight2 = () => {
    if (slider2Ref.current) {
      const scrollAmount = slider2Ref.current.clientWidth * 0.75;
      slider2Ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleRow1TabChange = (tab: string) => {
    setRow1Tab(tab);
    if (slider1Ref.current) {
      slider1Ref.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const handleRow2TabChange = (tab: string) => {
    setRow2Tab(tab);
    if (slider2Ref.current) {
      slider2Ref.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const matchCategory = (product: any, tab: string) => {
    if (!product.categories || product.categories.length === 0) return false;
    const normalizedTab = tab.toLowerCase().trim();
    return product.categories.some((cat: any) => {
      const catName = (cat.name || '').toLowerCase().replace(/&/g, 'and').trim();
      const catSlug = (cat.slug || '').toLowerCase().replace(/&/g, 'and').trim();
      
      if (catName.includes(normalizedTab) || normalizedTab.includes(catName)) return true;
      if (catSlug.includes(normalizedTab) || normalizedTab.includes(catSlug)) return true;

      if (normalizedTab === "cosmetic" || normalizedTab === "cosmetics") {
        if (catName.includes("cosmetic") || catName.includes("makeup") || catName.includes("make up") || catName.includes("beauty") || catName.includes("miniature")) return true;
      }
      if (normalizedTab === "skin care" || normalizedTab === "skincare") {
        if (catName.includes("skin") || catName.includes("care") || catName.includes("serum") || catName.includes("lotion") || catName.includes("cream") || catName.includes("vial")) return true;
      }
      if (normalizedTab === "perfume" || normalizedTab === "fragrance") {
        if (catName.includes("perfume") || catName.includes("fragrance") || catName.includes("scent") || catName.includes("vial") || catName.includes("cologne")) return true;
      }
      if (normalizedTab === "gift set" || normalizedTab === "gift sets") {
        if (catName.includes("gift") || catName.includes("set")) return true;
      }
      if (normalizedTab === "limited edition" || normalizedTab === "limited editions") {
        if (catName.includes("limited") || catName.includes("edition")) return true;
      }
      return false;
    });
  };

  const getProductsForTab = (tab: string) => {
    const matches = products.filter(p => matchCategory(p, tab));
    if (matches.length > 0) return matches;
    return products.slice(0, 8);
  };

  const row1Products = getProductsForTab(row1Tab);
  const row2Products = getProductsForTab(row2Tab);

  const renderProductCard = (product: any, keyPrefix: string) => {
    const price = product.price || product.regular_price || 0;
    const isOnSale = product.on_sale || (product.regular_price && product.price && product.regular_price !== product.price);
    const savings = isOnSale ? (parseFloat(product.regular_price) - parseFloat(product.price)).toFixed(2) : 0;
    
    return (
      <motion.div 
        key={`${keyPrefix}-${product.id}`}
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
              {product.categories?.[0]?.name || "Minimore"}
            </span>
            <h3 className="product-name">
              {product.name}
            </h3>
            <div className="price-container" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className="price">RM {price}</span>
              {isOnSale && product.regular_price && product.regular_price !== product.price && (
                <span style={{ textDecoration: 'line-through', color: 'var(--foreground-dim)', fontSize: '0.9rem' }}>
                  RM {product.regular_price}
                </span>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
    );
  };

  return (
    <div className="tabbed-products-container">
      {/* ── ROW 1: Cosmetic, Skin Care, Perfume ── */}
      <div className="carousel-section" style={{ marginBottom: "3.5rem" }}>
        <div className="tabs-scroll-wrapper">
          <ul className="collection-tabs">
            {["Cosmetic", "Skin Care", "Perfume"].map((tab) => (
              <li key={tab}>
                <button
                  className={`tab-btn ${row1Tab === tab ? "active" : ""}`}
                  onClick={() => handleRow1TabChange(tab)}
                  type="button"
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="slider-container-wrapper">
          {row1Products.length > 4 && (
            <>
              <button 
                className="slider-nav-btn slider-nav-prev" 
                onClick={scrollLeft1}
                aria-label="Previous products"
                type="button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <button 
                className="slider-nav-btn slider-nav-next" 
                onClick={scrollRight1}
                aria-label="Next products"
                type="button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </>
          )}

          <div ref={slider1Ref} className="product-horizontal-slider">
            <AnimatePresence mode="popLayout">
              {row1Products.map((product: any) => renderProductCard(product, "row1"))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── ROW 2: Gift Set, Limited Edition ── */}
      <div className="carousel-section">
        <div className="tabs-scroll-wrapper">
          <ul className="collection-tabs">
            {["Gift Set", "Limited Edition"].map((tab) => (
              <li key={tab}>
                <button
                  className={`tab-btn ${row2Tab === tab ? "active" : ""}`}
                  onClick={() => handleRow2TabChange(tab)}
                  type="button"
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="slider-container-wrapper">
          {row2Products.length > 4 && (
            <>
              <button 
                className="slider-nav-btn slider-nav-prev" 
                onClick={scrollLeft2}
                aria-label="Previous products"
                type="button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <button 
                className="slider-nav-btn slider-nav-next" 
                onClick={scrollRight2}
                aria-label="Next products"
                type="button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </>
          )}

          <div ref={slider2Ref} className="product-horizontal-slider">
            <AnimatePresence mode="popLayout">
              {row2Products.map((product: any) => renderProductCard(product, "row2"))}
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
