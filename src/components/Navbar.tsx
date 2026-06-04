"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CartNavButton from './CartNavButton';
import './components.css';

interface NavbarProps {
  isStatic?: boolean;
}

import Image from 'next/image';

export default function Navbar({ isStatic = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (isStatic) return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial scroll position
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isStatic]);

  return (
    <nav className={`navbar ${isStatic ? 'static' : ''} ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner container">
        <Link href="/" className="nav-brand">
          {/* We will load the actual logo here, but keep the Fredoka text as a fallback/alt */}
          <div style={{ 
            position: 'relative', 
            width: '260px', 
            height: '64px', 
            display: 'flex', 
            alignItems: 'center'
          }}>
            {/* If the image exists at this path, it will display, otherwise it will use the extracted text style */}
            <img 
              src="/images/logo.png" 
              alt="minimore" 
              style={{ 
                height: '100%', 
                width: '100%', 
                objectFit: 'contain',
                objectPosition: 'left center',
                filter: 'drop-shadow(0px 8px 20px rgba(0, 0, 0, 0.25))'
              }}
            />
            <span style={{ display: 'none' }}>minimore</span>
          </div>
        </Link>
        <div className="nav-links">
          <Link href="/products?category=cosmetics">Cosmetics</Link>
          <Link href="/products?category=fragrances">Fragrances</Link>
          <Link href="/products">Shop All</Link>
          <Link href="/about">About</Link>
        </div>
        <div className="nav-actions">
          <button>Search</button>
          <CartNavButton />
        </div>
      </div>
    </nav>
  );
}
