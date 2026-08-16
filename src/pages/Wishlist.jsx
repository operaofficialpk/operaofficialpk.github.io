import React from "react";
import { useStore } from "../context/StoreContext";
import { Trash2, ShoppingBag, Heart } from "lucide-react";

export default function Wishlist() {
  const { wishlist, toggleWishlist } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" /> My Wishlist
          </h1>
          <p className="text-sm text-slate-500">Items you have saved for later</p>
        </div>
        <span className="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
          {wishlist.length} {wishlist.length === 1 ? "Item" : "Items"}
        </span>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your wishlist is empty</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            You haven't added any products to your wishlist yet. Explore our shop and save your favorite items!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col group"
            >
              <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={product.image || "https://via.placeholder.com/300"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <button
                  onClick={() => toggleWishlist(product)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-red-500 hover:bg-white dark:hover:bg-slate-900 transition shadow-sm cursor-pointer"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {product.category || "General"}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      Rs. {product.discountPrice || product.originalPrice}
                    </span>
                    {product.discountPrice && product.originalPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        Rs. {product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    // Agar aapke paas cart ka function hai toh yahan add to cart laga sakte hain
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-slate-900 py-2.5 rounded-xl font-medium text-xs hover:opacity-90 transition cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" /> Move to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}