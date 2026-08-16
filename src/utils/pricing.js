// src/utils/pricing.js

export const calculateDiscount = (originalPrice, discountPrice) => {
  const orig = Number(originalPrice) || 0;
  const disc = Number(discountPrice) || 0;

  if (orig <= 0 || disc <= 0 || disc >= orig) {
    return {
      discountAmount: 0,
      discountPercentage: 0,
      hasDiscount: false,
    };
  }

  const discountAmount = orig - disc;
  const discountPercentage = Math.round((discountAmount / orig) * 100);

  return {
    discountAmount,
    discountPercentage,
    hasDiscount: discountPercentage > 0,
  };
};

export const validatePrices = (originalPrice, discountPrice) => {
  const orig = Number(originalPrice);
  const disc = Number(discountPrice);

  if (isNaN(orig) || orig <= 0) {
    return { isValid: false, error: "Original price must be greater than 0." };
  }

  if (!isNaN(disc) && disc < 0) {
    return { isValid: false, error: "Discount price cannot be negative." };
  }

  if (!isNaN(disc) && disc > 0 && disc >= orig) {
    return { isValid: false, error: "Discount price must be lower than original price." };
  }

  return { isValid: true, error: null };
};