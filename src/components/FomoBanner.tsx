"use client";

import { useState, useEffect } from 'react';
import './FomoBanner.css';

interface FomoBannerProps {
  targetDate: string; // ISO string or parsable date string
}

export default function FomoBanner({ targetDate }: FomoBannerProps) {
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  
  useEffect(() => {
    const end = new Date(targetDate).getTime();
    
    // If the date is invalid or already passed, don't show the banner at all
    if (isNaN(end) || end <= Date.now()) {
      setTimeLeft("00 : 00 : 00 : 00");
      return;
    }

    const timer = setInterval(() => {
      const now = Date.now();
      const distance = end - now;

      if (distance <= 0) {
        clearInterval(timer);
        setTimeLeft("00 : 00 : 00 : 00");
        return;
      }
      
      const d = Math.floor(distance / (1000 * 60 * 60 * 24));
      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);
      
      const daysStr = d > 0 ? `${d.toString().padStart(2, '0')} : ` : "";
      setTimeLeft(`${daysStr}${h.toString().padStart(2, '0')} : ${m.toString().padStart(2, '0')} : ${s.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  // Don't render anything if the time left is "00 : 00 : 00 : 00" (meaning the offer expired)
  if (timeLeft === "00 : 00 : 00 : 00") {
    return null;
  }

  return (
    <div className="fomo-banner">
      <div className="fomo-banner-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      </div>
      <div className="fomo-banner-text">
        <strong style={{ fontWeight: 600 }}>Limited Offer</strong>
        <span>Your product is reserved for</span>
      </div>
      <div className="fomo-banner-timer">
        {timeLeft || "00 : 00 : 00 : 00"}
      </div>
    </div>
  );
}
