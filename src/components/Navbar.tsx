"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CartNavButton from './CartNavButton';

interface NavbarProps {
  isStatic?: boolean;
}

export default function Navbar({ isStatic = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    if (isStatic) return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial scroll position
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isStatic]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <nav className={`navbar ${isStatic ? 'static' : ''} ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner container">
          
          <div className="nav-center-mobile">
            <Link href="/" className="nav-brand" onClick={closeMobileMenu}>
              <div className="logo-wrapper">
                <img 
                  src="/logos/logo-primary.png?v=2" 
                  alt="Minimore home"
                  style={{ 
                    position: 'absolute',
                    height: '100%', 
                    width: '100%', 
                    objectFit: 'cover',
                    objectPosition: 'center',
                    opacity: (scrolled || isStatic) ? 0 : 1,
                    transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                />
                <img 
                  src="/logos/logo-white.png" 
                  alt=""
                  aria-hidden="true"
                  style={{ 
                    position: 'absolute',
                    height: '100%', 
                    width: '100%', 
                    objectFit: 'cover',
                    objectPosition: 'center',
                    opacity: (scrolled || isStatic) ? 1 : 0,
                    transform: 'scale(1.13)',
                    transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                />
                <span style={{ display: 'none' }}>minimore</span>
              </div>
            </Link>
          </div>
          
          <div className="nav-links">
            <Link href="/products">Shop All</Link>
            <Link href="/products?category=cosmetics">Cosmetics</Link>
            <Link href="/products?category=skincare">Skincare</Link>
            <Link href="/products?category=make-up">Make Up</Link>
            <Link href="/faq">FAQ</Link>
          </div>
          
          <div className="nav-actions">
            <form className="nav-search-form" role="search" onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
              }
            }}>
              <input 
                id="desktop-product-search"
                name="search"
                type="search"
                aria-label="Search products"
                autoComplete="off"
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="nav-search-input"
              />
            </form>
            
            <CartNavButton />
            
            <button 
              className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      <div id="mobile-menu" className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`} aria-hidden={!isMobileMenuOpen}>
        <div className="mobile-menu-content">
          <div className="mobile-menu-header">
            <img src="/images/logo.png" alt="minimore" style={{ height: '40px', mixBlendMode: 'multiply' }} />
            <button className="close-menu" onClick={closeMobileMenu} aria-label="Close menu">✕</button>
          </div>
          
          <form className="mobile-search-form" role="search" onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) {
              router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
              closeMobileMenu();
            }
          }}>
            <input 
              id="mobile-product-search"
              name="search"
              type="search"
              aria-label="Search products"
              autoComplete="off"
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="mobile-nav-links">
            <Link href="/products" onClick={closeMobileMenu}>Shop All</Link>
            <Link href="/products?category=cosmetics" onClick={closeMobileMenu}>Cosmetics</Link>
            <Link href="/products?category=skincare" onClick={closeMobileMenu}>Skincare</Link>
            <Link href="/products?category=make-up" onClick={closeMobileMenu}>Make Up</Link>
            <Link href="/faq" onClick={closeMobileMenu}>FAQ</Link>
          </div>
        </div>
      </div>
    </>
  );
}
