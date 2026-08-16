import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setSubmitted(false);
    setError("");

    try {
      const name = formData.name.trim();
      const email = formData.email.trim();
      const message = formData.message.trim();

      if (!name || !email || !message) {
        setError("Please fill in all fields.");
        setLoading(false);
        return;
      }

      await addDoc(collection(db, "contactMessages"), {
        name,
        email,
        message,
        status: "New",
        createdAt: serverTimestamp(),
      });

      setSubmitted(true);

      setFormData({
        name: "",
        email: "",
        message: "",
      });

      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err) {
      console.error("Contact message error:", err);

      setError(
        "Sorry, your message could not be sent. Please try again or contact us directly on WhatsApp."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen text-black">

      {/* ================= HERO ================= */}
      <section className="bg-gradient-to-b from-[#FDFBF7] to-white py-16 md:py-20 px-6 text-center border-b border-[#C5A059]/20">
        <p className="text-[10px] md:text-xs tracking-[0.35em] uppercase text-[#C5A059] font-semibold mb-3">
          Get In Touch
        </p>

        <h1 className="text-4xl md:text-5xl font-serif tracking-wide uppercase text-black mb-5">
          Contact Us
        </h1>

        <div className="flex items-center justify-center">
          <div className="w-12 md:w-16 h-[1px] bg-[#C5A059]" />
          <div className="w-[5px] h-[5px] bg-[#C5A059] rotate-45 mx-1" />
          <div className="w-12 md:w-16 h-[1px] bg-[#C5A059]" />
        </div>

        <p className="text-sm text-gray-500 mt-5 max-w-lg mx-auto leading-6">
          Have a question about an order, a product, or just want to say hello?
          We'd love to hear from you.
        </p>
      </section>

      {/* ================= MAIN CONTACT ================= */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">

        {/* ================= CONTACT FORM ================= */}
        <div>
          <div className="mb-7">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#C5A059] font-semibold mb-2">
              We'd Love To Hear From You
            </p>

            <h2 className="text-xl md:text-2xl font-serif uppercase tracking-wide text-black">
              Send Us A Message
            </h2>

            <div className="w-10 h-[1px] bg-[#C5A059] mt-4" />
          </div>

          {/* SUCCESS MESSAGE */}
          {submitted && (
            <div className="mb-6 px-4 py-4 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>

              <span>
                Thank you! Your message has been sent successfully.
              </span>
            </div>
          )}

          {/* ERROR MESSAGE */}
          {error && (
            <div className="mb-6 px-4 py-4 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
              </div>

              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* NAME */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500 mb-2">
                Your Name
              </label>

              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                disabled={loading}
                className="w-full px-4 py-3.5 bg-white rounded-lg border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/30 transition duration-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500 mb-2">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                disabled={loading}
                className="w-full px-4 py-3.5 bg-white rounded-lg border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/30 transition duration-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* MESSAGE */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500 mb-2">
                Message
              </label>

              <textarea
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={handleChange}
                placeholder="How can we help you?"
                disabled={loading}
                className="w-full px-4 py-3.5 bg-white rounded-lg border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/30 transition duration-300 resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 text-[10px] md:text-xs font-semibold uppercase tracking-[0.22em] border border-black rounded-lg hover:bg-[#C5A059] hover:border-[#C5A059] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        {/* ================= DIRECT CONTACT ================= */}
        <div>
          <div className="mb-7">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#C5A059] font-semibold mb-2">
              Connect With Opera
            </p>

            <h2 className="text-xl md:text-2xl font-serif uppercase tracking-wide text-black">
              Reach Us Directly
            </h2>

            <div className="w-10 h-[1px] bg-[#C5A059] mt-4" />
          </div>

          <div className="space-y-4">

            {/* WHATSAPP */}
            <a
              href="https://wa.me/923173355420"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-5 bg-[#FDFBF7] border border-[#C5A059]/30 rounded-xl hover:border-[#C5A059] hover:shadow-[0_8px_25px_rgba(197,160,89,0.10)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-[#25D366]/10 border border-[#25D366]/10 flex items-center justify-center text-[#25D366] shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.3 8.3 0 0 1-4.2-1.1L3 20l1.2-5.1a8.4 8.4 0 1 1 16.8-3.4Z" />
                  <path d="M8.5 9.5c.3-.5.5-.5.8-.5h.5c.2 0 .4.1.5.4l.6 1.4c.1.2.1.4-.1.6l-.5.6c.7 1.2 1.5 1.8 2.8 2.4l.6-.7c.2-.2.4-.2.6-.1l1.4.7c.3.1.4.3.3.6-.2.7-.8 1.2-1.5 1.3-1.1.2-2.6-.5-4-1.6-1.2-.9-2.1-2.1-2.5-3.2-.3-.8-.2-1.4.5-1.9Z" />
                </svg>
              </div>

              <div className="flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-black mb-1">
                  WhatsApp
                </p>

                <p className="text-xs text-gray-500">
                  +92 317 3355420
                </p>
              </div>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400 group-hover:text-[#C5A059] transition-colors"
              >
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </a>

            {/* EMAIL */}
            <a
              href="mailto:support@operaofficialpk.com"
              className="group flex items-center gap-4 p-5 bg-[#FDFBF7] border border-[#C5A059]/30 rounded-xl hover:border-[#C5A059] hover:shadow-[0_8px_25px_rgba(197,160,89,0.10)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/10 flex items-center justify-center text-[#C5A059] shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                  />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-black mb-1">
                  Email
                </p>

                <p className="text-xs text-gray-500 break-all">
                  support@operaofficialpk.com
                </p>
              </div>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400 group-hover:text-[#C5A059] transition-colors shrink-0"
              >
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </a>

            {/* BUSINESS HOURS */}
            <div className="group flex items-center gap-4 p-5 bg-[#FDFBF7] border border-[#C5A059]/30 rounded-xl hover:border-[#C5A059] hover:shadow-[0_8px_25px_rgba(197,160,89,0.10)] hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/10 flex items-center justify-center text-[#C5A059] shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="8.5" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-black mb-1">
                  Business Hours
                </p>

                <p className="text-xs text-gray-500">
                  Mon - Sat, 10:00 AM - 8:00 PM
                </p>
              </div>
            </div>

            {/* SHIPPING */}
            <div className="group flex items-center gap-4 p-5 bg-[#FDFBF7] border border-[#C5A059]/30 rounded-xl hover:border-[#C5A059] hover:shadow-[0_8px_25px_rgba(197,160,89,0.10)] hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/10 flex items-center justify-center text-[#C5A059] shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h11v10H3z" />
                  <path d="M14 9h4l3 3v4h-7z" />
                  <circle cx="7" cy="19" r="1.5" />
                  <circle cx="18" cy="19" r="1.5" />
                </svg>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-black mb-1">
                  Shipping
                </p>

                <p className="text-xs text-gray-500">
                  Cash on Delivery, All Across Pakistan
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= BOTTOM ACCENT ================= */}
      <section className="bg-[#FDFBF7] border-t border-[#C5A059]/20 py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#C5A059] font-semibold">
            Opera Jewellery & Perfumes
          </p>

          <div className="flex items-center justify-center mt-3">
            <div className="w-8 h-[1px] bg-[#C5A059]/50" />
            <div className="w-[4px] h-[4px] bg-[#C5A059] rotate-45 mx-1" />
            <div className="w-8 h-[1px] bg-[#C5A059]/50" />
          </div>
        </div>
      </section>

    </div>
  );
}

export default ContactUs;