"use client";
import React, { useState, useEffect } from "react";

const ComingSoonPage = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date("November 1, 2025 00:00:00").getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF5D39] via-orange-500 to-red-600 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-12 h-12 text-[#FF5D39]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Website Under Construction
        </h1>

        {/* Subheading */}
        <h2 className="text-2xl md:text-3xl text-white/90 mb-8 font-light">
          Something amazing is coming soon...
        </h2>

        {/* Countdown Timer */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20">
          <h3 className="text-xl text-white mb-6 font-semibold">
            Booking Fundraisers Starting
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white/20 rounded-xl p-4 border border-white/30">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {timeLeft.days.toString().padStart(2, '0')}
              </div>
              <div className="text-white/80 text-sm font-medium">Days</div>
            </div>
            
            <div className="bg-white/20 rounded-xl p-4 border border-white/30">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {timeLeft.hours.toString().padStart(2, '0')}
              </div>
              <div className="text-white/80 text-sm font-medium">Hours</div>
            </div>
            
            <div className="bg-white/20 rounded-xl p-4 border border-white/30">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {timeLeft.minutes.toString().padStart(2, '0')}
              </div>
              <div className="text-white/80 text-sm font-medium">Minutes</div>
            </div>
            
            <div className="bg-white/20 rounded-xl p-4 border border-white/30">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {timeLeft.seconds.toString().padStart(2, '0')}
              </div>
              <div className="text-white/80 text-sm font-medium">Seconds</div>
            </div>
          </div>
          
          <div className="text-white/90 text-lg font-medium">
            November 1, 2025
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl text-white mb-4 font-semibold">
            Get in Touch
          </h3>
          <p className="text-white/90 text-lg mb-4">
            Have questions or want to be notified when we launch?
          </p>
          <a 
            href="mailto:info@Licorice4Good.com"
            className="inline-flex items-center gap-2 bg-white text-[#FF5D39] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/90 transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            info@Licorice4Good.com
          </a>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-white/70 text-sm">
          <p>Licorice4Good - Making a difference, one fundraiser at a time</p>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage;
