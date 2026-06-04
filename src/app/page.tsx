import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import "./page.css";
import { sdk } from "@/lib/medusa";

export default async function Home() {
  const { products } = await sdk.store.product.list({
    limit: 3
  }).catch(() => ({ products: [] }));

  return (
    <div className="page-wrapper">
      <Navbar />

      {/* ── Hero ── */}
      <header className="hero">
        <img src="/images/logo.png" alt="" className="hero-bg-logo" />
        <div className="hero-content container">
          <span className="hero-eyebrow">New Arrivals 2025</span>
          <h1 className="hero-title">
            Luxury in <em>miniature</em><br />form.
          </h1>
          <p className="hero-desc">
            Discover our curated collection of authentic premium cosmetic
            and fragrance miniatures — perfect for gifting, travel, or
            simply treating yourself.
          </p>
          <div className="hero-actions">
            <Link href="/products" className="btn-primary">
              Shop Collection
            </Link>
            <Link href="/about" className="btn-outline">
              Our Story
            </Link>
          </div>
        </div>
        <div className="hero-image-wrapper">
          <Image
            src="/images/hero.png"
            alt="Minimore luxury cosmetics and fragrances"
            fill
            className="hero-image"
            priority
            sizes="50vw"
          />
        </div>
      </header>

      {/* ── Trending Miniatures ── */}
      <section className="featured container" id="shop">
        <div className="section-header">
          <h2>Trending Miniatures</h2>
          <Link href="/products">View All</Link>
        </div>
        <div className="product-grid">
          {products.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontWeight: 300 }}>No trending items right now.</p>
          ) : (
            products.map((product) => {
              const price = product.variants?.[0]?.calculated_price?.calculated_amount
                || product.variants?.[0]?.prices?.[0]?.amount
                || 0;

              return (
                <Link href={`/products/${product.id}`} className="product-card" key={product.id}>
                  <div className="product-image-container">
                    <Image
                      src={product.thumbnail || "/images/skincare.png"}
                      alt={product.title}
                      fill
                      className="product-image"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    {product.metadata?.condition && (
                      <div className="product-badge">{product.metadata.condition as string}</div>
                    )}
                  </div>
                  <div className="product-info">
                    <span className="brand">{product.collection?.title || "Minimore"}</span>
                    <h3 className="product-name">{product.title}</h3>
                    <span className="price">RM {price}</span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </section>

      {/* ── Why Minimore ── */}
      <section className="about-banner">
        <div className="container about-content">
          <h2>Why Choose Minimore?</h2>
          <p className="section-tagline">Curated luxury, delivered beautifully.</p>
          <div className="features">
            <div className="feature">
              <span className="feature-icon">✦</span>
              <h3>100% Authentic</h3>
              <p>Every product is guaranteed authentic, sourced directly from authorized brand distributors.</p>
            </div>
            <div className="feature">
              <span className="feature-icon">✈</span>
              <h3>Travel Ready</h3>
              <p>TSA-approved luxury sizes meticulously chosen for your next getaway or daily essentials.</p>
            </div>
            <div className="feature">
              <span className="feature-icon">🎁</span>
              <h3>Perfect Gifting</h3>
              <p>Ideal gifts for loved ones to sample the finest luxury brands without the full commitment.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
