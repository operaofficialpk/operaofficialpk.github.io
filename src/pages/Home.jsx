import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
} from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CartContext } from "../context/CartContext";
import { useStore } from "../context/StoreContext";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import Hero from "../components/Hero";
import BestSeller from "../components/BestSeller";

// ============================================================
// IMAGE URL HELPER
// ============================================================

const extractImageUrl = (image) => {
  if (!image) return "";

  if (typeof image === "string") {
    return image.trim();
  }

  if (typeof image === "object") {
    if (image.secure_url) {
      return String(image.secure_url).trim();
    }

    if (image.url) {
      return String(image.url).trim();
    }

    if (image.src) {
      return String(image.src).trim();
    }

    if (image.image) {
      return extractImageUrl(image.image);
    }
  }

  return "";
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop";

// ============================================================
// PREMIUM PRODUCT IMAGE CAROUSEL
// ============================================================

function ProductImageCarousel({
  product,
  productId,
  productName,
}) {
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
        type: "main",
        label: "Main",
      });
    }

    if (Array.isArray(product.images)) {
      product.images.forEach((image, index) => {
        const url = extractImageUrl(image);

        if (url) {
          imageList.push({
            url,
            type: "gallery",
            label: `Image ${index + 1}`,
          });
        }
      });
    }

    if (Array.isArray(product.variants)) {
      product.variants.forEach((variant) => {
        if (!variant) return;

        const variantImage = extractImageUrl(
          variant.imageUrl ||
            variant.image ||
            variant.imageUrlSecure ||
            variant.img
        );

        if (variantImage) {
          imageList.push({
            url: variantImage,
            type: "variant",
            label: variant.colorName || "Variant",
            colorName: variant.colorName || "",
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
            type: "fallback",
            label: "Product",
          },
        ];

  const currentImage =
    safeImages[currentIndex] || safeImages[0];

  const goPrevious = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setCurrentIndex((prev) =>
      prev === 0
        ? safeImages.length - 1
        : prev - 1
    );
  };

  const goNext = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setCurrentIndex((prev) =>
      prev === safeImages.length - 1
        ? 0
        : prev + 1
    );
  };

  const selectImage = (index, e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(index);
  };

  return (
    <div className="w-full">
      {/* UNIFORM PADDING & ASPECT RATIO CONTAINER */}
      <div className="relative aspect-square w-full bg-[#FCFCFC] overflow-hidden flex items-center justify-center p-4">
        <Link
          to={`/product/${productId}`}
          className="absolute inset-0 flex items-center justify-center p-4"
        >
          <img
            src={currentImage.url}
            alt={`${productName || "Jewelry Item"} - ${
              currentImage.label
            }`}
            className="w-full h-full object-contain object-center transition-transform duration-700 ease-out group-hover:scale-105"
            width="2000"
            height="2000"
            loading="lazy"
            onError={(e) => {
              if (e.currentTarget.src !== FALLBACK_IMAGE) {
                e.currentTarget.src = FALLBACK_IMAGE;
              }
            }}
          />
        </Link>

        {safeImages.length > 1 && (
          <button
            type="button"
            onClick={goPrevious}
            aria-label="Previous product image"
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 backdrop-blur-sm border border-neutral-200 shadow-md flex items-center justify-center text-neutral-700 text-lg sm:text-xl font-light opacity-0 group-hover:opacity-100 hover:bg-black hover:text-white hover:border-black transition-all duration-300"
          >
            ‹
          </button>
        )}

        {safeImages.length > 1 && (
          <button
            type="button"
            onClick={goNext}
            aria-label="Next product image"
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 backdrop-blur-sm border border-neutral-200 shadow-md flex items-center justify-center text-neutral-700 text-lg sm:text-xl font-light opacity-0 group-hover:opacity-100 hover:bg-black hover:text-white hover:border-black transition-all duration-300"
          >
            ›
          </button>
        )}

        {safeImages.length > 1 && (
          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-20 bg-black/75 backdrop-blur-sm text-white text-[9px] sm:text-[10px] px-2 py-1 rounded-full tracking-widest font-medium">
            {currentIndex + 1} / {safeImages.length}
          </div>
        )}
      </div>

      {safeImages.length > 1 && (
        <div className="px-2 sm:px-3 py-2 bg-white border-t border-neutral-100">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide">
            {safeImages.map((image, index) => (
              <button
                key={`${image.url}-${index}`}
                type="button"
                onClick={(e) => selectImage(index, e)}
                title={image.colorName || image.label}
                className={`relative shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-lg overflow-hidden bg-white border transition-all duration-300 cursor-pointer ${
                  currentIndex === index
                    ? "border-black ring-1 ring-black scale-[1.03]"
                    : "border-neutral-200 hover:border-neutral-400 opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={image.url}
                  alt={image.colorName || image.label}
                  className="w-full h-full object-contain p-0.5"
                  width="2000"
                  height="2000"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
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
// REVIEWS MODAL COMPONENT
// ============================================================

function ReviewsModal({
  isOpen,
  onClose,
  product,
  reviews = [],
}) {
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");

  if (!isOpen || !product) return null;

  const actualRatings = reviews
    .map((review) => Number(review.rating || 0))
    .filter((ratingValue) => ratingValue > 0);

  const calculatedRating =
    actualRatings.length > 0
      ? (
          actualRatings.reduce(
            (sum, ratingValue) => sum + ratingValue,
            0
          ) / actualRatings.length
        ).toFixed(1)
      : Number(
          product.rating ||
            product.averageRating ||
            product.ratings ||
            0
        ).toFixed(1);

  const reviewCount =
    reviews.length > 0
      ? reviews.length
      : Number(
          product.reviewCount ||
            product.totalReviews ||
            0
        );

  const sortedReviews = [...reviews].sort((a, b) => {
    const aTime = a.createdAt?.seconds || 0;
    const bTime = b.createdAt?.seconds || 0;

    return bTime - aTime;
  });

  const handleSubmitReview = (e) => {
    e.preventDefault();

    alert(
      "Please submit your review from the product page so it can be saved properly."
    );

    setIsWritingReview(false);
    setComment("");
    setName("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#FAF9F6] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-white">
          <div>
            <h3 className="text-lg font-medium text-neutral-900">
              Customer Reviews
            </h3>

            <p className="text-xs text-neutral-500 line-clamp-1">
              {product.name || product.title}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 hover:bg-black hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {!isWritingReview ? (
            <>
              {/* Rating Overview */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-light text-neutral-900">
                      {calculatedRating}
                    </span>

                    <span className="text-xs text-neutral-500">
                      {reviewCount}{" "}
                      {reviewCount === 1
                        ? "review"
                        : "reviews"}
                    </span>
                  </div>

                  <div className="flex text-amber-500 text-lg mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star}>
                        {star <=
                        Math.round(
                          Number(calculatedRating)
                        )
                          ? "★"
                          : "☆"}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setIsWritingReview(true)
                  }
                  className="bg-[#C5A059] text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors shadow-md"
                >
                  Write a review
                </button>
              </div>

              {/* Reviews List */}
              {sortedReviews.length > 0 ? (
                <div className="divide-y divide-neutral-200 mt-4">
                  {sortedReviews.map((review) => (
                    <div
                      key={review.id}
                      className="py-4"
                    >
                      <div className="flex text-amber-500 text-sm">
                        {[1, 2, 3, 4, 5].map(
                          (star) => (
                            <span key={star}>
                              {star <=
                              Number(
                                review.rating || 0
                              )
                                ? "★"
                                : "☆"}
                            </span>
                          )
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-semibold text-xs text-neutral-900">
                          {review.name || "Customer"}
                        </span>

                        <span className="bg-neutral-200 text-neutral-700 text-[9px] px-1.5 py-0.5 rounded font-medium">
                          Verified
                        </span>
                      </div>

                      <span className="text-[10px] text-neutral-400">
                        {review.date ||
                          "Recent Review"}
                      </span>

                      {review.comment && (
                        <p className="text-xs text-neutral-700 mt-2">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <div className="text-amber-500 text-xl mb-2">
                    ☆☆☆☆☆
                  </div>

                  <p className="text-sm font-semibold text-neutral-900">
                    No reviews yet
                  </p>

                  <p className="text-xs text-neutral-500 mt-1">
                    Be the first customer to review
                    this product.
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Write Review Form */
            <form
              onSubmit={handleSubmitReview}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                  Write Your Feedback
                </h4>

                <button
                  type="button"
                  onClick={() =>
                    setIsWritingReview(false)
                  }
                  className="text-xs text-neutral-500 hover:underline"
                >
                  ← Back to reviews
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Rating
                </label>

                <div className="flex gap-2 text-2xl text-amber-500 cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setRating(star)
                      }
                      className="cursor-pointer"
                    >
                      {star <= rating ? "★" : "☆"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Your Name
                </label>

                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Enter your name"
                  className="w-full p-2.5 text-xs border border-neutral-300 rounded-lg bg-white focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Review / Feedback
                </label>

                <textarea
                  required
                  rows="4"
                  value={comment}
                  onChange={(e) =>
                    setComment(e.target.value)
                  }
                  placeholder="Write your experience with this product..."
                  className="w-full p-2.5 text-xs border border-neutral-300 rounded-lg bg-white focus:outline-none focus:border-black"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#C5A059] transition-colors shadow-md"
              >
                Submit Review
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// HOME
// ============================================================

function Home() {
  const { addToCart } = useContext(CartContext);

  const {
    toggleWishlist,
    isInWishlist,
  } = useStore();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviewsByProduct, setReviewsByProduct] =
    useState({});
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isReviewsModalOpen, setIsReviewsModalOpen] =
    useState(false);

  const [
    activeProductForReviews,
    setActiveProductForReviews,
  ] = useState(null);

  const [
    activeReviewsForProduct,
    setActiveReviewsForProduct,
  ] = useState([]);

  // ============================================================
  // FETCH DATA FROM FIREBASE
  // ============================================================

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [
          catSnapshot,
          prodSnapshot,
          reviewSnapshot,
        ] = await Promise.all([
          getDocs(collection(db, "categories")),
          getDocs(collection(db, "products")),
          getDocs(collection(db, "reviews")),
        ]);

        const catList = catSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const prodList = prodSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // ========================================================
        // GROUP REVIEWS BY PRODUCT ID
        // ========================================================

        const groupedReviews = {};

        reviewSnapshot.docs.forEach((reviewDoc) => {
          const reviewData = reviewDoc.data();

          const productId = String(
            reviewData.productId || ""
          ).trim();

          if (!productId) return;

          if (!groupedReviews[productId]) {
            groupedReviews[productId] = [];
          }

          groupedReviews[productId].push({
            id: reviewDoc.id,
            ...reviewData,
          });
        });

        if (isMounted) {
          setCategories(catList);
          setProducts(prodList);
          setReviewsByProduct(groupedReviews);
        }
      } catch (error) {
        console.error(
          "Error fetching homepage data:",
          error
        );

        if (isMounted) {
          setProducts([]);
          setReviewsByProduct({});
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  // ============================================================
  // GET PRODUCT IMAGE
  // ============================================================

  const getProductImage = (product) => {
    if (!product) return FALLBACK_IMAGE;

    const rawImage =
      product.image ||
      product.imageUrl ||
      product.img ||
      product.thumbnail;

    const extractedRawImage =
      extractImageUrl(rawImage);

    if (extractedRawImage) {
      return extractedRawImage;
    }

    if (
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      const firstImage = extractImageUrl(
        product.images[0]
      );

      if (firstImage) {
        return firstImage;
      }
    }

    return FALLBACK_IMAGE;
  };

  // ============================================================
  // GET CATEGORY IMAGE
  // ============================================================

  const getCategoryImage = (category) => {
    if (!category) return FALLBACK_IMAGE;

    const rawImage =
      category.image ||
      category.imageUrl ||
      category.img ||
      category.thumbnail ||
      category.photo;

    const extractedImage =
      extractImageUrl(rawImage);

    if (extractedImage) {
      return extractedImage;
    }

    if (
      Array.isArray(category.images) &&
      category.images.length > 0
    ) {
      const firstImage = extractImageUrl(
        category.images[0]
      );

      if (firstImage) {
        return firstImage;
      }
    }

    return FALLBACK_IMAGE;
  };

  // ============================================================
  // OPEN PRODUCT REVIEWS
  // ============================================================

  const openReviews = (product) => {
    const productId =
      product.id ||
      product._id ||
      product.sku;

    const productReviews =
      reviewsByProduct[String(productId)] || [];

    setActiveProductForReviews({
      ...product,
      id: productId,
    });

    setActiveReviewsForProduct(productReviews);

    setIsReviewsModalOpen(true);
  };

  // ============================================================
  // CLOSE REVIEWS
  // ============================================================

  const closeReviews = () => {
    setIsReviewsModalOpen(false);
    setActiveProductForReviews(null);
    setActiveReviewsForProduct([]);
  };

  const displayProducts = products;

  return (
    <div className="bg-white">
      <Helmet>
        <title>
          Opera PK | Fine Jewellery & Luxury Collections
        </title>

        <meta
          name="description"
          content="Explore exquisite handcrafted jewellery and luxury collections at Opera PK. Premium American zircon jewellery with cash on delivery across Pakistan."
        />
      </Helmet>

      <style>{`
        @keyframes tickerSlide {
          0% {
            transform: translateX(0);
          }

          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes marqueeSlide {
          0% {
            transform: translateX(0);
          }

          100% {
            transform: translateX(-33.333%);
          }
        }

        .animate-ticker {
          display: flex;
          width: max-content;
          animation: tickerSlide 28s linear infinite;
        }

        .animate-ticker:hover {
          animation-play-state: paused;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <Hero />

      {/* ANNOUNCEMENT TICKER */}
      <section className="bg-black text-[#C5A059] py-2.5 sm:py-3.5 overflow-hidden border-t border-b border-[#C5A059]/30">
        <div className="relative w-full overflow-hidden flex">
          <div className="animate-ticker items-center text-[8px] sm:text-xs tracking-[0.14em] sm:tracking-[0.18em] uppercase font-medium">
            <div className="flex items-center gap-7 sm:gap-12 shrink-0 px-5 sm:px-6">
              <span className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
                💎{" "}
                <span>
                  Premium American Zircon & Jewellery
                </span>
              </span>

              <span>•</span>

              <span className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
                🚚{" "}
                <span>
                  Free Shipping On Orders Above Rs. 3,000
                </span>
              </span>

              <span>•</span>

              <span className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
                💵{" "}
                <span>
                  Cash On Delivery All Across Pakistan
                </span>
              </span>
            </div>

            <div className="flex items-center gap-7 sm:gap-12 shrink-0 px-5 sm:px-6">
              <span className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
                💎{" "}
                <span>
                  Premium American Zircon & Jewellery
                </span>
              </span>

              <span>•</span>

              <span className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
                🚚{" "}
                <span>
                  Free Shipping On Orders Above Rs. 3,000
                </span>
              </span>

              <span>•</span>

              <span className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
                💵{" "}
                <span>
                  Cash On Delivery All Across Pakistan
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT CONTAINER */}
      <div className="w-full px-2 sm:px-4 lg:px-8 py-8">

        {/* OUR COLLECTIONS */}
        <section className="w-full pt-4 pb-10">

          {/* HEADING */}
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-[20px] sm:text-[24px] font-light uppercase tracking-[0.25em] text-neutral-900">
              Our Collections
            </h2>

            <div className="flex items-center justify-center mt-4">
              <div className="w-8 h-[1px] bg-[#C5A059]/50" />

              <span className="mx-3 text-[9px] tracking-[0.25em] text-[#C5A059] uppercase font-medium">
                Explore
              </span>

              <div className="w-8 h-[1px] bg-[#C5A059]/50" />
            </div>
          </div>

          {categories.length > 0 ? (
            <div className="relative w-full">
              <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto scrollbar-hide py-3 px-2 sm:px-4 justify-start md:justify-center">
                {categories.map((cat) => (
                  <Link
                    to={`/shop?category=${encodeURIComponent(
                      cat.name || ""
                    )}`}
                    key={cat.id}
                    className="collection-card group flex flex-col items-center text-center shrink-0 w-[110px] sm:w-[150px] md:w-[170px]"
                  >
                    <div className="relative w-[85px] h-[85px] sm:w-[120px] sm:h-[120px] md:w-[135px] md:h-[135px]">
                      <div className="absolute inset-0 rounded-full border-[2px] border-[#C5A059] group-hover:scale-105 transition-all duration-300" />

                      <div className="absolute inset-[4px] sm:inset-[6px] rounded-full overflow-hidden bg-neutral-50 shadow-sm">
                        <img
                          src={getCategoryImage(cat)}
                          alt={
                            cat.name ||
                            "Opera Collection"
                          }
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    <h3 className="mt-3.5 text-xs sm:text-sm font-semibold tracking-[0.12em] uppercase text-neutral-900 group-hover:text-[#C5A059] transition-colors line-clamp-1 w-full px-1">
                      {cat.name || "Collection"}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 text-xs py-8">
              No collections added yet.
            </div>
          )}

          {/* CURATED FOR YOU HEADING */}
          <div className="text-center mt-20 mb-12">
            <h3 className="text-[20px] sm:text-[24px] font-light uppercase tracking-[0.25em] text-neutral-900">
              Curated For You
            </h3>

            <div className="flex items-center justify-center mt-4">
              <div className="w-8 h-[1px] bg-[#C5A059]/50" />

              <span className="mx-3 text-[9px] tracking-[0.25em] text-[#C5A059] uppercase font-medium">
                Selection
              </span>

              <div className="w-8 h-[1px] bg-[#C5A059]/50" />
            </div>
          </div>

          {/* PRODUCTS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {loading && displayProducts.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500 text-sm">
                Loading collections...
              </div>
            ) : displayProducts.length > 0 ? (
              displayProducts
                .slice(0, 8)
                .map((product) => {
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

                  const originalPrice = Number(
                    product.originalPrice ||
                      product.comparePrice ||
                      product.oldPrice ||
                      0
                  );

                  const currentDisplayPrice =
                    discountPrice || actualPrice;

                  const hasDiscount =
                    originalPrice >
                    currentDisplayPrice;

                  const mainImage =
                    getProductImage(product);

                  const isWishlisted =
                    isInWishlist(productId);

                  // ==================================================
                  // REAL FIRESTORE REVIEWS
                  // ==================================================

                  const productReviews =
                    reviewsByProduct[
                      String(productId)
                    ] || [];

                  const validRatings =
                    productReviews
                      .map((review) =>
                        Number(review.rating || 0)
                      )
                      .filter(
                        (ratingValue) =>
                          ratingValue > 0
                      );

                  let rating = 0;

                  if (validRatings.length > 0) {
                    rating =
                      validRatings.reduce(
                        (sum, ratingValue) =>
                          sum + ratingValue,
                        0
                      ) / validRatings.length;
                  } else {
                    rating = Number(
                      product.rating ||
                        product.averageRating ||
                        product.ratings ||
                        0
                    );
                  }

                  const reviewCount =
                    productReviews.length > 0
                      ? productReviews.length
                      : Number(
                          product.reviewCount ||
                            product.totalReviews ||
                            0
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

                      {/* PRODUCT IMAGE CAROUSEL */}
                      <div className="relative">
                        <ProductImageCarousel
                          product={product}
                          productId={productId}
                          productName={
                            product.name ||
                            product.title
                          }
                        />

                        {/* QUICK VIEW BUTTON */}
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

                          {/* PRICE AND REVIEW STARS */}
                          <div className="flex flex-col mt-2.5">
                            <div className="flex items-center justify-between gap-2">

                              {/* PRICE */}
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

                              {/* =================================================
                                  CLICKABLE REVIEW STARS
                                  ================================================= */}
                              <button
                                type="button"
                                onClick={() =>
                                  openReviews(product)
                                }
                                aria-label={`View ${reviewCount} reviews for ${
                                  product.name ||
                                  product.title ||
                                  "product"
                                }`}
                                className="flex items-center gap-1 cursor-pointer group/reviews shrink-0"
                              >
                                <div className="flex text-amber-500 text-[16px] sm:text-[18px] transition-transform duration-200 group-hover/reviews:scale-105">
                                  {[1, 2, 3, 4, 5].map(
                                    (star) => (
                                      <span
                                        key={star}
                                        className="leading-none"
                                      >
                                        {star <=
                                        Math.round(
                                          rating
                                        )
                                          ? "★"
                                          : "☆"}
                                      </span>
                                    )
                                  )}
                                </div>

                                <span className="text-[10px] sm:text-[11px] text-neutral-500 font-medium group-hover/reviews:text-black transition-colors">
                                  ({reviewCount})
                                </span>
                              </button>
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
                })
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500 text-sm">
                No products found.
              </div>
            )}
          </div>
        </section>

        {/* BEST SELLER / FEATURED COLLECTION SLIDER */}
        <BestSeller
          products={products}
          addToCart={addToCart}
          toggleWishlist={toggleWishlist}
          isInWishlist={isInWishlist}
        />
      </div>

      {/* ========================================================
          REVIEWS MODAL
          ======================================================== */}

      <ReviewsModal
        isOpen={isReviewsModalOpen}
        onClose={closeReviews}
        product={activeProductForReviews}
        reviews={activeReviewsForProduct}
      />
    </div>
  );
}

export default Home;