import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logoImage from "../assets/logo.png";

function Footer() {
  const [showLogo, setShowLogo] = useState(true);

  // Fast blinking logo animation
  useEffect(() => {
    const timer = setInterval(() => {
      setShowLogo((prev) => !prev);
    }, 600);

    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="bg-black border-t border-[#C5A059] relative text-gray-200 font-sans">
      {/* Top Gold Accent Line */}
      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#C5A059] to-transparent opacity-80"></div>

      {/* Main Footer - Compact & Minimal */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Column 1: Logo & Brand Info (Span 3) */}
          <div className="md:col-span-3 flex flex-col items-center md:items-start text-center md:text-left space-y-2">
            <Link to="/" className="flex flex-col items-center md:items-start w-full">
              <img
                src={logoImage}
                alt="Opera Logo"
                className={`h-16 sm:h-20 w-auto object-contain transition-opacity duration-300 ease-in-out ${
                  showLogo ? "opacity-100" : "opacity-0"
                }`}
              />
            </Link>
            {/* Text color bright kar diya hai taake easily readable ho */}
            <p className="text-xs text-gray-200 font-normal leading-relaxed tracking-wider max-w-[240px]">
              Exquisite collections of fine jewellery and luxury perfumes, crafted for your timeless elegance.
            </p>
          </div>

          {/* Column 2: Quick Links (Span 2) */}
          <div className="md:col-span-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]"></span>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A059]">
                Quick Links
              </h3>
            </div>
            <ul className="space-y-1.5 text-xs font-medium tracking-wide">
              <li>
                <Link to="/" className="text-gray-200 hover:text-[#C5A059] transition-all duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-gray-200 hover:text-[#C5A059] transition-all duration-200">
                  Jewellery
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-gray-200 hover:text-[#C5A059] transition-all duration-200">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/aboutus" className="text-gray-200 hover:text-[#C5A059] transition-all duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contactus" className="text-gray-200 hover:text-[#C5A059] transition-all duration-200">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care (Span 2) */}
          <div className="md:col-span-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]"></span>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A059]">
                Customer Care
              </h3>
            </div>
            <ul className="space-y-1.5 text-xs font-medium tracking-wide">
              <li>
                <Link to="/login" className="text-gray-200 hover:text-[#C5A059] transition-all duration-200">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-200 hover:text-[#C5A059] transition-all duration-200">
                  Register
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-200 hover:text-[#C5A059] transition-all duration-200">
                  View Cart
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-gray-200 hover:text-[#C5A059] transition-all duration-200">
                  My Wishlist
                </Link>
              </li>
              <li>
                <Link to="/contactus" className="text-gray-200 hover:text-[#C5A059] transition-all duration-200">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter & Social Media (Span 5) */}
          <div className="md:col-span-5 space-y-4 text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]"></span>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A059]">
                  Stay Connected
                </h3>
              </div>
              {/* Subheading readable kar di hai */}
              <p className="text-xs text-gray-200 leading-relaxed font-normal mb-2">
                Subscribe to receive updates and exclusive deals.
              </p>
              <div className="flex border border-gray-700 rounded-lg overflow-hidden bg-white max-w-sm mx-auto md:mx-0 focus-within:ring-2 focus-within:ring-[#C5A059] transition">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full px-3 py-2.5 text-xs outline-none text-gray-900 bg-transparent tracking-wide placeholder-gray-500 font-medium" 
                />
                <button 
                  type="button" 
                  className="bg-black hover:bg-[#C5A059] text-white hover:text-black px-5 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 cursor-pointer"
                >
                  Join
                </button>
              </div>
            </div>

            {/* Social Media Links */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-2.5">Follow Us</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                
                {/* Facebook */}
                <a 
                  href="https://facebook.com/operaofficialpk" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 bg-[#111111] border border-gray-800 hover:border-[#C5A059] hover:bg-[#C5A059] hover:text-black px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 text-white group"
                >
                  <svg className="w-3.5 h-3.5 fill-[#C5A059] group-hover:fill-black transition-colors" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
                  <span>@operaofficialpk</span>
                </a>

                {/* Instagram */}
                <a 
                  href="https://instagram.com/operaofficialpk" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 bg-[#111111] border border-gray-800 hover:border-[#C5A059] hover:bg-[#C5A059] hover:text-black px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 text-white group"
                >
                  <svg className="w-3.5 h-3.5 fill-[#C5A059] group-hover:fill-black transition-colors" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  <span>@operaofficialpk</span>
                </a>

                {/* TikTok */}
                <a 
                  href="https://tiktok.com/@operaofficialpk" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 bg-[#111111] border border-gray-800 hover:border-[#C5A059] hover:bg-[#C5A059] hover:text-black px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 text-white group"
                >
                  <svg className="w-3.5 h-3.5 fill-[#C5A059] group-hover:fill-black transition-colors" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                  <span>@operaofficialpk</span>
                </a>

                {/* YouTube */}
                <a 
                  href="https://youtube.com/@operaofficialpk" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 bg-[#111111] border border-gray-800 hover:border-[#C5A059] hover:bg-[#C5A059] hover:text-black px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 text-white group"
                >
                  <svg className="w-3.5 h-3.5 fill-[#C5A059] group-hover:fill-black transition-colors" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  <span>@operaofficialpk</span>
                </a>

              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Footer Bottom */}
      <div className="bg-[#0a0a0a] text-gray-300 py-3 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col md:flex-row items-center justify-between text-xs font-medium tracking-[0.1em] gap-3">
          <p>&copy; {new Date().getFullYear()} Opera PK. All rights reserved.</p>
          <div className="flex gap-4 text-gray-300">
            <span className="hover:text-[#C5A059] transition cursor-pointer">Privacy Policy</span>
            <span className="text-gray-700">|</span>
            <span className="hover:text-[#C5A059] transition cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;