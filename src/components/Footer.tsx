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
        <div className="footer-content">
          <div className="footer-brand">
            <span className="logo-text">minimore</span>
            <p>{footer.company || 'Minimore Sdn Bhd'}</p>
            <p>{footer.tagline || ''}</p>
          </div>
          <div className="footer-links">
            <div>
              <h4>Shop</h4>
              <Link href="/products?category=cosmetics">Cosmetics</Link>
              <Link href="/products?category=fragrances">Fragrances</Link>
              <Link href="/products">Shop All</Link>
            </div>
            <div>
              <h4>Info</h4>
              <Link href="/faq">FAQ</Link>
              <Link href="/about">Our Story</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} {footer.company || 'Minimore Sdn Bhd'}. All rights reserved.</p>
          <p>{footer.copyright || ''}</p>
        </div>
      </div>
    </footer>
  );
}
