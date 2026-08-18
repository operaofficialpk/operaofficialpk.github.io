import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import banner1 from "../assets/banner1.jpg";
import banner2 from "../assets/banner2.jpg";
import banner3 from "../assets/banner3.jpg";

function Hero() {
  const banners = [banner1, banner2, banner3].filter(Boolean);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const goToPrevious = () => {
    if (banners.length === 0) return;
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + banners.length) % banners.length
    );
  };

  const goToNext = () => {
    if (banners.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  if (banners.length === 0) {
    return (
      <div className="w-full h-48 bg-black text-white flex items-center justify-center">
        Banners not found
      </div>
    );
  }

  return (
    <section className="w-full bg-white">
      <div
        className="
          relative
          w-full
          overflow-hidden
          bg-neutral-900
          aspect-[16/9]
          sm:aspect-[21/9]
          lg:aspect-[2.8/1]
        "
      >
        {banners.map((banner, index) => (
          <div
            key={index}
            className={`
              absolute
              inset-0
              transition-opacity
              duration-1000
              ease-in-out
              ${index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"}
            `}
          >
            <img
              src={banner}
              alt={`Opera Jewellery Banner ${index + 1}`}
              className="w-full h-full object-cover object-center"
            />

            {/* Subtle Gradient Overlay for Mobile Readability */}
            <div
              className="
                absolute
                inset-0
                md:hidden
                bg-gradient-to-t
                from-black/60
                via-black/20
                to-transparent
              "
            />
          </div>
        ))}

        {/* Banner Text & CTA */}
        <div
          className="
            absolute
            left-0
            right-0
            bottom-12
            z-20
            flex
            flex-col
            items-center
            justify-center
            px-5
            text-center
          "
        >
          <p
            className="
              text-[9px]
              uppercase
              tracking-[0.3em]
              font-semibold
              text-[#F0D99A]
              mb-1
            "
          >
            Opera Jewellery
          </p>

          <h2
            className="
              text-xl
              sm:text-2xl
              font-serif
              font-bold
              text-white
              tracking-wide
            "
          >
            Elegance You Deserve
          </h2>

          {/* SHOP NOW */}
          <Link
            to="/shop"
            className="
              mt-3
              px-5
              py-2
              rounded-full
              bg-[#C5A059]
              text-white
              text-[10px]
              font-bold
              uppercase
              tracking-[0.15em]
              shadow-lg
              hover:bg-[#E6CA65]
              transition
              cursor-pointer
            "
          >
            Shop Now
          </Link>
        </div>

        {/* Previous Button */}
        <button
          type="button"
          onClick={goToPrevious}
          aria-label="Previous banner"
          className="
            absolute
            left-3
            sm:left-5
            top-1/2
            -translate-y-1/2
            z-30
            w-9
            h-9
            sm:w-11
            sm:h-11
            rounded-full
            bg-black/30
            hover:bg-black/60
            border
            border-white/30
            text-white
            backdrop-blur-sm
            flex
            items-center
            justify-center
            transition
            cursor-pointer
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Next Button */}
        <button
          type="button"
          onClick={goToNext}
          aria-label="Next banner"
          className="
            absolute
            right-3
            sm:right-5
            top-1/2
            -translate-y-1/2
            z-30
            w-9
            h-9
            sm:w-11
            sm:h-11
            rounded-full
            bg-black/30
            hover:bg-black/60
            border
            border-white/30
            text-white
            backdrop-blur-sm
            flex
            items-center
            justify-center
            transition
            cursor-pointer
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Carousel Indicators / Dots */}
        <div
          className="
            absolute
            bottom-4
            left-1/2
            -translate-x-1/2
            z-30
            flex
            items-center
            gap-2
          "
        >
          {banners.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to banner ${index + 1}`}
              className={`
                rounded-full
                transition-all
                duration-300
                cursor-pointer
                ${
                  index === currentIndex
                    ? "w-6 h-1.5 bg-[#C5A059]"
                    : "w-1.5 h-1.5 bg-white/70 hover:bg-white"
                }
              `}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero;