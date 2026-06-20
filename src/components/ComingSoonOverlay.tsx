"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import './components.css';

export default function ComingSoonOverlay() {
  return (
    <div className="coming-soon-overlay">
      <motion.div 
        className="coming-soon-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="coming-soon-logo">
          <img src="/images/logo.png" alt="Minimore" />
        </div>
        
        <h1 className="coming-soon-title">
          Physical Store coming soon at <span className="text-gradient">Lalaport</span>
        </h1>
        
        <p className="coming-soon-desc">
          Follow our social media to get the latest update
        </p>
        
        <div className="coming-soon-actions">
          <Link href="https://www.instagram.com/minimoremy/" target="_blank" rel="noopener noreferrer" className="btn-primary">
            Follow on Instagram
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
