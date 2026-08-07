import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import logo from "../assets/logo.jpg";

function Navbar() {
  const { totalItems } = useContext(CartContext);
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm px-6 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" onClick={() => setOpen(false)} className="flex items-center">
          <img 
            src={logo} 
            alt="OPERA OFFICIAL PK" 
            className="h-12 md:h-16 w-auto object-contain" 
          />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-widest uppercase text-gray-800">
          <Link to="/" className="hover:text-black transition">
            Home
          </Link>
          <Link to="/shop" className="hover:text-black transition">
            Jewellery
          </Link>
          <Link to="/about" className="hover:text-black transition">
            About Us
          </Link>
          <a href="https://wa.me/923173355420" target="_blank" rel="noreferrer" className="hover:text-black transition">
            Contact
          </a>
        </div>

        {/* Right Section Icons */}
        <div className="flex items-center gap-5">
          {/* Search Icon */}
          <Link to="/shop" className="text-gray-700 hover:text-black text-lg transition" title="Search">
            🔍
          </Link>

          {/* Cart Icon with Badge */}
          <Link to="/cart" className="relative text-xl p-1 text-gray-800 hover:text-black transition">
            🛒
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            aria-label="Toggle Navigation"
            className="md:hidden text-2xl cursor-pointer focus:outline-none"
            onClick={() => setOpen(!open)}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden mt-3 pt-3 border-t flex flex-col gap-3 text-center text-xs font-semibold tracking-widest uppercase bg-white">
          <Link to="/" onClick={() => setOpen(false)} className="py-2 hover:bg-gray-50 rounded-lg">
            Home
          </Link>
          <Link to="/shop" onClick={() => setOpen(false)} className="py-2 hover:bg-gray-50 rounded-lg">
            Jewellery
          </Link>
          <Link to="/about" onClick={() => setOpen(false)} className="py-2 hover:bg-gray-50 rounded-lg">
            About Us
          </Link>
          <Link to="/cart" onClick={() => setOpen(false)} className="py-2 hover:bg-gray-50 rounded-lg">
            Cart ({totalItems})
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;