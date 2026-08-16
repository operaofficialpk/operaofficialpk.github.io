import React from "react";
import { calculateDiscount } from "../../utils/pricing.js";

export const PriceDisplay = ({ originalPrice, discountPrice, size = "md" }) => {
  const { hasDiscount } = calculateDiscount(originalPrice, discountPrice);

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl font-bold",
  };

  return (
    <div className="flex items-center gap-2">
      {hasDiscount ? (
        <>
          <span className={`${textSizes[size]} text-emerald-600 dark:text-emerald-400 font-semibold`}>
            Rs. {Number(discountPrice).toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 line-through">
            Rs. {Number(originalPrice).toLocaleString()}
          </span>
        </>
      ) : (
        <span className={`${textSizes[size]} text-slate-900 dark:text-white font-semibold`}>
          Rs. {Number(originalPrice).toLocaleString()}
        </span>
      )}
    </div>
  );
};