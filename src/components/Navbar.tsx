"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CartNavButton from './CartNavButton';
import { useAuthStore } from '@/store/authStore';

interface NavbarProps {
  isStatic?: boolean;
}

export default function Navbar({ isStatic = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  
  // Safe hydration check for Zustand persist
  const [mounted, setMounted] = useState(false);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    setMounted(true);
  }, []);

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
          
          <div className="nav-mobile-left">
            <button 
              className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>

          <div className="nav-center-mobile">
            <Link href="/" className="nav-brand" onClick={closeMobileMenu}>
              <div style={{ 
                position: 'relative', 
                width: '130px', 
                height: '40px', 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img 
                  src="/images/logo.png" 
                  alt="minimore" 
                  style={{ 
                    height: '100%', 
                    width: '100%', 
                    objectFit: 'contain',
                    objectPosition: 'center',
                    mixBlendMode: 'multiply',
                  }}
                />
                <span style={{ display: 'none' }}>minimore</span>
              </div>
            </Link>
          </div>
          
          <div className="nav-links">
            <Link href="/products?category=cosmetics">Cosmetics</Link>
            <Link href="/products?category=fragrances">Fragrances</Link>
            <Link href="/products">Shop All</Link>
            <Link href="/about">About</Link>
          </div>
          
          <div className="nav-actions">
            <form className="nav-search-form" onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
              }
            }}>
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="nav-search-input"
              />
            </form>
            
            {mounted && (
              <Link href={user ? "/account" : "/login"} className="nav-auth-link">
                {user ? "My Account" : "Sign In"}
              </Link>
            )}
            
            <CartNavButton />
          </div>
        </div>
      </nav>

      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          <div className="mobile-menu-header">
            <img src="/images/logo.png" alt="minimore" style={{ height: '40px', mixBlendMode: 'multiply' }} />
            <button className="close-menu" onClick={closeMobileMenu}>✕</button>
          </div>
          
          <form className="mobile-search-form" onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) {
              router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
              closeMobileMenu();
            }
          }}>
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="mobile-nav-links">
            <Link href="/products?category=cosmetics" onClick={closeMobileMenu}>Cosmetics</Link>
            <Link href="/products?category=fragrances" onClick={closeMobileMenu}>Fragrances</Link>
            <Link href="/products" onClick={closeMobileMenu}>Shop All</Link>
            <Link href="/about" onClick={closeMobileMenu}>About</Link>
            {mounted && (
              <Link href={user ? "/account" : "/login"} onClick={closeMobileMenu}>
                {user ? "My Account" : "Sign In"}
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
