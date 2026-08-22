import React, { useState, useEffect, useContext, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CartContext } from "../context/CartContext";
import { useStore } from "../context/StoreContext";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

// ============================================================
// IMAGE URL HELPER
// ============================================================
const extractImageUrl = (image) => {
  if (!image) return "";
  if (typeof image === "string") return image.trim();

  if (typeof image === "object") {
    if (image.secure_url) return String(image.secure_url).trim();
    if (image.url) return String(image.url).trim();
    if (image.src) return String(image.src).trim();
    if (image.image) return extractImageUrl(image.image);
  }

  return "";
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop";

// ============================================================
// PRODUCT IMAGE CAROUSEL
// ============================================================
function ProductImageCarousel({ product, productId, productName }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = useMemo(() => {
    if (!product) return [];

    const imageList = [];

    const mainImage = extractImageUrl(
      product.image ||
        product.imageUrl ||
        product.img ||
        product.thumbnail
    );

    if (mainImage) {
      imageList.push({
        url: mainImage,
        label: "Main",
      });
    }

    if (Array.isArray(product.images)) {
      product.images.forEach((img, index) => {
        const url = extractImageUrl(img);

        if (url) {
          imageList.push({
            url,
            label: `Image ${index + 1}`,
          });
        }
      });
    }

    if (Array.isArray(product.variants)) {
      product.variants.forEach((variant) => {
        if (!variant) return;

        const vImage = extractImageUrl(
          variant.imageUrl ||
            variant.image ||
            variant.imageUrlSecure ||
            variant.img
        );

        if (vImage) {
          imageList.push({
            url: vImage,
            label: variant.colorName || "Variant",
          });
        }
      });
    }

    const uniqueImages = [];
    const usedUrls = new Set();

    imageList.forEach((item) => {
      if (!usedUrls.has(item.url)) {
        usedUrls.add(item.url);
        uniqueImages.push(item);
      }
    });

    return uniqueImages;
  }, [product]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [productId]);

  const safeImages =
    images.length > 0
      ? images
      : [
          {
            url: FALLBACK_IMAGE,
            label: "Product",
          },
        ];

  const currentImage =
    safeImages[currentIndex] || safeImages[0];

  const goPrevious = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setCurrentIndex((prev) =>
      prev === 0 ? safeImages.length - 1 : prev - 1
    );
  };

  const goNext = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setCurrentIndex((prev) =>
      prev === safeImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="w-full">
      <div className="relative aspect-square w-full bg-[#FCFCFC] overflow-hidden flex items-center justify-center p-4">
        <Link
          to={`/product/${productId}`}
          className="absolute inset-0 flex items-center justify-center p-4"
        >
          <img
            src={currentImage.url}
            alt={`${productName || "Jewelry Item"} - ${currentImage.label}`}
            className="w-full h-full object-contain object-center transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              if (e.currentTarget.src !== FALLBACK_IMAGE) {
                e.currentTarget.src = FALLBACK_IMAGE;
              }
            }}
          />
        </Link>

        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrevious}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 border border-neutral-200 shadow flex items-center justify-center text-neutral-700 opacity-0 group-hover:opacity-100 hover:bg-black hover:text-white transition-all"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={goNext}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 border border-neutral-200 shadow flex items-center justify-center text-neutral-700 opacity-0 group-hover:opacity-100 hover:bg-black hover:text-white transition-all"
            >
              ›
            </button>

            <div className="absolute bottom-2 right-2 z-20 bg-black/75 text-white text-[9px] px-2 py-0.5 rounded-full tracking-widest font-medium">
              {currentIndex + 1} / {safeImages.length}
            </div>
          </>
        )}
      </div>

      {safeImages.length > 1 && (
        <div className="px-2 py-2 bg-white border-t border-neutral-100">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            {safeImages.map((image, index) => (
              <button
                key={`${image.url}-${index}`}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`relative shrink-0 w-9 h-9 rounded-lg overflow-hidden bg-white border transition-all ${
                  currentIndex === index
                    ? "border-black ring-1 ring-black scale-105"
                    : "border-neutral-200 opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={image.url}
                  alt={image.label}
                  className="w-full h-full object-contain p-0.5"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// SHOP PAGE
// ============================================================
function Shop() {
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const selectedCategory =
    searchParams.get("category") || "All";

  const searchQuery =
    searchParams.get("search") || "";

  useEffect(() => {
    let isMounted = true;

    const fetchShopData = async () => {
      try {
        setLoading(true);

        const [prodSnap, catSnap, revSnap] =
          await Promise.all([
            getDocs(collection(db, "products")),
            getDocs(collection(db, "categories")),
            getDocs(collection(db, "reviews")),
          ]);

        if (isMounted) {
          setProducts(
            prodSnap.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            }))
          );

          setCategories(
            catSnap.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            }))
          );

          setReviews(
            revSnap.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            }))
          );
        }
      } catch (error) {
        console.error(
          "Error fetching shop data:",
          error
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchShopData();

    return () => {
      isMounted = false;
    };
  }, []);

  const getProductRatingDetails = (productId) => {
    const prodReviews = reviews.filter(
      (r) =>
        String(r.productId) === String(productId)
    );

    if (prodReviews.length === 0) {
      return {
        average: "5.0",
        count: 0,
      };
    }

    const total = prodReviews.reduce(
      (acc, curr) =>
        acc + Number(curr.rating || 0),
      0
    );

    return {
      average: (
        total / prodReviews.length
      ).toFixed(1),
      count: prodReviews.length,
    };
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const name =
        product.name ||
        product.title ||
        "";

      const cat =
        product.category || "";

      const matchesCategory =
        selectedCategory === "All" ||
        cat.toLowerCase() ===
          selectedCategory.toLowerCase();

      const matchesSearch =
        !searchQuery ||
        name
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          );

      return (
        matchesCategory &&
        matchesSearch
      );
    });
  }, [
    products,
    selectedCategory,
    searchQuery,
  ]);

  return (
    <div className="bg-white min-h-screen pb-16">
      <Helmet>
        <title>
          Shop Collection | Opera Jewellery PK
        </title>

        <meta
          name="description"
          content="Explore our luxurious collection of fine American zircon jewellery at Opera PK."
        />
      </Helmet>

      {/* CUSTOM ANIMATION STYLE FOR SHINE EFFECT */}
      <style>{`
        @keyframes shineMove {
          0% {
            transform: translateX(-100%);
          }

          100% {
            transform: translateX(100%);
          }
        }

        .animate-shine {
          animation: shineMove 2.5s infinite linear;
        }
      `}</style>

      {/* SOLID GOLD/BRASS DECORATIVE STRIP WITH REPEATING LIGHT/SHINE EFFECT */}
      <div className="w-full h-3 bg-gradient-to-r from-[#C5A059] via-[#E6D59C] to-[#C5A059] relative overflow-hidden shadow-inner">
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/70 to-transparent -translate-x-full animate-shine" />
      </div>

      {/* HEADER SECTION WITH EXACT FONT STYLE */}
      <section className="w-full bg-gradient-to-r from-[#FDFBF7] via-[#F4ECD8] to-[#FDFBF7] border-b border-[#C5A059]/25 py-10 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-light uppercase tracking-[0.3em] text-[#2b2b2b] font-sans">
            OUR COLLECTIONS
          </h1>

          <div className="flex items-center justify-center mt-3">
            <div className="w-10 h-[1px] bg-[#C5A059]" />

            <span className="mx-3 text-[9px] uppercase tracking-[0.35em] text-[#8c7340] font-medium">
              EXPLORE
            </span>

            <div className="w-10 h-[1px] bg-[#C5A059]" />
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* CATEGORY FILTER TABS & PRODUCT COUNT */}
        <div className="mb-8 border-b border-neutral-200/60 pb-5">

          {/* PRODUCT COUNT — TOP RIGHT */}
          <div className="flex justify-end mb-4">
            <div className="text-xs uppercase tracking-[0.2em] text-neutral-500 font-bold bg-[#FDFBF7] px-3.5 py-1.5 rounded-md border border-[#C5A059]/20 shadow-xs">
              {filteredProducts.length} Products Found
            </div>
          </div>

          {/* CATEGORY TABS */}
          <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide py-1.5">
            <button
              type="button"
              onClick={() => {
                const newParams =
                  new URLSearchParams(
                    searchParams
                  );

                newParams.delete(
                  "category"
                );

                setSearchParams(
                  newParams
                );
              }}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer shadow-sm ${
                selectedCategory === "All"
                  ? "bg-black text-white ring-2 ring-[#C5A059]/50 shadow-md scale-[1.02]"
                  : "bg-[#FAFAFA] text-neutral-700 border border-[#C5A059]/30 hover:bg-[#F4ECD8]/40 hover:border-[#C5A059]"
              }`}
            >
              All Collections
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() =>
                  setSearchParams({
                    category: cat.name,
                  })
                }
                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer shadow-sm ${
                  selectedCategory.toLowerCase() ===
                  (cat.name || "").toLowerCase()
                    ? "bg-black text-white ring-2 ring-[#C5A059]/50 shadow-md scale-[1.02]"
                    : "bg-[#FAFAFA] text-neutral-700 border border-[#C5A059]/30 hover:bg-[#F4ECD8]/40 hover:border-[#C5A059]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* PRODUCTS GRID */}
        {loading ? (
          <div className="text-center py-20 text-neutral-400 text-sm tracking-widest uppercase">
            Loading collections...
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map(
              (product) => {
                const productId =
                  product.id ||
                  product._id ||
                  product.sku;

                const actualPrice = Number(
                  product.price ||
                    product.discountPrice ||
                    0
                );

                const discountPrice =
                  product.discountPrice
                    ? Number(
                        product.discountPrice
                      )
                    : null;

                const originalPrice =
                  Number(
                    product.originalPrice ||
                      product.comparePrice ||
                      product.oldPrice ||
                      0
                  );

                const currentDisplayPrice =
                  discountPrice ||
                  actualPrice;

                const hasDiscount =
                  originalPrice >
                  currentDisplayPrice;

                const mainImage =
                  extractImageUrl(
                    product.image ||
                      product.imageUrl ||
                      product.img
                  ) ||
                  FALLBACK_IMAGE;

                const isWishlisted =
                  isInWishlist(
                    productId
                  );

                const ratingData =
                  getProductRatingDetails(
                    productId
                  );

                return (
                  <div
                    key={productId}
                    className="group flex flex-col bg-white rounded-xl border border-neutral-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 relative"
                  >
                    {/* WISHLIST BUTTON */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        toggleWishlist({
                          ...product,
                          id: productId,
                        });
                      }}
                      className={`absolute top-3 right-3 z-35 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm border border-neutral-200 flex items-center justify-center shadow-sm cursor-pointer transition-transform hover:scale-110 ${
                        isWishlisted
                          ? "text-red-500"
                          : "text-neutral-600"
                      }`}
                    >
                      ♥
                    </button>

                    {/* CAROUSEL CONTAINER */}
                    <div className="relative">
                      <ProductImageCarousel
                        product={product}
                        productId={productId}
                        productName={
                          product.name ||
                          product.title
                        }
                      />

                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                        <Link
                          to={`/product/${productId}`}
                          className="pointer-events-auto bg-white/95 text-black hover:bg-black hover:text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 border border-neutral-200"
                        >
                          Quick View
                        </Link>
                      </div>
                    </div>

                    {/* DISCOUNT BADGE */}
                    {hasDiscount && (
                      <div className="absolute top-3 left-3 z-30 bg-red-600 text-white text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded shadow-sm tracking-wider uppercase">
                        -
                        {Math.round(
                          ((originalPrice -
                            currentDisplayPrice) /
                            originalPrice) *
                            100
                        )}
                        %
                      </div>
                    )}

                    {/* CARD BODY */}
                    <div className="p-3 sm:p-4 flex flex-col flex-grow justify-between">
                      <div>
                        <Link
                          to={`/product/${productId}`}
                        >
                          <h3 className="text-xs sm:text-sm font-medium text-neutral-900 uppercase tracking-wider line-clamp-2 min-h-[2.5rem] hover:text-[#C5A059] transition-colors">
                            {product.name ||
                              product.title}
                          </h3>
                        </Link>

                        <div className="mt-2.5 flex items-center justify-between gap-1 flex-wrap">
                          <div className="flex items-center gap-2">
                            {hasDiscount && (
                              <span className="text-xs text-neutral-400 line-through">
                                Rs.{" "}
                                {originalPrice.toLocaleString()}
                              </span>
                            )}

                            <span className="text-base sm:text-lg font-bold text-gray-900">
                              Rs.{" "}
                              {currentDisplayPrice.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-yellow-400 text-base">
                              ★
                            </span>

                            <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              {ratingData.average}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          addToCart({
                            ...product,
                            price:
                              currentDisplayPrice,
                            originalPrice:
                              originalPrice,
                            selectedImage:
                              mainImage,
                          })
                        }
                        className="mt-4 w-full bg-black text-white py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-[#C5A059] transition-colors cursor-pointer shadow-md"
                      >
                        ADD TO CART
                      </button>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        ) : (
          <div className="text-center py-24 bg-neutral-50 rounded-2xl border border-neutral-100">
            <p className="text-neutral-500 text-sm font-medium uppercase tracking-wider mb-3">
              No products found in this collection.
            </p>

            <button
              type="button"
              onClick={() =>
                setSearchParams({})
              }
              className="px-6 py-2.5 bg-black text-white text-xs uppercase tracking-wider font-bold rounded-lg hover:bg-[#C5A059] transition-colors"
            >
              View All Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Shop;