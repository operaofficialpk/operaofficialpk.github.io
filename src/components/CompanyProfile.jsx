import React from 'react';
import { FaGem, FaHandshake, FaHeart, FaStar, FaShieldAlt, FaGift } from 'react-icons/fa';

const CompanyProfile = () => {
  return (
    <div className="bg-white text-gray-800 min-h-screen">
      {/* Hero Header Section */}
      <div className="bg-black text-white py-16 px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-serif tracking-widest font-bold mb-4">OPERA JEWELLERY</h1>
        <p className="text-xs md:text-sm text-gray-400 tracking-widest uppercase">NOT FOR ORDINARY</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16 space-y-20">
        
        {/* Our Story Section */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-wide border-b-2 border-black pb-3 inline-block">
            Our Legacy & Vision
          </h2>
          <p className="text-gray-600 leading-relaxed text-sm md:text-base">
            Opera Jewellery is crafted for those who are bold, confident, and unapologetically unique. We believe that fine jewellery isn't just an accessory—it's an extension of your persona. Every piece we curate is designed to adorn your elegance and leave an unforgettable impression wherever you go.
          </p>
          <p className="text-black font-serif italic text-lg tracking-wider">
            "Because true elegance is never ordinary."
          </p>
        </div>

        {/* Our Core Values Cards */}
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-wide text-center mb-12">
            The Pillars of Opera
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-gray-200 p-8 text-center space-y-4 hover:shadow-lg transition rounded-lg bg-gray-50/50">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto">
                <FaGem size={20} />
              </div>
              <h3 className="font-bold text-lg">Unmatched Quality</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Our true achievement lies in the absolute trust our customers place in our peerless craft and superior finish.
              </p>
            </div>

            <div className="border border-gray-200 p-8 text-center space-y-4 hover:shadow-lg transition rounded-lg bg-gray-50/50">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto">
                <FaShieldAlt size={20} />
              </div>
              <h3 className="font-bold text-lg">Pure Trust</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                We build long-lasting relationships rooted deeply in transparency, honesty, and total customer reliability.
              </p>
            </div>

            <div className="border border-gray-200 p-8 text-center space-y-4 hover:shadow-lg transition rounded-lg bg-gray-50/50">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto">
                <FaHandshake size={20} />
              </div>
              <h3 className="font-bold text-lg">Deep Commitment</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                We listen closely to your expectations, constantly striving to deliver ultimate value and satisfaction.
              </p>
            </div>
          </div>
        </div>

        {/* Exclusive Membership Program Banner */}
        <div className="bg-gray-900 text-white rounded-2xl p-8 md:p-12 relative overflow-hidden shadow-xl">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 text-gray-800 opacity-20 pointer-events-none">
            <FaStar size={250} />
          </div>
          
          <div className="relative z-10 max-w-2xl space-y-6">
            <span className="bg-white text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              VIP Club
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold">The Opera Privilege Club</h2>
            <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
              Join our fast-growing family of elite connoisseurs. Become an <span className="text-white font-semibold">Opera Family</span> member instantly with any purchase and unlock a world of luxury perks.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start space-x-3 text-xs md:text-sm text-gray-200">
                <span className="text-yellow-400 font-bold">✦</span>
                <span>10% Instant Savings on all orders</span>
              </div>
              <div className="flex items-start space-x-3 text-xs md:text-sm text-gray-200">
                <span className="text-yellow-400 font-bold">✦</span>
                <span>Lifetime membership with zero renewal fees</span>
              </div>
              <div className="flex items-start space-x-3 text-xs md:text-sm text-gray-200">
                <span className="text-yellow-400 font-bold">✦</span>
                <span>Exclusive Birthday gifts & discount vouchers</span>
              </div>
              <div className="flex items-start space-x-3 text-xs md:text-sm text-gray-200">
                <span className="text-yellow-400 font-bold">✦</span>
                <span>Early VIP access to all "New Arrivals"</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CompanyProfile;