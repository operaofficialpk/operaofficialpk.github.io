import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function Checkout({ cart, totalPrice, onOrderSuccess }) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState("Punjab");
  const [city, setCity] = useState("Faisalabad");
  const [phone, setPhone] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!firstName || !phone || !address || cart.length === 0) {
      alert("براہ کرم تمام لازمی خانے پر کریں!");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "orders"), {
        customerName: `${firstName} ${lastName}`.trim(),
        email,
        phone,
        address,
        province,
        city,
        items: cart,
        total: totalPrice,
        orderNote: orderNote || "",
        status: "Pending",
        isDeleted: false,
        createdAt: serverTimestamp(),
      });
      alert("آرڈر کامیابی سے پلیس ہو گیا!");
      if (onOrderSuccess) onOrderSuccess();
    } catch (error) {
      console.error("Order error:", error);
      alert("آرڈر پلیس کرنے میں مسئلہ پیش آیا۔");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCheckout} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 max-w-lg mx-auto space-y-4">
      <h3 className="text-lg font-bold text-gray-900">CHECKOUT DETAILS</h3>
      
      <div>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-black transition"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input 
          type="text" 
          value={firstName} 
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First Name" required
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-black transition"
        />
        <input 
          type="text" 
          value={lastName} 
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last Name"
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-black transition"
        />
      </div>

      <div>
        <input 
          type="text" 
          value={address} 
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address (House No, Street, Area)" required
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-black transition"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <select 
          value={province} 
          onChange={(e) => setProvince(e.target.value)}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-black transition cursor-pointer bg-white"
        >
          <option value="Punjab">Punjab</option>
          <option value="Sindh">Sindh</option>
          <option value="KPK">KPK</option>
          <option value="Balochistan">Balochistan</option>
        </select>

        <select 
          value={city} 
          onChange={(e) => setCity(e.target.value)}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-black transition cursor-pointer bg-white"
        >
          <option value="Faisalabad">Faisalabad</option>
          <option value="Lahore">Lahore</option>
          <option value="Karachi">Karachi</option>
          <option value="Islamabad">Islamabad</option>
          <option value="Rawalpindi">Rawalpindi</option>
        </select>
      </div>

      <div>
        <input 
          type="text" 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone Number (03XXXXXXXXX)" required
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-black transition"
        />
      </div>

      {/* Order Note Field Added Here */}
      <div>
        <textarea
          value={orderNote}
          onChange={(e) => setOrderNote(e.target.value)}
          placeholder="Order Note / Special Instructions (Optional)"
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-black transition resize-none"
          rows="2"
        />
      </div>

      <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs font-bold text-gray-700">Total:</span>
        <span className="text-sm font-black text-gray-900">Rs. {totalPrice.toLocaleString()}</span>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-3.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition cursor-pointer"
      >
        {loading ? "Placing Order..." : "Complete Order"}
      </button>
    </form>
  );
}

export default Checkout;