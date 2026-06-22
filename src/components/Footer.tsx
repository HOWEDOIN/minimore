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
            <span className="logo-text">minimore</span>
          </div>
          
          <div className="footer-legal">
            <p>© {new Date().getFullYear()} {footer.company || 'Minimore Sdn Bhd'}. All rights reserved.</p>
            <p>{footer.copyright || ''}</p>
          </div>

          <div className="footer-socials">
            <a href="https://www.instagram.com/minimoremy/" target="_blank" rel="noopener noreferrer">Instagram</a>
            <span>Facebook</span>
            <span>TikTok</span>
            <span>Telegram</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
