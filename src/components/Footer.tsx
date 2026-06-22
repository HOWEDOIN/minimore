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
              <h4>Shop & Info</h4>
              <Link href="/products">Shop All</Link>
              <Link href="/products?category=cosmetics">Cosmetics</Link>
              <Link href="/faq">FAQ</Link>
            </div>
            <div style={{ maxWidth: '200px' }}>
              <h4>Locate Us</h4>
              <p style={{ whiteSpace: 'pre-line', fontSize: '0.9rem', color: 'var(--foreground-dim)', lineHeight: 1.6 }}>
                {sitewide.contact_address || "L1-53, 2, Jln Hang Tuah\nBukit Bintang, 55100 Kuala Lumpur\nWilayah Persekutuan Kuala Lumpur"}
              </p>
            </div>
            <div>
              <h4>Contact Us</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a href={`mailto:${sitewide.contact_email || 'marketingminimore@gmail.com'}`} style={{ color: 'var(--foreground-dim)', fontSize: '0.9rem' }}>
                  {sitewide.contact_email || 'marketingminimore@gmail.com'}
                </a>
                <a href={`https://wa.me/${sitewide.contact_whatsapp || '60123456789'}`} style={{ color: 'var(--foreground-dim)', fontSize: '0.9rem' }}>
                  {sitewide.contact_whatsapp_display || '+60 12-345 6789 (Placeholder)'}
                </a>
              </div>
            </div>
            <div>
              <h4>Follow Us</h4>
              <div className="social-links" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {sitewide.social_instagram ? <a href={sitewide.social_instagram} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--foreground-dim)', fontSize: '0.9rem' }}>Instagram</a> : null}
                {sitewide.social_facebook ? <a href={sitewide.social_facebook} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--foreground-dim)', fontSize: '0.9rem' }}>Facebook</a> : null}
                {sitewide.social_tiktok ? <a href={sitewide.social_tiktok} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--foreground-dim)', fontSize: '0.9rem' }}>TikTok</a> : null}
                {sitewide.social_telegram ? <a href={sitewide.social_telegram} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--foreground-dim)', fontSize: '0.9rem' }}>Telegram</a> : null}
                {!sitewide.social_instagram && !sitewide.social_facebook && !sitewide.social_tiktok && !sitewide.social_telegram && (
                  <span style={{ color: 'var(--foreground-dim)', fontSize: '0.9rem' }}>Coming soon</span>
                )}
              </div>
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
