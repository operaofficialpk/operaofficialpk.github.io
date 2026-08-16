import React from "react";
import { Link } from "react-router-dom";

const extractImageUrl = (image) => {
  if (!image) return "";
  if (typeof image === "string") return image.trim();
  if (typeof image === "object") {
    if (image.secure_url) return String(image.secure_url).trim();
    if (image.url) return String(image.url).trim();
    if (image.src) return String(image.src).trim();
  }
  return "";
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop";

function BestSeller({ products = [], addToCart, toggleWishlist, isInWishlist }) {
  // Yahan sirf unhi products ko filter kiya gaya hai jin par admin panel se "MARK AS FEATURED PRODUCT" ka check laga hai (featured: true)
  const listToDisplay = Array.isArray(products) 
    ? products.filter(p => p.featured === true || p.isFeatured === true) 
    : [];

  if (listToDisplay.length === 0) {
    return null; // Agar kisi product par featured ka check na ho toh yeh section website par show nahi hoga
  }

  return (
    <section className="w-full py-16 bg-gradient-to-b from-white via-[#FDFBF7] to-white overflow-hidden border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
        <span className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-[#8c7340] font-bold">
          FEATURED COLLECTION
        </span>
        <h2 className="text-2xl sm:text-3xl font-light uppercase tracking-[0.25em] text-[#2b2b2b] font-sans mt-2">
          BEST SELLER
        </h2>
        <div className="flex items-center justify-center mt-3">
          <div className="w-12 h-[1px] bg-[#C5A059]" />
          <span className="mx-3 text-[9px] uppercase tracking-[0.35em] text-[#C5A059]">◆</span>
          <div className="w-12 h-[1px] bg-[#C5A059]" />
        </div>
      </div>

      <div className="relative w-full overflow-hidden py-4">
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none" />

        <div 
          className="flex gap-6 px-3"
          style={{
            display: 'flex',
            width: 'max-content',
            animation: 'marqueeSlide 35s linear infinite'
          }}
          onMouseEnter={(e) => e.currentTarget.style.animationPlayState = 'paused'}
          onMouseLeave={(e) => e.currentTarget.style.animationPlayState = 'running'}
        >
          {[...listToDisplay, ...listToDisplay, ...listToDisplay].map((product, idx) => {
            const productId = product.id || product._id || product.sku || idx;
            const actualPrice = Number(product.price || product.discountPrice || 0);
            const discountPrice = product.discountPrice ? Number(product.discountPrice) : null;
            const originalPrice = Number(product.originalPrice || product.comparePrice || product.oldPrice || 0);
            const currentDisplayPrice = discountPrice || actualPrice;
            const hasDiscount = originalPrice > currentDisplayPrice;
            const mainImage = extractImageUrl(
              product.image || product.imageUrl || product.img || product.thumbnail
            ) || FALLBACK_IMAGE;
            const isWishlisted = isInWishlist ? isInWishlist(productId) : false;

            // Rating / Review calculation
            const rating = Number(product.rating || product.averageRating || product.ratings || 5);
            const reviewCount = product.reviewCount || product.totalReviews || (Array.isArray(product.reviews) ? product.reviews.length : 0);

            return (
              <div
                key={`${productId}-${idx}`}
                className="w-[240px] sm:w-[270px] shrink-0 flex flex-col bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 relative"
              >
                {toggleWishlist && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist({ ...product, id: productId });
                    }}
                    className={`absolute top-3 right-3 z-30 w-7 h-7 rounded-full bg-white/95 border border-neutral-200 flex items-center justify-center shadow-sm cursor-pointer transition-transform hover:scale-110 ${
                      isWishlisted ? "text-red-500" : "text-neutral-600"
                    }`}
                  >
                    ♥
                  </button>
                )}

                <Link to={`/product/${productId}`} className="relative aspect-square w-full bg-[#FCFCFC] overflow-hidden block">
                  <img
                    src={mainImage}
                    alt={product.name || product.title || "Product"}
                    className="w-full h-full object-contain p-4 transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                </Link>

                {hasDiscount && (
                  <div className="absolute top-3 left-3 z-20 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    -{Math.round(((originalPrice - currentDisplayPrice) / originalPrice) * 100)}%
                  </div>
                )}

                <div className="p-3.5 flex flex-col flex-grow justify-between bg-white">
                  <div>
                    <Link to={`/product/${productId}`}>
                      <h3 className="text-xs sm:text-sm font-medium text-neutral-900 uppercase tracking-wider line-clamp-1 hover:text-[#C5A059] transition-colors">
                        {product.name || product.title || "Featured Jewellery"}
                      </h3>
                    </Link>

                    {/* Review Stars Added Here */}
                    <div className="flex items-center gap-1 mt-1.5">
                      <div className="flex text-amber-500 text-xs">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>
                            {i < Math.floor(rating) ? "★" : "☆"}
                          </span>
                        ))}
                      </div>
                      <span className="text-[10px] text-neutral-500">
                        ({reviewCount})
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {hasDiscount && (
                          <span className="text-[10px] text-neutral-400 line-through">
                            Rs. {originalPrice.toLocaleString()}
                          </span>
                        )}
                        <span className="text-xs sm:text-sm font-bold text-gray-900">
                          Rs. {currentDisplayPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() =>
                        addToCart && addToCart({
                          ...product,
                          price: currentDisplayPrice,
                          originalPrice: originalPrice,
                          selectedImage: mainImage,
                        })
                      }
                      className="w-full bg-black text-white py-2 text-[11px] font-bold uppercase tracking-wider rounded hover:bg-[#C5A059] transition-colors cursor-pointer"
                    >
                      ADD TO CART
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default BestSeller;