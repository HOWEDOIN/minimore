"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, Variants, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function HomePageClient({ products, homepageContent, sectionOrder }: { products: any, homepageContent: any, sectionOrder: string[] }) {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroImageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const heroContentY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Animation Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60, damping: 20 } }
  };

  const fadeUpVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
  };

  const sectionMap: Record<string, React.ReactNode> = {
    hero: (
      <header className="hero" ref={heroRef}>
        <img src="/images/logo.png" alt="" className="hero-bg-logo" />

        <motion.div
          className="hero-content container"
          initial="hidden"
          animate="show"
          variants={containerVariants}
          style={{ y: heroContentY, opacity: heroOpacity }}
        >
          <motion.span variants={itemVariants} className="hero-eyebrow">
            {homepageContent.hero_eyebrow || 'New Arrivals 2025'}
          </motion.span>
          <motion.h1
            variants={itemVariants}
            className="hero-title"
            dangerouslySetInnerHTML={{ __html: homepageContent.hero_title }}
          />
          <motion.p variants={itemVariants} className="hero-desc">
            {homepageContent.hero_subtitle}
          </motion.p>
          <motion.div variants={itemVariants} className="hero-actions">
            <Link href={homepageContent.hero_cta1_url || '/products'} className="btn-primary">
              {homepageContent.hero_cta1_label || 'Shop Collection'}
            </Link>
            <Link href={homepageContent.hero_cta2_url || '/about'} className="btn-outline">
              {homepageContent.hero_cta2_label || 'Our Story'}
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-image-wrapper"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ y: heroImageY }}
        >
          <Image
            src={homepageContent.hero_image || "/images/hero.png"}
            alt="Minimore luxury cosmetics and fragrances"
            fill
            className="hero-image"
            priority
            sizes="55vw"
          />
        </motion.div>


      </header>
    ),

    trending: (
      <section className="featured container" id="shop">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2>Trending Miniatures</h2>
          <Link href="/products">View All</Link>
        </motion.div>

        <motion.div
          className="product-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          {products.length === 0 ? (
            <p style={{ color: 'var(--foreground-dim)', fontWeight: 400 }}>No trending items right now.</p>
          ) : (
            products.map((product: any) => {
              const price = product.price || product.regular_price || 0;
              return (
                <motion.div variants={itemVariants} key={product.id} whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                  <Link href={`/products/${product.slug || product.id}`} className="product-card">
                    <div className="product-image-container">
                      <Image
                        src={product.images?.[0]?.src || "/images/skincare.png"}
                        alt={product.name}
                        fill
                        className="product-image"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      {product.on_sale && (
                        <div className="product-badge">Sale</div>
                      )}
                    </div>
                    <div className="product-info">
                      <span className="brand">{product.categories?.[0]?.name || "Minimore"}</span>
                      <h3 className="product-name">{product.name}</h3>
                      <span className="price">RM {price}</span>
                    </div>
                  </Link>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </section>
    ),

    why: (
      <section className="about-banner">
        <motion.div
          className="container about-content"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.h2 variants={fadeUpVariants}>
            {homepageContent.why_title || "Why Choose Minimore?"}
          </motion.h2>
          <motion.p variants={fadeUpVariants} className="section-tagline">
            {homepageContent.why_tagline || "Curated luxury, delivered beautifully."}
          </motion.p>
          <div className="features">
            {[
              {
                icon: homepageContent.why_f1_icon || '✦',
                title: homepageContent.why_f1_title || '100% Authentic',
                desc: homepageContent.why_f1_desc || 'Every product is guaranteed authentic, sourced directly from authorized brand distributors.'
              },
              {
                icon: homepageContent.why_f2_icon || '✈',
                title: homepageContent.why_f2_title || 'Travel Ready',
                desc: homepageContent.why_f2_desc || 'TSA-approved luxury sizes meticulously chosen for your next getaway or daily essentials.'
              },
              {
                icon: homepageContent.why_f3_icon || '🎁',
                title: homepageContent.why_f3_title || 'Perfect Gifting',
                desc: homepageContent.why_f3_desc || 'Ideal gifts for loved ones to sample the finest luxury brands without the full commitment.'
              }
            ].map((f, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="feature"
                whileHover={{ y: -8, borderColor: 'rgba(212,168,83,0.4)' }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <span className="feature-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    ),

    text_block: (
      <section className="text-block container">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          style={{ textAlign: (homepageContent.text_block_align === 'left' || homepageContent.text_block_align === 'right') ? homepageContent.text_block_align as any : 'center' }}
        >
          <motion.h2 variants={fadeUpVariants} className="section-title">
            {homepageContent.text_block_heading}
          </motion.h2>
          <motion.p variants={fadeUpVariants} className="text-block-body">
            {homepageContent.text_block_body}
          </motion.p>
        </motion.div>
      </section>
    ),

    image_text: (
      <section className={`image-text container ${homepageContent.image_text_reverse ? 'reverse' : ''}`}>
        <motion.div 
          className="image-text-image"
          initial={{ opacity: 0, x: homepageContent.image_text_reverse ? 40 : -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="img-wrapper">
            <Image src={homepageContent.image_text_image || "/images/hero.png"} alt="Section image" fill sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
        </motion.div>
        <motion.div 
          className="image-text-content"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.h2 variants={fadeUpVariants} className="section-title">{homepageContent.image_text_heading}</motion.h2>
          <motion.p variants={fadeUpVariants} className="text-block-body">{homepageContent.image_text_body}</motion.p>
          {(homepageContent.image_text_cta_label || homepageContent.image_text_cta_url) && (
            <motion.div variants={fadeUpVariants} className="image-text-action">
              <Link href={homepageContent.image_text_cta_url || "#"} className="btn-primary">
                {homepageContent.image_text_cta_label}
              </Link>
            </motion.div>
          )}
        </motion.div>
      </section>
    ),

    cta_banner: (
      <section className="cta-banner">
        <Image src={homepageContent.cta_banner_bg || "/images/hero.png"} alt="Banner background" fill className="cta-banner-bg" sizes="100vw" />
        <div className="cta-banner-overlay" />
        <motion.div 
          className="cta-banner-content container"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.h2 variants={fadeUpVariants}>{homepageContent.cta_banner_heading}</motion.h2>
          <motion.p variants={fadeUpVariants}>{homepageContent.cta_banner_subheading}</motion.p>
          <motion.div variants={fadeUpVariants} className="cta-banner-action">
            <Link href={homepageContent.cta_banner_btn_url || "#"} className="btn-primary">
              {homepageContent.cta_banner_btn_label}
            </Link>
          </motion.div>
        </motion.div>
      </section>
    ),

    testimonials: (
      <section className="testimonials container">
        <motion.div
          className="section-header center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2>{homepageContent.testimonials_title || "What Our Customers Say"}</h2>
        </motion.div>
        <motion.div 
          className="testimonials-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          {[1, 2, 3].map(i => {
            const name = homepageContent[`testimonials_${i}_name`];
            const quote = homepageContent[`testimonials_${i}_quote`];
            const starsStr = homepageContent[`testimonials_${i}_stars`];
            const stars = parseInt(starsStr) || 5;
            if (!name && !quote) return null;
            return (
              <motion.div key={i} variants={itemVariants} className="testimonial-card">
                <div className="stars">{"★".repeat(Math.min(5, stars))}{"☆".repeat(Math.max(0, 5 - stars))}</div>
                <p className="quote">"{quote}"</p>
                <p className="author">— {name}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>
    ),

    marquee: (
      <div className={`marquee-strip speed-${homepageContent.marquee_speed || 'normal'}`}>
        <div className="marquee-content">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="marquee-group">
              {(homepageContent.marquee_items || "100% Authentic, Travel Ready, Luxury Miniatures").split(',').map((item: string, j: number) => (
                <span key={j} className="marquee-item">{item.trim()}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    ),

    cat_tiles: (
      <section className="cat-tiles container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2>{homepageContent.cat_tiles_title || "Shop by Category"}</h2>
        </motion.div>
        <motion.div 
          className="cat-tiles-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          {[1, 2, 3, 4].map(i => {
            const image = homepageContent[`cat_tile_${i}_image`];
            const label = homepageContent[`cat_tile_${i}_label`];
            const url = homepageContent[`cat_tile_${i}_url`];
            if (!label) return null;
            return (
              <motion.div key={i} variants={itemVariants} className="cat-tile" whileHover={{ y: -5 }}>
                <Link href={url || "#"}>
                  <div className="cat-tile-img">
                    <Image src={image || "/images/skincare.png"} alt={label} fill sizes="(max-width: 768px) 50vw, 25vw" />
                  </div>
                  <div className="cat-tile-label">{label}</div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </section>
    )
  };

  return (
    <>
      {sectionOrder.map((sectionKey, index) => {
        const sectionContent = sectionMap[sectionKey];
        if (!sectionContent) return null;
        return (
          <div key={`${sectionKey}-${index}`}>
            {sectionContent}
          </div>
        );
      })}
    </>
  );
}
