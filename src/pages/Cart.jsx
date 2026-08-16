import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

// Pakistan Cities List
const PAKISTAN_CITIES = [
  "Faisalabad", "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Multan", "Peshawar", "Quetta", "Gujranwala", "Sialkot", 
  "Hyderabad", "Abbottabad", "Bahawalpur", "Sargodha", "Sukkur", "Larkana", "Sheikhupura", "Jhang", "Rahim Yar Khan", 
  "Gujrat", "Mardan", "Kasur", "Dera Ghazi Khan", "Nawabshah", "Sahiwal", "Mirpur Khas", "Okara", "Mingora", "Chiniot", 
  "Kamike", "Hafizabad", "Sadiqabad", "Burewala", "Jacobabad", "Muzaffargarh", "Murree", "Attock", "Jhelum", "Khanewal", 
  "Dadu", "Gojra", "Vehari", "Hub", "Chaman", "Khuzdar", "Turbat", "Swabi", "Nowshera", "Charsadda", "Mansehra", 
  "Muzaffarabad", "Mirpur (AJK)", "Gilgit", "Skardu"
].sort();

const PROVINCES = [
  "Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Islamabad Capital Territory", "Azad Kashmir", "Gilgit-Baltistan"
];

const emptyCustomerState = {
  email: "",
  emailOffers: true,
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  province: "",
  country: "Pakistan",
  postalCode: "",
  phone: "",
  orderNote: "",
  saveInfo: false,
};

export default function Cart() {
  const { cart, isCartOpen, closeCart, removeFromCart, clearCart } = useContext(CartContext);
  const [step, setStep] = useState("cart"); 
  
  useEffect(() => {
    if (isCartOpen && step === "success" && cart.length > 0) {
      setStep("cart");
    }
  }, [isCartOpen, cart.length, step]);

  const [customer, setCustomer] = useState(() => {
    try {
      const savedData = localStorage.getItem("opera_customer_info");
      return savedData ? JSON.parse(savedData) : emptyCustomerState;
    } catch {
      return emptyCustomerState;
    }
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedCustomer = {
      ...customer,
      [name]: type === "checkbox" ? checked : value,
    };
    setCustomer(updatedCustomer);
    
    try {
      if (updatedCustomer.saveInfo) {
        localStorage.setItem("opera_customer_info", JSON.stringify(updatedCustomer));
      } else {
        localStorage.removeItem("opera_customer_info");
      }
    } catch (err) {
      console.error(err);
    }
    if (error) setError("");
  };

  const subtotal = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
  const shipping = subtotal > 0 ? 250 : 0;
  const total = subtotal + shipping;

  const handlePlaceOrder = async () => {
    if (!customer.firstName.trim() || !customer.lastName.trim() || !customer.phone.trim() || !customer.address.trim() || !customer.city.trim() || !customer.province.trim()) {
      setError("Please complete all required customer details.");
      return;
    }

    setLoading(true);
    try {
      const newOrder = {
        customerName: `${customer.firstName.trim()} ${customer.lastName.trim()}`,
        ...customer,
        items: cart.map(item => ({
          name: item.name || item.title || "Product",
          price: Number(item.price || 0),
          originalPrice: Number(item.originalPrice || item.comparePrice || 0),
          quantity: Number(item.quantity || 1),
          color: item.selectedColor || "Default",
          image: item.selectedImage || item.image || ""
        })),
        total: total,
        orderNote: customer.orderNote || "",
        status: "Pending",
        createdAt: new Date()
      };

      await addDoc(collection(db, "orders"), newOrder);
      if (!customer.saveInfo) localStorage.removeItem("opera_customer_info");
      
      clearCart();
      setStep("success");
    } catch (err) {
      console.error(err);
      setError("Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  if (!isCartOpen) return null;
  const totalItemsCount = cart.reduce((sum, item) => sum + Number(item.quantity || 1), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm" onClick={closeCart} />
      
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden z-10">
        <div className="flex items-center justify-between px-7 py-6 border-b border-neutral-100">
          <h2 className="text-lg font-bold uppercase tracking-wide">
            {step === "cart" && `Shopping Bag ( ${totalItemsCount} )`}
            {step === "checkout" && "Checkout Details"}
            {step === "success" && "Order Placed"}
          </h2>
          <button onClick={closeCart} className="text-xl cursor-pointer">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {step === "cart" && (
            <div className="space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-neutral-500 mb-4">Your bag is empty.</p>
                  <button onClick={closeCart} className="px-6 py-3 bg-black text-white rounded-2xl text-xs uppercase font-bold tracking-wider cursor-pointer">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cart.map((item, index) => {
                  const itemPrice = Number(item.price || 0);
                  const itemOriginalPrice = Number(item.originalPrice || item.comparePrice || 0);
                  const hasDiscount = itemOriginalPrice > itemPrice;

                  return (
                    <div key={`${item.id}-${index}`} className="flex gap-4 p-4 bg-white border border-neutral-100 rounded-3xl items-center">
                      <div className="w-20 h-24 rounded-2xl bg-neutral-50 overflow-hidden shrink-0">
                        <img src={item.selectedImage || item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm uppercase">{item.name}</h4>
                        <p className="text-xs text-neutral-500 mb-1">QTY: {item.quantity}</p>
                        
                        {/* Prices with Cut Price Support */}
                        <div className="flex items-center gap-2">
                          {hasDiscount && (
                            <span className="text-xs text-neutral-400 line-through">
                              Rs. {(itemOriginalPrice * item.quantity).toLocaleString()}
                            </span>
                          )}
                          <span className="text-sm font-bold text-neutral-900">
                            Rs. {(itemPrice * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-neutral-400 cursor-pointer">✕</button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {step === "checkout" && (
            <div className="space-y-4">
              <button onClick={() => setStep("cart")} className="text-xs font-bold text-neutral-500 hover:text-black cursor-pointer">
                ← Back To Bag
              </button>

              {/* Order Summary inside Checkout */}
              <div className="p-4 bg-neutral-50 rounded-2xl space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Order Summary ({totalItemsCount} items)</p>
                <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                  {cart.map((item, index) => {
                    const itemPrice = Number(item.price || 0);
                    const itemOriginalPrice = Number(item.originalPrice || item.comparePrice || 0);
                    const hasDiscount = itemOriginalPrice > itemPrice;

                    return (
                      <div key={`checkout-${item.id}-${index}`} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <img src={item.selectedImage || item.image} alt={item.name} className="w-10 h-10 rounded-xl object-cover bg-neutral-200 shrink-0" />
                          <div>
                            <p className="font-semibold text-xs line-clamp-1">{item.name}</p>
                            <p className="text-xs text-neutral-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        
                        {/* Checkout Summary Prices */}
                        <div className="flex items-center gap-2 text-right">
                          {hasDiscount && (
                            <span className="text-[11px] text-neutral-400 line-through">
                              Rs. {(itemOriginalPrice * item.quantity).toLocaleString()}
                            </span>
                          )}
                          <span className="font-semibold text-xs">
                            Rs. {(itemPrice * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <input type="email" name="email" value={customer.email} onChange={handleChange} placeholder="Email" className="w-full p-4 rounded-2xl border" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="firstName" value={customer.firstName} onChange={handleChange} placeholder="First Name" className="w-full p-4 rounded-2xl border" />
                <input type="text" name="lastName" value={customer.lastName} onChange={handleChange} placeholder="Last Name" className="w-full p-4 rounded-2xl border" />
              </div>
              <textarea name="address" value={customer.address} onChange={handleChange} placeholder="Address" className="w-full p-4 rounded-2xl border" />
              
              {/* Province & City Grid */}
              <div className="grid grid-cols-2 gap-4">
                <select name="province" value={customer.province} onChange={handleChange} className="w-full p-4 rounded-2xl border bg-white">
                  <option value="">Select Province</option>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select name="city" value={customer.city} onChange={handleChange} className="w-full p-4 rounded-2xl border bg-white">
                  <option value="">Select City</option>
                  {PAKISTAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <input type="tel" name="phone" value={customer.phone} onChange={handleChange} placeholder="Phone" className="w-full p-4 rounded-2xl border" />

              {/* Order Note Field */}
              <div>
                <textarea
                  name="orderNote"
                  value={customer.orderNote}
                  onChange={handleChange}
                  placeholder="Order Note / Special Instructions (Optional)"
                  className="w-full p-4 rounded-2xl border outline-none focus:border-black transition resize-none"
                  rows="2"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                ✓
              </div>
              <h3 className="text-2xl font-bold">Thank You!</h3>
              <p className="text-neutral-500 mt-1">Your order has been placed.</p>
              <button onClick={closeCart} className="mt-6 px-8 py-3 bg-black text-white rounded-2xl cursor-pointer">Close</button>
            </div>
          )}
        </div>

        {cart.length > 0 && step !== "success" && (
          <div className="p-6 border-t bg-neutral-50">
            <div className="flex justify-between mb-4"><span>Total:</span><span className="font-bold">Rs. {total.toLocaleString()}</span></div>
            {step === "cart" ? (
              <button onClick={() => setStep("checkout")} className="w-full py-4 bg-black text-white rounded-2xl font-bold cursor-pointer">CHECKOUT</button>
            ) : (
              <button onClick={handlePlaceOrder} disabled={loading} className="w-full py-4 bg-black text-white rounded-2xl font-bold cursor-pointer">
                {loading ? "Processing..." : "Complete Order"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}