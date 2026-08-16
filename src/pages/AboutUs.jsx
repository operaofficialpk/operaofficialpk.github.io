import React from "react";
import { Link } from "react-router-dom";

function AboutUs() {
  return (
    <div className="bg-white min-h-screen text-black">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#FDFBF7] to-white py-16 md:py-18 px-6 text-center border-b border-[#C5A059]/20">
        <p className="text-[11px] md:text-xs tracking-[0.35em] uppercase text-[#C5A059] font-semibold mb-3">
          Our Story
        </p>

        <h1 className="text-4xl md:text-5xl font-serif tracking-wide uppercase text-black mb-5">
          About Opera
        </h1>

        <div className="flex items-center justify-center">
          <div className="w-16 h-[1px] bg-[#C5A059]"></div>
          <div className="w-[5px] h-[5px] bg-[#C5A059] rotate-45 mx-1"></div>
          <div className="w-16 h-[1px] bg-[#C5A059]"></div>
        </div>
      </section>

      {/* Story Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Story Content */}
        <div className="space-y-6">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#C5A059] font-semibold mb-3">
              The Opera Story
            </p>

            <h2 className="text-2xl md:text-3xl font-serif uppercase tracking-wide text-black">
              Elegance, Crafted With Care
            </h2>
          </div>

          <div className="space-y-5 max-w-xl">
            <p className="text-sm text-gray-600 leading-7">
              Opera was founded with a simple belief — that luxury jewellery
              should be accessible, elegant, and made for everyday moments as
              much as life's biggest celebrations. Every piece in our
              collection is thoughtfully designed to reflect timeless beauty,
              blending traditional craftsmanship with contemporary style.
            </p>

            <p className="text-sm text-gray-600 leading-7">
              From bridal sets to signature perfumes, we curate every product
              with a focus on quality, detail, and the confidence it brings to
              those who wear it. Our mission is to make every customer feel as
              radiant as the pieces they choose.
            </p>
          </div>

          <div className="w-12 h-[1px] bg-[#C5A059] pt-0"></div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 md:gap-5">
          {/* Card 1 */}
          <div className="group bg-[#FDFBF7] border border-[#C5A059]/30 rounded-xl p-6 md:p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(197,160,89,0.10)]">
            <p className="text-3xl md:text-4xl font-serif text-[#C5A059] font-semibold">
              5K+
            </p>

            <div className="w-8 h-[1px] bg-[#C5A059]/50 mx-auto my-3"></div>

            <p className="text-[10px] md:text-xs uppercase tracking-[0.14em] text-gray-500">
              Happy Customers
            </p>
          </div>

          {/* Card 2 */}
          <div className="group bg-[#FDFBF7] border border-[#C5A059]/30 rounded-xl p-6 md:p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(197,160,89,0.10)]">
            <p className="text-3xl md:text-4xl font-serif text-[#C5A059] font-semibold">
              100%
            </p>

            <div className="w-8 h-[1px] bg-[#C5A059]/50 mx-auto my-3"></div>

            <p className="text-[10px] md:text-xs uppercase tracking-[0.14em] text-gray-500">
              Trusted Service
            </p>
          </div>

          {/* Card 3 */}
          <div className="group bg-[#FDFBF7] border border-[#C5A059]/30 rounded-xl p-6 md:p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(197,160,89,0.10)]">
            <p className="text-3xl md:text-4xl font-serif text-[#C5A059] font-semibold">
              COD
            </p>

            <div className="w-8 h-[1px] bg-[#C5A059]/50 mx-auto my-3"></div>

            <p className="text-[10px] md:text-xs uppercase tracking-[0.14em] text-gray-500">
              All Across Pakistan
            </p>
          </div>

          {/* Card 4 */}
          <div className="group bg-[#FDFBF7] border border-[#C5A059]/30 rounded-xl p-6 md:p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(197,160,89,0.10)]">
            <p className="text-3xl md:text-4xl font-serif text-[#C5A059] font-semibold">
              24/7
            </p>

            <div className="w-8 h-[1px] bg-[#C5A059]/50 mx-auto my-3"></div>

            <p className="text-[10px] md:text-xs uppercase tracking-[0.14em] text-gray-500">
              Customer Support
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-[#FDFBF7] border-t border-b border-[#C5A059]/20 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#C5A059] font-semibold mb-3">
              Our Promise
            </p>

            <h2 className="text-2xl md:text-3xl font-serif uppercase tracking-wide text-black">
              What We Stand For
            </h2>

            <div className="flex items-center justify-center mt-5">
              <div className="w-10 h-[1px] bg-[#C5A059]"></div>
              <div className="w-[5px] h-[5px] bg-[#C5A059] rotate-45 mx-1"></div>
              <div className="w-10 h-[1px] bg-[#C5A059]"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Value 1 */}
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-white border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] transition-all duration-300 group-hover:border-[#C5A059] group-hover:shadow-[0_8px_25px_rgba(197,160,89,0.12)]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>

              <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-black mb-3">
                Premium Quality
              </h3>

              <p className="text-xs text-gray-500 leading-6 max-w-xs mx-auto">
                Every piece undergoes strict quality checks before it reaches
                your hands.
              </p>
            </div>

            {/* Value 2 */}
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-white border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] transition-all duration-300 group-hover:border-[#C5A059] group-hover:shadow-[0_8px_25px_rgba(197,160,89,0.12)]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 7h11v10H3z" />
                  <path d="M14 10h4l3 3v4h-7z" />
                  <circle cx="7" cy="19" r="1.5" />
                  <circle cx="18" cy="19" r="1.5" />
                </svg>
              </div>

              <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-black mb-3">
                Reliable Delivery
              </h3>

              <p className="text-xs text-gray-500 leading-6 max-w-xs mx-auto">
                Fast, safe shipping across Pakistan with Cash on Delivery
                available.
              </p>
            </div>

            {/* Value 3 */}
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-white border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] transition-all duration-300 group-hover:border-[#C5A059] group-hover:shadow-[0_8px_25px_rgba(197,160,89,0.12)]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3l8 4v5c0 4.8-3.3 7.9-8 9-4.7-1.1-8-4.2-8-9V7l8-4z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>

              <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-black mb-3">
                Trusted By Thousands
              </h3>

              <p className="text-xs text-gray-500 leading-6 max-w-xs mx-auto">
                Thousands of satisfied customers trust Opera for their special
                moments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-16 md:py-20 px-6">
        <p className="text-[10px] tracking-[0.3em] uppercase text-[#C5A059] font-semibold mb-3">
          Explore Opera
        </p>

        <h2 className="text-2xl md:text-3xl font-serif uppercase tracking-wide text-black mb-4">
          Discover Your Perfect Piece
        </h2>

        <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto leading-6">
          Explore our latest collection of handcrafted jewellery and signature
          perfumes.
        </p>

        <Link
          to="/shop"
          className="inline-block bg-black text-white px-10 py-3.5 text-[11px] font-semibold tracking-[0.22em] uppercase border border-black hover:bg-[#C5A059] hover:border-[#C5A059] transition-all duration-300"
        >
          Shop Now
        </Link>
      </section>
    </div>
  );
}

export default AboutUs;