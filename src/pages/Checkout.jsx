import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

function Checkout() {
  const { cart, totalPrice, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
  });

  const handleChange = (e) => {
    setCustomer({
      ...customer,
      [e.target.name]: e.target.value,
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Aapka cart khali hai!");
      return;
    }

    if (!customer.name || !customer.phone || !customer.address || !customer.city) {
      alert("Barah-e-karam tamam fields pur karein.");
      return;
    }

    setLoading(true);

    const orderPayload = {
      customer,
      items: cart,
      totalAmount: totalPrice,
      status: "Pending",
      createdAt: new Date(),
    };

    try {
      // 1. Firebase Firestore mein order save karein
      await addDoc(collection(db, "orders"), orderPayload);

      // 2. WhatsApp message tayar karein
      const orderMessage = `*NEW ORDER - OPERA OFFICIAL PK*\n\n` +
        `*Customer Details:*\n` +
        `Name: ${customer.name}\n` +
        `Phone: ${customer.phone}\n` +
        `Address: ${customer.address}\n` +
        `City: ${customer.city}\n\n` +
        `*Items:*\n` +
        cart.map((item) => `- ${item.name} x${item.quantity} (Rs. ${item.price * item.quantity})`).join("\n") +
        `\n\n*Total Amount:* Rs. ${totalPrice}`;

      // 3. Cart clear karein
      clearCart();

      // 4. WhatsApp open karein
      window.open(
        `https://wa.me/923173355420?text=${encodeURIComponent(orderMessage)}`,
        "_blank"
      );

      // 5. Success page par bhej dein
      navigate("/success");
    } catch (error) {
      console.error("Error saving order:", error);
      alert("Order save karne mein masla aaya hai. Dobara koshish karein.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <section className="min-h-screen bg-gray-50 py-16 px-6 text-center">
        <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl p-10">
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-500 mb-6">Order place karne ke liye pehle cart mein products add karein.</p>
          <button
            onClick={() => navigate("/shop")}
            className="bg-black text-white px-8 py-3 rounded-full font-semibold"
          >
            Go to Shop
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl p-10">
        <h1 className="text-4xl font-bold text-center mb-10">Checkout</h1>

        <form onSubmit={handlePlaceOrder} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={customer.name}
            onChange={handleChange}
            required
            className="w-full border p-4 rounded-xl outline-none focus:border-black"
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={customer.phone}
            onChange={handleChange}
            required
            className="w-full border p-4 rounded-xl outline-none focus:border-black"
          />

          <input
            type="text"
            name="address"
            placeholder="Complete Address"
            value={customer.address}
            onChange={handleChange}
            required
            className="w-full border p-4 rounded-xl outline-none focus:border-black"
          />

          <input
            type="text"
            name="city"
            placeholder="City"
            value={customer.city}
            onChange={handleChange}
            required
            className="w-full border p-4 rounded-xl outline-none focus:border-black"
          />

          <div className="border-t border-b py-4 my-6">
            <h2 className="text-xl font-bold mb-2">Order Summary</h2>
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Amount:</span>
              <span>Rs. {totalPrice}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-center bg-green-600 hover:bg-green-700 text-white py-4 rounded-full font-bold text-lg transition cursor-pointer ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Processing Order..." : "Place Order On WhatsApp"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default Checkout;