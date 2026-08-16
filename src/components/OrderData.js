// OrderData.js

// یہ فنکشن واٹس ایپ اور فائر بیس دونوں کے لیے ڈیٹا کو کلین اور سیف کرے گا
export const formatOrderData = (customer, cart, subtotal, shipping, total) => {
  return {
    customerName: `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || "Guest Customer",
    email: customer.email ? customer.email.trim() : "",
    phone: customer.phone ? customer.phone.trim() : "",
    address: customer.address ? customer.address.trim() : "",
    city: customer.city ? customer.city.trim() : "",
    postalCode: customer.postalCode ? customer.postalCode.trim() : "",
    
    // کارٹ اور رقم کی تفصیل
    items: cart || [],
    subtotal: subtotal || 0,
    shipping: shipping || 0,
    total: total || 0,
    
    // ایڈمن پینل کے لیے ضروری سٹیٹس
    status: "Pending",
    isDeleted: false,
    createdAt: new Date(),
  };
};

// یہ فنکشن چیک کرے گا کہ تمام ضروری فیلڈز بھری گئی ہیں یا نہیں
export const validateOrderForm = (customer) => {
  if (!customer.firstName || !customer.firstName.trim()) {
    return "Please enter your first name.";
  }
  if (!customer.lastName || !customer.lastName.trim()) {
    return "Please enter your last name.";
  }
  if (!customer.phone || !customer.phone.trim()) {
    return "Please enter your phone number.";
  }
  if (!customer.address || !customer.address.trim()) {
    return "Please enter your complete address.";
  }
  if (!customer.city || !customer.city.trim()) {
    return "Please enter your city.";
  }
  return null; // اگر سب ٹھیک ہے تو کوئی ایرر نہیں
};