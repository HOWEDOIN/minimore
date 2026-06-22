import Link from 'next/link';
import './components.css';

async function getSitewideData() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_WP_URL || 'https://admin.minimore.my'}/wp-json/minimore/v1/sitewide`,
      { next: { revalidate: 60 } }
    );
    if (res.ok) return res.json();
  } catch (e) {}
  return {
    footer: {
      company: 'Minimore Sdn Bhd (1673311-U)',
      tagline: 'Launching Soon @ Lalaport Bukit Bintang',
      copyright: 'Authentic Luxury. Travel Sized.',
    }
  };
}

export default async function Footer() {
  const sitewide = await getSitewideData();
  const footer = sitewide?.footer ?? {};

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-links-grid">
            <div className="footer-col">
              <h4>Shop & Info</h4>
              <Link href="/products">Shop All</Link>
              <Link href="/products?category=cosmetics">Cosmetics</Link>
              <Link href="/faq">FAQ</Link>
            </div>
            <div className="footer-col">
              <h4>Locate Us</h4>
              <p className="footer-text-block">
                {sitewide.contact_address || "L1-53, 2, Jln Hang Tuah\nBukit Bintang, 55100 Kuala Lumpur\nWilayah Persekutuan Kuala Lumpur"}
              </p>
            </div>
            <div className="footer-col">
              <h4>Contact Us</h4>
              <a href={`mailto:${sitewide.contact_email || 'marketingminimore@gmail.com'}`}>
                {sitewide.contact_email || 'marketingminimore@gmail.com'}
              </a>
              <a href={`https://wa.me/${sitewide.contact_whatsapp || '60123456789'}`}>
                {sitewide.contact_whatsapp_display || '+60 12-345 6789 (Placeholder)'}
              </a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-brand">
            <img 
              src="/logos/logo-white.png" 
              alt="minimore" 
              style={{ height: '35px', width: 'auto', objectFit: 'contain' }}
            />
          </div>
          
          <div className="footer-legal">
            <p>© {new Date().getFullYear()} {footer.company || 'Minimore Sdn Bhd'}. All rights reserved.</p>
            <p>{footer.copyright || ''}</p>
          </div>

          <div className="footer-socials" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <a href="https://www.instagram.com/minimoremy/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <span aria-label="Facebook" style={{ cursor: 'default' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </span>
            <a href="https://www.tiktok.com/@minimore_my?_r=1&_t=ZS-97QWYxweg7w" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
              </svg>
            </a>
            <span aria-label="Telegram" style={{ cursor: 'default' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
