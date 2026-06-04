import Link from 'next/link';
import './components.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="logo-text">minimore</span>
            <p>Minimore Sdn Bhd (1673311-U)</p>
            <p>Launching Soon @ Lalaport Bukit Bintang</p>
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
          <p>© {new Date().getFullYear()} Minimore Sdn Bhd. All rights reserved.</p>
          <p>Authentic Luxury. Travel Sized.</p>
        </div>
      </div>
    </footer>
  );
}
