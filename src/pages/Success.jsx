import { Link } from "react-router-dom";

function Success() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12">
      <div className="bg-white shadow-xl rounded-3xl p-8 md:p-12 text-center max-w-lg border border-gray-100">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
          ✓
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Order Received!
        </h1>

        <p className="text-gray-600 mt-4 leading-relaxed text-sm md:text-base">
          Thank you for choosing <span className="font-semibold text-black">Opera Official PK</span>. Your order details have been forwarded via WhatsApp, and our team will confirm your order shortly.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/shop"
            className="bg-black text-white px-8 py-3.5 rounded-full font-medium hover:bg-gray-800 transition cursor-pointer"
          >
            Continue Shopping
          </Link>
          <Link
            to="/"
            className="bg-gray-100 text-gray-800 px-8 py-3.5 rounded-full font-medium hover:bg-gray-200 transition cursor-pointer"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Success;