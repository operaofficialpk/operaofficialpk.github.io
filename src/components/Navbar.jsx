import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { useStore } from "../context/StoreContext";
import logoImage from "../assets/logo.png";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { cart, openCart } = useContext(CartContext);
  const { wishlist } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const totalItems = cart.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );

  const wishlistCount = Array.isArray(wishlist)
    ? wishlist.length
    : 0;

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchParam = queryParams.get("search");

    if (searchParam) {
      setSearchQuery(searchParam);
    } else if (location.pathname !== "/shop") {
      setSearchQuery("");
    }
  }, [location]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setShowSearchDropdown(false);
  }, [location.pathname]);

  const handleSearchChange = (e) => {
    const value = e.target.value;

    setSearchQuery(value);

    if (value.trim() === "") {
      navigate("/", { replace: true });
    } else {
      navigate(
        `/shop?search=${encodeURIComponent(value.trim())}`,
        { replace: true }
      );
    }
  };

  const getNavPath = (item) => {
    if (item === "Home") return "/";
    if (item === "Jewellery") return "/shop";
    if (item === "Shop") return "/shop";
    if (item === "About Us") return "/aboutus";
    if (item === "Contact Us") return "/contactus";

    return `/${item.toLowerCase().replace(/\s+/g, "")}`;
  };

  const isActive = (item) => {
    if (item === "Home") {
      return location.pathname === "/";
    }

    if (
      item === "Jewellery" ||
      item === "Shop"
    ) {
      return location.pathname === "/shop";
    }

    return location.pathname === getNavPath(item);
  };

  const navItems = [
    "Home",
    "Jewellery",
    "Shop",
    "About Us",
    "Contact Us",
  ];

  return (
    <>
      {/* =====================================================
          NORMAL NAVBAR (SCROLLABLE WITH PAGE)
          ===================================================== */}
      <header className="relative w-full bg-white border-b border-gray-100 shadow-sm z-50">
        {/* GOLD TOP LINE */}
        <div className="w-full h-1 md:h-1.5 bg-gradient-to-r from-[#C5A059] via-[#E6CA65] to-[#C5A059]" />

        {/* MAIN NAVBAR */}
        <div className="w-full bg-white">
          <div className="max-w-7xl mx-auto px-3 sm:px-6">
            <div className="h-[68px] md:h-[100px] flex items-center justify-between">

              {/* MOBILE MENU BUTTON */}
              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(!mobileMenuOpen)
                }
                className="md:hidden w-9 h-9 flex items-center justify-center text-gray-800 hover:text-[#C5A059] transition"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>

              {/* LEFT SIDE - LOGIN */}
              <div className="hidden md:flex flex-1 items-center">
                {user ? (
                  <button
                    type="button"
                    onClick={logout}
                    className="text-xs font-bold tracking-[0.15em] uppercase text-gray-800 hover:text-[#C5A059] transition"
                  >
                    Logout
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-bold tracking-[0.1em] uppercase text-gray-800">
                    <Link
                      to="/login"
                      className="hover:text-[#C5A059] transition"
                    >
                      Login
                    </Link>

                    <span className="text-gray-300">
                      /
                    </span>

                    <Link
                      to="/register"
                      className="hover:text-[#C5A059] transition"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>

              {/* CENTER LOGO */}
              <Link
                to="/"
                className="flex items-center justify-center md:flex-1"
                aria-label="Opera Home"
              >
                <img
                  src={logoImage}
                  alt="Opera Jewellery & Perfumes"
                  className="h-[48px] sm:h-[58px] md:h-[82px] w-auto object-contain"
                />
              </Link>

              {/* RIGHT SIDE ICONS */}
              <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-3">

                {/* SEARCH */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setShowSearchDropdown(
                        !showSearchDropdown
                      )
                    }
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-50 border border-gray-200 text-gray-800 hover:border-[#C5A059] hover:text-[#C5A059] transition flex items-center justify-center cursor-pointer"
                    aria-label="Search"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 md:w-5 md:h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>

                  {showSearchDropdown && (
                    <div className="absolute right-0 top-[44px] md:top-[48px] w-[calc(100vw-24px)] sm:w-80 max-w-[340px] bg-white border border-[#C5A059]/30 rounded-xl shadow-xl p-3 z-50">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center border-b border-gray-100 pb-2 mb-2">
                        Search Collections
                      </div>

                      <div className="relative w-full flex items-center bg-gray-50 border border-[#C5A059]/40 rounded-lg px-3 py-2.5 focus-within:border-[#C5A059] transition">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 text-gray-400 mr-2 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>

                        <input
                          type="text"
                          placeholder="Search jewellery & perfumes..."
                          value={searchQuery}
                          onChange={handleSearchChange}
                          className="w-full text-xs bg-transparent outline-none text-gray-800 placeholder-gray-400 tracking-wide"
                          autoFocus
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* WISHLIST */}
                <Link
                  to="/wishlist"
                  className="relative w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-50 border border-gray-200 text-gray-800 hover:border-[#C5A059] hover:text-[#C5A059] transition flex items-center justify-center"
                  title="Wishlist"
                  aria-label="Wishlist"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 md:w-5 md:h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364l-1.318 1.318-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>

                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#C5A059] text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* CART */}
                <button
                  type="button"
                  onClick={openCart}
                  className="relative w-9 h-9 md:w-auto md:h-10 md:px-4 rounded-full bg-black text-white hover:bg-[#C5A059] transition flex items-center justify-center gap-2 cursor-pointer"
                  aria-label="Shopping Cart"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 md:w-5 md:h-5 pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H19m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>

                  <span className="absolute -top-1 -right-1 md:static bg-[#C5A059] text-white text-[8px] md:text-[10px] font-bold w-4 h-4 md:w-auto md:h-auto md:px-1.5 md:py-0.5 rounded-full flex items-center justify-center pointer-events-none">
                    {totalItems}
                  </span>

                  <span className="hidden md:inline text-xs font-bold tracking-wider uppercase pointer-events-none">
                    Cart
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE DROPDOWN */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-4">

              <div className="pb-3 mb-3 border-b border-gray-100">
                {user ? (
                  <button
                    type="button"
                    onClick={logout}
                    className="text-xs font-bold tracking-[0.15em] uppercase text-gray-800 hover:text-[#C5A059]"
                  >
                    Logout
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-bold tracking-[0.1em] uppercase">
                    <Link
                      to="/login"
                      className="hover:text-[#C5A059]"
                    >
                      Login
                    </Link>

                    <span className="text-gray-300">
                      /
                    </span>

                    <Link
                      to="/register"
                      className="hover:text-[#C5A059]"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item}
                    to={getNavPath(item)}
                    className={`px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                      isActive(item)
                        ? "bg-[#F8F3E8] text-[#A8873F] border-l-2 border-[#C5A059]"
                        : "text-gray-800 hover:bg-gray-50 hover:text-[#C5A059]"
                    }`}
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DESKTOP / MOBILE NAVIGATION PILL BAR */}
        <div className="bg-gradient-to-r from-[#FDFBF7] via-[#F4ECD8] to-[#FDFBF7] border-t border-b border-[#C5A059]/25">
          <div className="max-w-7xl mx-auto px-3 sm:px-6">
            <div className="flex items-center justify-start md:justify-center gap-2 md:gap-3.5 overflow-x-auto no-scrollbar py-2.5 md:py-3">
              {navItems.map((item) => (
                <Link
                  key={item}
                  to={getNavPath(item)}
                  className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider whitespace-nowrap shrink-0 transition-all duration-200 border cursor-pointer hover:scale-[1.02] ${
                    isActive(item)
                      ? "bg-[#C5A059] text-white border-[#C5A059] shadow-md"
                      : "bg-white text-gray-800 border-[#C5A059]/30 hover:border-[#C5A059] hover:text-[#A8873F] hover:bg-[#FAF6EE]"
                  }`}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export default Navbar;