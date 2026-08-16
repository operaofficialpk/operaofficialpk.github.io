import React from "react";
import { calculateDiscount } from "../../utils/pricing.js";

export const DiscountBadge = ({ originalPrice, discountPrice }) => {
  const { discountPercentage, hasDiscount } = calculateDiscount(originalPrice, discountPrice);

  if (!hasDiscount) return null;

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
      {discountPercentage}% OFF
    </span>
  );
};