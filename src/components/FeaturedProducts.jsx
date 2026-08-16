import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

// Helper function to handle string or Cloudinary object image formats
const extractImageUrl = (item) => {
  if (!item) return null;
  if (typeof item === "string") return item.trim();
  if (typeof item === "object") {
    return item.secure_url || item.url || item.src || item.image || null;
  }
  return null;
};

function FeaturedProducts() {
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Track selected image and variant per product dynamically: { [productId]: { image, colorName } }
  const [productSelections, setProductSelections] = useState({});

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsList);

        // Initialize default selections
        const initialSelections = {};
        productsList.forEach((prod) => {
          const defaultImg =
            extractImageUrl(prod.image) ||
            extractImageUrl(prod.imageUrl) ||
            (Array.isArray(prod.images) && extractImageUrl(prod.images[0])) ||
            "https://via.placeholder.com/400x500?text=No+Image";

          initialSelections[prod.id] = {
            image: defaultImg,
            colorName: prod.variants?.[0]?.colorName || "Default",
          };
        });
        setProductSelections(initialSelections);
      } catch (error) {
        console.error("Error fetching products: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleVariantSelect = (productId, variant) => {
    setProductSelections((prev) => ({
      ...prev,
      [productId]: {
        image: extractImageUrl(variant.imageUrl) || prev[productId]?.image,
        colorName: variant.colorName,
      },
    }));
  };

  const handleAddToCart = (product) => {
    const selection = productSelections[product.id] || {};
    addToCart({
      ...product,
      selectedImage: selection.image || extractImageUrl(product.image) || extractImageUrl(product.imageUrl),
      selectedColor: selection.colorName || "Default",
      quantity: 1,
    });
    navigate("/cart");
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-400 text-xs uppercase tracking-[0.2em] font-medium font-serif">
        Loading Luxury Collection...
      </div>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-12 bg-white font-serif text-gray-900 tracking-wide">
      {/* Section Heading */}
      <div className="text-center mb-14 space-y-3">
        <h2 className="text-2xl sm:text-3xl font-light tracking-[0.2em] uppercase text-gray-900">
          Featured Products
        </h2>
        <div className="w-12 h-[2px] bg-[#c5a059] mx-auto"></div>
        <p className="text-xs text-gray-500 uppercase tracking-widest font-light">
          Handcrafted Elegance You Deserve
        </p>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {products.map((product) => {
          const currentSelection = productSelections[product.id] || {};
          const imageSrc =
            currentSelection.image ||
            extractImageUrl(product.image) ||
            extractImageUrl(product.imageUrl) ||
            (Array.isArray(product.images) && extractImageUrl(product.images[0])) ||
            "https://via.placeholder.com/400x500?text=No+Image";

          // Calculate Discount percentage
          const discountPercent =
            product.originalPrice &&
            Number(product.originalPrice) > Number(product.price)
              ? Math.round(
                  ((Number(product.originalPrice) - Number(product.price)) /
                    Number(product.originalPrice)) *
                    100
                )
              : product.discountPercent || 24;

          return (
            <div
              key={product.id}
              className="group flex flex-col justify-between space-y-4"
            >
              {/* Product Image Container */}
              <div className="relative overflow-hidden rounded-xl bg-[#f9f9f9] aspect-[4/5] shadow-sm">
                
                {/* Larger & Bold Black & White Discount Badge */}
                <div className="absolute top-3 left-3 z-30 bg-black text-white px-5 py-2 rounded-lg text-xs sm:text-sm font-black tracking-widest shadow-lg flex items-center justify-center uppercase border border-neutral-800">
                  {discountPercent}% OFF
                </div>

                {/* Main Product Link & Image */}
                <Link
                  to={`/product/${product.id}`}
                  className="block w-full h-full"
                >
                  <img
                    src={imageSrc}
                    alt={product.name || product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </Link>

                {/* Floating Quick View Bar */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md py-2.5 px-4 rounded-lg shadow-md flex items-center justify-between opacity-95 group-hover:opacity-100 transition-opacity z-10">
                  <Link
                    to={`/product/${product.id}`}
                    className="text-xs font-medium text-gray-900 hover:text-[#c5a059] flex items-center gap-1.5 tracking-wider uppercase"
                  >
                    <span>Quick View</span>
                    <span className="text-sm">→</span>
                  </Link>

                  <div className="flex items-center gap-3 text-gray-700">
                    <button
                      title="Add to Wishlist"
                      className="p-1 hover:text-[#c5a059] transition cursor-pointer"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Color Swatches Section */}
              {Array.isArray(product.variants) && product.variants.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  {product.variants.map((v, i) => {
                    const isSelected = currentSelection.colorName === v.colorName;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleVariantSelect(product.id, v)}
                        style={{ backgroundColor: v.colorCode || "#000" }}
                        className={`w-6 h-6 rounded-full transition-all shadow-xs cursor-pointer ${
                          isSelected
                            ? "ring-2 ring-gray-900 ring-offset-2 scale-110"
                            : "hover:scale-105 border border-gray-300 opacity-80 hover:opacity-100"
                        }`}
                        title={v.colorName}
                      />
                    );
                  })}
                </div>
              )}

              {/* Title & Pricing Info */}
              <div className="space-y-1.5 text-center sm:text-left">
                <Link
                  to={`/product/${product.id}`}
                  className="block text-sm font-normal text-gray-800 hover:text-[#c5a059] transition-colors line-clamp-1 tracking-wide"
                >
                  {product.name || product.title}
                </Link>

                <div className="flex items-center justify-center sm:justify-start gap-3">
                  {product.originalPrice && (
                    <span className="text-xs text-gray-400 line-through font-light">
                      Rs. {Number(product.originalPrice).toLocaleString()}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-gray-900 tracking-wider">
                    Rs. {Number(product.price || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Add To Cart Button */}
              <button
                onClick={() => handleAddToCart(product)}
                className="w-full bg-[#1a1a1a] hover:bg-[#c5a059] text-white text-xs font-medium uppercase tracking-[0.1em] py-3.5 rounded-lg shadow-sm transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 mt-1"
              >
                <svg
                  className="w-4 h-4 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
                <span>Add To Cart</span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default FeaturedProducts;