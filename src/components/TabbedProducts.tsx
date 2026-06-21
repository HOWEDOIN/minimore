"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import "./TabbedProducts.css";
import { getProductImage } from "@/utils/imageHelper";

export default function TabbedProducts({ products, collectionTabs }: { products: any[], collectionTabs?: string[] }) {
  const tabs = collectionTabs && collectionTabs.length > 0 ? collectionTabs : [
    "Limited Editions",
    "Merchandise",
    "Miniature",
    "Vials",
    "Gift Sets",
    "Make Up & Cosmetics"
  ];
  
  const [activeTab, setActiveTab] = useState(tabs[0]);

  // Filter products by category name that matches the active tab
  // If the category doesn't exactly match but contains the word, we can be slightly fuzzy
  const filteredProducts = products.filter(product => {
    if (!product.categories) return false;
    return product.categories.some((cat: any) => 
      cat.name.toLowerCase().includes(activeTab.toLowerCase()) ||
      activeTab.toLowerCase().includes(cat.name.toLowerCase())
    );
  });

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
                >
                  <Link href={`/products/${product.slug || product.id}`} className="product-card" style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '12px', display: 'block' }}>
                    <div className="product-image-container" style={{ aspectRatio: '1/1', marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden' }}>
                      <Image
                        src={getProductImage(product)}
                        alt={product.name}
                        fill
                        className="product-image"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        style={{ objectFit: 'contain' }}
                      />
                      {isOnSale && Number(savings) > 0 && (
                        <div className="product-badge" style={{ background: '#d32f2f', color: '#fff', padding: '4px 8px', borderRadius: '4px', position: 'absolute', top: '8px', left: '8px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          Save RM{savings} MYR
                        </div>
                      )}
                    </div>
                    <div className="product-info">
                      <span className="brand" style={{ color: 'var(--foreground-dim)', fontSize: '0.85rem' }}>
                        {product.categories?.[0]?.name || "Merchandise"}
                      </span>
                      <h3 className="product-name" style={{ fontSize: '1.1rem', marginTop: '0.5rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                        {product.name}
                      </h3>
                      <div className="price-container" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span className="price" style={{ color: '#d32f2f', fontWeight: 600 }}>RM{price} MYR</span>
                        {isOnSale && (
                          <span className="original-price" style={{ textDecoration: 'line-through', color: 'var(--foreground-dim)', fontSize: '0.9rem' }}>
                            RM{product.regular_price} MYR
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
    </div>
  );
}
