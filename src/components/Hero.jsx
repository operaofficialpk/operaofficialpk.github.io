import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Standard Unsplash Jewellery Images (Aap apni images ka path/URL yahan daal sakte hain)
const slides = [
  {
    id: 1,
    title: "Luxury Jewellery Collection",
    subtitle: "Discover premium jewellery collections crafted with elegance and timeless beauty.",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1000&auto=format&fit=crop",
    link: "/shop"
  },
  {
    id: 2,
    title: "Exclusive Bridal Sets",
    subtitle: "Handcrafted designs designed for your special moments and weddings.",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1000&auto=format&fit=crop",
    link: "/shop"
  },
  {
    id: 3,
    title: "Royal Emerald & Diamonds",
    subtitle: "Exquisite craftsmanship tailored for sophisticated modern fashion.",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1000&auto=format&fit=crop",
    link: "/shop"
  }
];

function Hero() {
  const [current, setCurrent] = useState(0);

  // Auto-play slider (Har 4 seconds baad slide change hoga)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrent(current === 0 ? slides.length - 1 : current - 1);
  };

  const nextSlide = () => {
    setCurrent(current === slides.length - 1 ? 0 : current + 1);
  };

  return (
    <section className="bg-black text-white py-12 md:py-20 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        
        {/* Left Side: Content */}
        <div className="space-y-6">
          <span className="text-xs tracking-widest text-gray-400 uppercase font-medium">
            OPERA OFFICIAL PK
          </span>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight transition-all duration-500">
            {slides[current].title}
          </h1>

          <p className="text-gray-400 text-sm md:text-base max-w-lg leading-relaxed transition-all duration-500">
            {slides[current].subtitle}
          </p>

          <div>
            <Link
              to={slides[current].link}
              className="inline-block bg-white text-black px-8 py-3.5 rounded-full font-medium hover:bg-gray-200 transition-all duration-300"
            >
              Explore Collection
            </Link>
          </div>
        </div>

        {/* Right Side: Image Slider with Controls */}
        <div className="relative group">
          <div className="relative h-[350px] md:h-[450px] w-full rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={slides[current].image}
              alt={slides[current].title}
              className="w-full h-full object-cover transition-all duration-700 ease-in-out"
            />
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
          >
            ❮
          </button>
          
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
          >
            ❯
          </button>

          {/* Slide Indicator Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  current === index ? "bg-white w-6" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

export default Hero;