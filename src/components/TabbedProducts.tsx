"use client";

import { useState } from "react";
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

  const visibleProducts = filteredProducts.slice(0, 8);

  return (
    <div className="tabbed-products-container">
      <div className="tabs-scroll-wrapper">
        <ul className="collection-tabs">
          {tabs.map((tab) => (
            <li key={tab}>
              <button
                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <motion.div 
        layout 
        className="product-grid"
        style={{ marginTop: '2rem' }}
      >
        <AnimatePresence mode="popLayout">
          {filteredProducts.length === 0 ? (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ color: 'var(--foreground-dim)', gridColumn: '1 / -1', padding: '2rem 0' }}
            >
              No products found in this collection.
            </motion.p>
          ) : (
            visibleProducts.map((product: any) => {
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
                >
                  <Link href={`/products/${product.slug || product.id}`} className="product-card">
                    <div className="product-image-container">
                      <Image
                        src={getProductImage(product)}
                        alt={product.name}
                        fill
                        className="product-image"
                        sizes="(max-width: 768px) 100vw, 33vw"
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
      </motion.div>

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
