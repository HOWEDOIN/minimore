"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, Variants, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import TabbedProducts from "@/components/TabbedProducts";

export default function HomePageClient({ products, homepageContent, sectionOrder, collectionTabs }: { products: any, homepageContent: any, sectionOrder: string[], collectionTabs: string[] }) {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroImageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const heroContentY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const heroImages = homepageContent.hero_images || [homepageContent.hero_image || "/images/hero.png"];
  const heroLinks = homepageContent.hero_links || [];
  
  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
  }, [heroImages.length]);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(nextImage, 5000);
    return () => clearInterval(interval);
  }, [nextImage, heroImages.length]);

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
          <motion.h1
            variants={itemVariants}
            className="hero-title"
            dangerouslySetInnerHTML={{ __html: homepageContent.hero_title }}
          />
          <motion.p variants={itemVariants} className="hero-desc">
            {homepageContent.hero_subtitle}
          </motion.p>
          <motion.div 
            className="hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <Link href={homepageContent.hero_cta1_url || '/products'} className="btn-primary">
              {homepageContent.hero_cta1_label || 'Shop Collection'}
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
          <AnimatePresence mode="popLayout">
            {/* Image motion.div logic unchanged */}
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              style={{ position: 'absolute', inset: 0 }}
            >
              {heroLinks[currentImageIndex] && heroLinks[currentImageIndex] !== '#' ? (
                <Link href={heroLinks[currentImageIndex]} style={{ display: 'block', width: '100%', height: '100%', cursor: 'pointer' }}>
                  <Image
                    src={heroImages[currentImageIndex]}
                    alt="Minimore luxury cosmetics and fragrances"
                    fill
                    className="hero-image"
                    priority
                    sizes="55vw"
                  />
                </Link>
              ) : (
                <Image
                  src={heroImages[currentImageIndex]}
                  alt="Minimore luxury cosmetics and fragrances"
                  fill
                  className="hero-image"
                  priority
                  sizes="55vw"
                />
              )}
            </motion.div>
          </AnimatePresence>

          {heroImages.length > 1 && (
            <>
              {/* Next Button */}
              <button 
                className="hero-carousel-next" 
                onClick={nextImage}
                aria-label="Next image"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </>
          )}
        </motion.div>

        <div className="hero-carousel-controls">
          {heroImages.length > 1 && (
            <div className="hero-carousel-dots">
              {heroImages.map((_: any, idx: number) => (
                <button
                  key={idx}
                  className={`hero-carousel-dot ${idx === currentImageIndex ? "active" : ""}`}
                  onClick={() => setCurrentImageIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {heroLinks[currentImageIndex] && heroLinks[currentImageIndex] !== '#' && (
            <Link href={heroLinks[currentImageIndex]} className="hero-carousel-shop-btn">
              &rarr; SHOP NOW
            </Link>
          )}
        </div>

      </header>
    ),

    trending: (
      <section className="featured container" id="shop">
        <TabbedProducts products={products} collectionTabs={collectionTabs} />
      </section>
    ),
    contact_locate: (
      <section className="contact-locate-section container">
        <div className="contact-locate-grid">
          <motion.div 
            className="locate-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2>LOCATE US</h2>
            <div className="map-container">
              <iframe 
                src={`https://maps.google.com/maps?q=${encodeURIComponent(homepageContent.contact_map_query || 'Lalaport Bukit Bintang City Centre')}&t=&z=15&ie=UTF8&iwloc=&output=embed`} 
                width="85%" 
                height="160" 
                style={{ border: 0, borderRadius: '12px', marginBottom: '1rem' }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            <div className="address-text" style={{ whiteSpace: 'pre-line' }}>
              {homepageContent.contact_address || 
                "L1-53, 2, Jln Hang Tuah\nBukit Bintang, 55100 Kuala Lumpur\nWilayah Persekutuan Kuala Lumpur"
              }
            </div>
          </motion.div>

          <motion.div 
            className="contact-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h2>CONTACT US</h2>
            <div className="contact-info-list">
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <div>
                  <span className="contact-label">Email Us</span>
                  <a href={`mailto:${homepageContent.contact_email || 'marketingminimore@gmail.com'}`} className="contact-link">
                    {homepageContent.contact_email || 'marketingminimore@gmail.com'}
                  </a>
                </div>
              </div>
              
              <div className="contact-item" style={{ marginTop: '2rem' }}>
                <span className="contact-icon">💬</span>
                <div>
                  <span className="contact-label">WhatsApp Us</span>
                  <a href={`https://wa.me/${homepageContent.contact_whatsapp || '60123456789'}`} className="contact-link">
                    {homepageContent.contact_whatsapp_display || '+60 12-345 6789 (Placeholder)'}
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
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
