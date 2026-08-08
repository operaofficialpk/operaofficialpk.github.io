import { Link } from "react-router-dom";
// Assets folder se logo import karein
import logo from "../assets/logo.jpg";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white py-16 px-6 border-t border-gray-900">
      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-10 items-start">
        {/* Brand & Logo */}
        <div>
          <Link to="/" className="inline-block">
            <img
              src={logo}
              alt="OPERA OFFICIAL PK"
              className="h-16 md:h-20 w-auto object-contain bg-white p-2 rounded-lg"
            />
          </Link>
          <p className="text-gray-400 mt-5 leading-7 text-sm max-w-sm">
            Luxury jewellery designed for your special moments. Handcrafted elegance and timeless quality.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-bold mb-5 tracking-wide">
            Quick Links
          </h3>

          <div className="flex flex-col gap-3 text-gray-400 text-sm">
            <Link to="/" className="hover:text-white transition">
              Home
            </Link>
            <Link to="/shop" className="hover:text-white transition">
              Collections
            </Link>
            <Link to="/cart" className="hover:text-white transition">
              Cart
            </Link>
            <a
              href="https://wa.me/923173355420"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
            >
              Contact Us
            </a>
          </div>
        </div>

        {/* Social Media Links */}
        <div>
          <h3 className="text-xl font-bold mb-5 tracking-wide">
            Follow Us
          </h3>

          <div className="flex flex-col gap-3 text-gray-400 text-sm">
            <a
              href="https://www.instagram.com/operaofficialpk"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition flex items-center gap-2"
            >
              📷 Instagram (@operaofficialpk)
            </a>
            <a
              href="https://www.tiktok.com/@operaofficialpk"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition flex items-center gap-2"
            >
              🎵 TikTok (@operaofficialpk)
            </a>
            <a
              href="https://www.facebook.com/operaofficialpk"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition flex items-center gap-2"
            >
              👥 Facebook (operaofficialpk)
            </a>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-xl font-bold mb-5 tracking-wide">
            Get in Touch
          </h3>

          <p className="text-gray-400 text-sm">
            WhatsApp:{" "}
            <a
              href="https://wa.me/923173355420"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:underline font-medium"
            >
              0317 3355420
            </a>
          </p>

          <p className="text-gray-400 text-sm mt-3">
            Worldwide & Cash on Delivery Across Pakistan
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between text-gray-500 text-xs max-w-6xl mx-auto gap-4">
        <p>© {currentYear} OperaOfficialPK. All Rights Reserved.</p>
        <Link to="/admin" className="hover:text-gray-300 transition">
          Admin Portal
        </Link>
      </div>
    </footer>
  );
}

export default Footer;