"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import "./TabbedProducts.css";
import { getProductImage } from "@/utils/imageHelper";

export default function TabbedProducts({ products, collectionTabs }: { products: any[], collectionTabs?: string[] }) {
  const tabs = collectionTabs && collectionTabs.length > 0 ? collectionTabs : [
    "Miniature",
    "Vials",
    "Make Up & Cosmetics",
    "Gift Sets",
    "Limited Editions"
  ];
  
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth * 0.75;
      sliderRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth * 0.75;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (sliderRef.current) {
      sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  // Filter products by category name that matches the active tab
  // If the category doesn't exactly match but contains the word, we can be slightly fuzzy
  const filteredProducts = products.filter(product => {
    if (!product.categories) return false;
    return product.categories.some((cat: any) => {
      const catName = cat.name.toLowerCase().replace(/&/g, 'and');
      const tabName = activeTab.toLowerCase().replace(/&/g, 'and');
      return (
        catName.includes(tabName) ||
        tabName.includes(catName) ||
        cat.name.toLowerCase().includes(activeTab.toLowerCase()) ||
        activeTab.toLowerCase().includes(cat.name.toLowerCase())
      );
    });
  });

  return (
    <div className="tabbed-products-container">
      <div className="tabs-scroll-wrapper">
        <ul className="collection-tabs">
          {tabs.map((tab) => (
            <li key={tab}>
              <button
                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => handleTabChange(tab)}
              >
                {tab}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="slider-container-wrapper">
        {filteredProducts.length > 4 && (
          <>
            <button 
              className="slider-nav-btn slider-nav-prev" 
              onClick={scrollLeft}
              aria-label="Previous products"
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button 
              className="slider-nav-btn slider-nav-next" 
              onClick={scrollRight}
              aria-label="Next products"
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </>
        )}

        <div ref={sliderRef} className="product-horizontal-slider">
          <AnimatePresence mode="popLayout">
            {filteredProducts.length === 0 ? (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ color: 'var(--foreground-dim)', width: '100%', textAlign: 'center', padding: '2rem 0' }}
              >
                No products found in this collection.
              </motion.p>
            ) : (
              filteredProducts.map((product: any) => {
                const price = product.price || product.regular_price || 0;
                const isOnSale = product.on_sale || (product.regular_price && product.price && product.regular_price !== product.price);
                const savings = isOnSale ? (parseFloat(product.regular_price) - parseFloat(product.price)).toFixed(2) : 0;
                
                return (
                  <motion.div 
                    key={product.id}
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
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {filteredProducts.length > 0 && (
        <motion.div 
          className="section-shop-btn-container"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link 
            href={`/products?category=${encodeURIComponent(activeTab)}`}
            className="btn-primary hero-btn section-shop-btn"
          >
            Shop {activeTab}
          </Link>
        </motion.div>
      )}
    </div>
  );
}
