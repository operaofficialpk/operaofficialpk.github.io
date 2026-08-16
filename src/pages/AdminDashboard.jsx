import React, { useEffect, useMemo, useState } from "react";
import ProductForm from "../components/ProductForm";
import ManageOrders from "../components/ManageOrders";
import ManageReviews from "../components/ManageReviews";
import ContactMessages from "../components/ContactMessages";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const [productsOpen, setProductsOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const [mediaSearch, setMediaSearch] = useState("");
  const [selectedMedia, setSelectedMedia] = useState(null);

  const [dashboardLoading, setDashboardLoading] = useState(false);

  /*
  ============================================================
  MENU ITEM
  ============================================================
  */

  const menuItem = (tab) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-[13px] font-medium transition-all duration-200 cursor-pointer ${
      activeTab === tab
        ? "bg-slate-900 text-white shadow-sm"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  /*
  ============================================================
  NAVIGATION
  ============================================================
  */

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setMobileSidebarOpen(false);
  };

  const handleProductMenu = () => {
    setProductsOpen((prev) => !prev);
    setPagesOpen(false);
  };

  const handlePagesMenu = () => {
    setPagesOpen((prev) => !prev);
    setProductsOpen(false);
  };

  /*
  ============================================================
  PAGE TITLES
  ============================================================
  */

  const pageTitle = {
    dashboard: "Dashboard",
    posts: "Posts",
    media: "Media",
    "all-pages": "All Pages",
    "add-page": "Add New Page",
    list: "Products",
    "add-product": "Add New Product",
    "add-category": "Categories",
    variants: "Product Variants",
    orders: "Manage Orders",
    reviews: "Manage Reviews",
    messages: "Messages",
    payments: "Payments",
    analytics: "Analytics",
    settings: "Settings",
  };

  /*
  ============================================================
  FETCH PRODUCTS
  ============================================================
  */

  const fetchProducts = async () => {
    try {
      const snapshot = await getDocs(collection(db, "products"));

      const productList = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setProducts(productList);

      return productList;
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  };

  /*
  ============================================================
  FETCH CATEGORIES
  ============================================================
  */

  const fetchCategories = async () => {
    try {
      const snapshot = await getDocs(collection(db, "categories"));

      const categoryList = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setCategories(categoryList);

      return categoryList;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  };

  /*
  ============================================================
  FETCH ORDERS
  ============================================================
  */

  const fetchOrders = async () => {
    try {
      const snapshot = await getDocs(collection(db, "orders"));

      const orderList = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setOrders(orderList);

      return orderList;
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
      return [];
    }
  };

  /*
  ============================================================
  FETCH REVIEWS
  ============================================================
  */

  const fetchReviews = async () => {
    try {
      const snapshot = await getDocs(collection(db, "reviews"));

      const reviewList = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setReviews(reviewList);

      return reviewList;
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
      return [];
    }
  };

  /*
  ============================================================
  FETCH ALL DASHBOARD DATA
  ============================================================
  */

  const fetchDashboardData = async () => {
    setDashboardLoading(true);

    try {
      await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchOrders(),
        fetchReviews(),
      ]);
    } catch (error) {
      console.error("Dashboard data loading error:", error);
    } finally {
      setDashboardLoading(false);
    }
  };

  /*
  ============================================================
  INITIAL LOAD
  ============================================================
  */

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /*
  ============================================================
  MEDIA LIBRARY
  ============================================================
  */

  const mediaItems = useMemo(() => {
    const items = [];

    /*
    ---------------- PRODUCTS ----------------
    */

    products.forEach((product) => {
      if (product?.image) {
        items.push({
          id: `product-main-${product.id}`,
          url: product.image,
          title: product.name || "Product Image",
          type: "Product",
          source: "Main Product Image",
          productId: product.id,
        });
      }

      if (Array.isArray(product?.variants)) {
        product.variants.forEach((variant, index) => {
          if (variant?.image) {
            items.push({
              id: `product-variant-${product.id}-${index}`,
              url: variant.image,
              title: product.name || "Product Variant",
              type: "Product",
              source: `Variant Image ${index + 1}`,
              productId: product.id,
            });
          }
        });
      }
    });

    /*
    ---------------- CATEGORIES ----------------
    */

    categories.forEach((category) => {
      if (category?.image) {
        items.push({
          id: `category-${category.id}`,
          url: category.image,
          title: category.name || "Category Image",
          type: "Category",
          source: "Category Collection Image",
          categoryId: category.id,
        });
      }
    });

    return items;
  }, [products, categories]);

  /*
  ============================================================
  MEDIA SEARCH
  ============================================================
  */

  const filteredMedia = useMemo(() => {
    const query = mediaSearch.trim().toLowerCase();

    if (!query) {
      return mediaItems;
    }

    return mediaItems.filter((item) => {
      return (
        item.title?.toLowerCase().includes(query) ||
        item.type?.toLowerCase().includes(query) ||
        item.source?.toLowerCase().includes(query)
      );
    });
  }, [mediaItems, mediaSearch]);

  /*
  ============================================================
  MEDIA REFRESH
  ============================================================
  */

  const handleMediaRefresh = async () => {
    setMediaLoading(true);
    setMediaError("");

    try {
      await Promise.all([fetchProducts(), fetchCategories()]);
    } catch (error) {
      console.error("Media refresh error:", error);
      setMediaError("Media refresh karte waqt masla aaya hai.");
    } finally {
      setMediaLoading(false);
    }
  };

  /*
  ============================================================
  COPY MEDIA URL
  ============================================================
  */

  const handleCopyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      alert("Image URL copied successfully!");
    } catch (error) {
      console.error("Copy URL error:", error);

      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      alert("Image URL copied!");
    }
  };

  /*
  ============================================================
  MEDIA PREVIEW
  ============================================================
  */

  const handleMediaPreview = (item) => {
    setSelectedMedia(item);
  };

  /*
  ============================================================
  CLOSE MEDIA PREVIEW
  ============================================================
  */

  const closeMediaPreview = () => {
    setSelectedMedia(null);
  };

  /*
  ============================================================
  PRODUCT COUNTS
  ============================================================
  */

  const featuredCount = products.filter(
    (product) => Boolean(product?.featured)
  ).length;

  /*
  ============================================================
  REVENUE
  ============================================================
  */

  const totalRevenue = useMemo(() => {
    return orders.reduce((total, order) => {
      const amount =
        Number(
          order?.totalAmount ??
            order?.total ??
            order?.amount ??
            order?.grandTotal ??
            0
        ) || 0;

      return total + amount;
    }, 0);
  }, [orders]);

  /*
  ============================================================
  FORMAT PRICE
  ============================================================
  */

  const formatPrice = (value) => {
    return Number(value || 0).toLocaleString("en-PK");
  };

  /*
  ============================================================
  GO TO ADD PRODUCT
  ============================================================
  */

  const goToAddProduct = () => {
    setProductsOpen(true);
    setPagesOpen(false);
    setActiveTab("add-product");
    setMobileSidebarOpen(false);
  };

  /*
  ============================================================
  GO TO PRODUCT LIST
  ============================================================
  */

  const goToProducts = () => {
    setProductsOpen(true);
    setPagesOpen(false);
    setActiveTab("list");
    setMobileSidebarOpen(false);
  };

  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex font-sans antialiased text-slate-800 relative">
      {/* ========================================================
          MOBILE BACKDROP
      ======================================================== */}

      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-[2px]"
        />
      )}

      {/* ========================================================
          SIDEBAR
      ======================================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col select-none transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* BRAND */}

        <div className="px-5 py-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-sm">
              OP
            </div>

            <div>
              <h1 className="text-sm font-black tracking-tight text-slate-900">
                OPERA OFFICIAL
              </h1>

              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                PK ADMIN PANEL
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-700 p-1"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* NAVIGATION */}

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {/* MAIN MENU */}

          <div className="px-3 pb-2 text-[10px] uppercase tracking-widest font-bold text-slate-400">
            Main Menu
          </div>

          {/* DASHBOARD */}

          <button
            type="button"
            onClick={() => handleNavClick("dashboard")}
            className={menuItem("dashboard")}
          >
            <span className="text-base">▦</span>
            <span>Dashboard</span>
          </button>

          {/* POSTS */}

          <button
            type="button"
            onClick={() => handleNavClick("posts")}
            className={menuItem("posts")}
          >
            <span className="text-base">◉</span>
            <span>Posts</span>
          </button>

          {/* MEDIA */}

          <button
            type="button"
            onClick={() => handleNavClick("media")}
            className={menuItem("media")}
          >
            <span className="text-base">▧</span>
            <span>Media</span>
          </button>

          {/* PAGES */}

          <div>
            <button
              type="button"
              onClick={handlePagesMenu}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[13px] font-medium transition-all duration-200 cursor-pointer ${
                pagesOpen ||
                activeTab === "all-pages" ||
                activeTab === "add-page"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="text-base">▤</span>
                <span>Pages</span>
              </span>

              <span className="text-[9px] text-slate-400">
                {pagesOpen ? "▲" : "▼"}
              </span>
            </button>

            {pagesOpen && (
              <div className="ml-7 mt-1 pl-3 border-l border-slate-200 space-y-1">
                <button
                  type="button"
                  onClick={() => handleNavClick("all-pages")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[12px] transition ${
                    activeTab === "all-pages"
                      ? "bg-slate-900 text-white font-semibold"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  All Pages
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick("add-page")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[12px] transition ${
                    activeTab === "add-page"
                      ? "bg-slate-900 text-white font-semibold"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  Add New Page
                </button>
              </div>
            )}
          </div>

          {/* PRODUCTS */}

          <div className="pt-1">
            <button
              type="button"
              onClick={handleProductMenu}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[13px] font-medium transition-all duration-200 cursor-pointer ${
                productsOpen ||
                activeTab === "list" ||
                activeTab === "add-product" ||
                activeTab === "add-category" ||
                activeTab === "variants"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="text-base">◇</span>
                <span>Products</span>
              </span>

              <span className="text-[9px] text-slate-400">
                {productsOpen ? "▲" : "▼"}
              </span>
            </button>

            {productsOpen && (
              <div className="ml-7 mt-1 pl-3 border-l border-slate-200 space-y-1">
                <button
                  type="button"
                  onClick={() => handleNavClick("list")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[12px] transition ${
                    activeTab === "list"
                      ? "bg-slate-900 text-white font-semibold"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  Manage Products
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick("add-product")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[12px] transition ${
                    activeTab === "add-product"
                      ? "bg-slate-900 text-white font-semibold"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  Add New Product
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick("add-category")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[12px] transition ${
                    activeTab === "add-category"
                      ? "bg-slate-900 text-white font-semibold"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  Add New Category
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick("variants")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[12px] transition ${
                    activeTab === "variants"
                      ? "bg-slate-900 text-white font-semibold"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  Product Variants
                </button>
              </div>
            )}
          </div>

          {/* DIVIDER */}

          <div className="my-4 border-t border-slate-100" />

          {/* MANAGEMENT */}

          <div className="px-3 pb-2 text-[10px] uppercase tracking-widest font-bold text-slate-400">
            Management
          </div>

          {/* ORDERS */}

          <button
            type="button"
            onClick={() => handleNavClick("orders")}
            className={menuItem("orders")}
          >
            <span className="text-base">▣</span>
            <span>Manage Orders</span>
          </button>

          {/* REVIEWS */}

          <button
            type="button"
            onClick={() => handleNavClick("reviews")}
            className={menuItem("reviews")}
          >
            <span className="text-base">★</span>
            <span>Manage Reviews</span>
          </button>

          {/* MESSAGES */}

          <button
            type="button"
            onClick={() => handleNavClick("messages")}
            className={menuItem("messages")}
          >
            <span className="text-base">✉</span>
            <span>Messages</span>
          </button>

          {/* PAYMENTS */}

          <button
            type="button"
            onClick={() => handleNavClick("payments")}
            className={menuItem("payments")}
          >
            <span className="text-base">₨</span>
            <span>Payments</span>
          </button>

          {/* ANALYTICS */}

          <button
            type="button"
            onClick={() => handleNavClick("analytics")}
            className={menuItem("analytics")}
          >
            <span className="text-base">⌁</span>
            <span>Analytics</span>
          </button>

          {/* SETTINGS */}

          <button
            type="button"
            onClick={() => handleNavClick("settings")}
            className={menuItem("settings")}
          >
            <span className="text-base">⚙</span>
            <span>Settings</span>
          </button>
        </nav>

        {/* SIDEBAR BOTTOM */}

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
              Admin
            </p>

            <p className="text-xs font-bold text-slate-800 mt-1">
              Opera Official PK
            </p>

            <p className="text-[10px] text-slate-400 mt-0.5">
              Store Management
            </p>
          </div>
        </div>
      </aside>

      {/* ========================================================
          MAIN CONTENT
      ======================================================== */}

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 lg:ml-64 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* TOP HEADER */}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              {/* MOBILE MENU */}

              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition"
                aria-label="Open sidebar"
              >
                <span className="text-base">☰</span>
              </button>

              <div>
                <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400">
                  Admin Panel
                </p>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {pageTitle[activeTab] || "Admin Management"}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {activeTab === "media" && (
                <button
                  type="button"
                  onClick={handleMediaRefresh}
                  disabled={mediaLoading}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
                >
                  {mediaLoading ? "Refreshing..." : "Refresh"}
                </button>
              )}

              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />

                <span className="text-[11px] font-semibold text-slate-500">
                  Store Online
                </span>
              </div>

              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black">
                OP
              </div>
            </div>
          </div>

          {/* CONTENT CARD */}

          <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_2px_10px_rgba(15,23,42,0.03)] min-h-[calc(100vh-150px)]">
            <div className="p-5 sm:p-7 lg:p-8">
              {/* ==================================================
                  DASHBOARD
              ================================================== */}

              {activeTab === "dashboard" && (
                <div className="space-y-7">
                  <div>
                    <h1 className="text-xl font-black text-slate-900">
                      Welcome back 👋
                    </h1>

                    <p className="text-xs text-slate-500 mt-1">
                      Here's what's happening with your Opera store.
                    </p>
                  </div>

                  {/* STATS */}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* PRODUCTS */}

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                        Products
                      </p>

                      <p className="text-2xl font-black text-slate-900 mt-2">
                        {dashboardLoading ? "..." : products.length}
                      </p>

                      <p className="text-[10px] text-slate-400 mt-1">
                        Total products
                      </p>
                    </div>

                    {/* ORDERS */}

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                        Orders
                      </p>

                      <p className="text-2xl font-black text-slate-900 mt-2">
                        {dashboardLoading ? "..." : orders.length}
                      </p>

                      <p className="text-[10px] text-slate-400 mt-1">
                        Total orders
                      </p>
                    </div>

                    {/* REVIEWS */}

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                        Reviews
                      </p>

                      <p className="text-2xl font-black text-slate-900 mt-2">
                        {dashboardLoading ? "..." : reviews.length}
                      </p>

                      <p className="text-[10px] text-slate-400 mt-1">
                        Customer reviews
                      </p>
                    </div>

                    {/* REVENUE */}

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                        Revenue
                      </p>

                      <p className="text-2xl font-black text-slate-900 mt-2">
                        {dashboardLoading
                          ? "..."
                          : `Rs. ${formatPrice(totalRevenue)}`}
                      </p>

                      <p className="text-[10px] text-slate-400 mt-1">
                        Total order revenue
                      </p>
                    </div>
                  </div>

                  {/* QUICK ACTIONS */}

                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                      <h3 className="text-sm font-black text-slate-900">
                        Quick Actions
                      </h3>

                      <p className="text-[11px] text-slate-400 mt-1">
                        Manage your store quickly.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-100">
                      {/* ADD PRODUCT */}

                      <button
                        type="button"
                        onClick={goToAddProduct}
                        className="bg-white p-5 text-left hover:bg-slate-50 transition cursor-pointer"
                      >
                        <span className="text-lg">＋</span>

                        <p className="text-xs font-bold text-slate-900 mt-3">
                          Add Product
                        </p>

                        <p className="text-[10px] text-slate-400 mt-1">
                          Create a new product
                        </p>
                      </button>

                      {/* ORDERS */}

                      <button
                        type="button"
                        onClick={() => handleNavClick("orders")}
                        className="bg-white p-5 text-left hover:bg-slate-50 transition cursor-pointer"
                      >
                        <span className="text-lg">▣</span>

                        <p className="text-xs font-bold text-slate-900 mt-3">
                          View Orders
                        </p>

                        <p className="text-[10px] text-slate-400 mt-1">
                          Manage customer orders
                        </p>
                      </button>

                      {/* PRODUCTS */}

                      <button
                        type="button"
                        onClick={goToProducts}
                        className="bg-white p-5 text-left hover:bg-slate-50 transition cursor-pointer"
                      >
                        <span className="text-lg">◇</span>

                        <p className="text-xs font-bold text-slate-900 mt-3">
                          Products List
                        </p>

                        <p className="text-[10px] text-slate-400 mt-1">
                          Manage your products
                        </p>
                      </button>

                      {/* REVIEWS */}

                      <button
                        type="button"
                        onClick={() => handleNavClick("reviews")}
                        className="bg-white p-5 text-left hover:bg-slate-50 transition cursor-pointer"
                      >
                        <span className="text-lg">★</span>

                        <p className="text-xs font-bold text-slate-900 mt-3">
                          Manage Reviews
                        </p>

                        <p className="text-[10px] text-slate-400 mt-1">
                          Approve customer reviews
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* STORE SUMMARY */}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-slate-200 rounded-2xl p-5">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                        Categories
                      </p>

                      <p className="text-xl font-black text-slate-900 mt-2">
                        {categories.length}
                      </p>

                      <p className="text-[10px] text-slate-400 mt-1">
                        Store categories
                      </p>
                    </div>

                    <div className="border border-slate-200 rounded-2xl p-5">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                        Featured Products
                      </p>

                      <p className="text-xl font-black text-slate-900 mt-2">
                        {featuredCount}
                      </p>

                      <p className="text-[10px] text-slate-400 mt-1">
                        Featured items
                      </p>
                    </div>

                    <div className="border border-slate-200 rounded-2xl p-5">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                        Media
                      </p>

                      <p className="text-xl font-black text-slate-900 mt-2">
                        {mediaItems.length}
                      </p>

                      <p className="text-[10px] text-slate-400 mt-1">
                        Product & category images
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================
                  MEDIA LIBRARY
              ================================================== */}

              {activeTab === "media" && (
                <div className="space-y-6">
                  {/* HEADER */}

                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">
                        Media Library
                      </h3>

                      <p className="text-xs text-slate-400 mt-1">
                        Product aur category images yahan automatically
                        display hoti hain.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-[11px] font-bold text-slate-600">
                          {filteredMedia.length} Images
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SEARCH */}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                        🔍
                      </span>

                      <input
                        type="text"
                        value={mediaSearch}
                        onChange={(e) => setMediaSearch(e.target.value)}
                        placeholder="Search product, category or image..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-slate-900 transition"
                      />
                    </div>

                    {mediaSearch && (
                      <button
                        type="button"
                        onClick={() => setMediaSearch("")}
                        className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* ERROR */}

                  {mediaError && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs font-semibold text-rose-600">
                      {mediaError}
                    </div>
                  )}

                  {/* LOADING */}

                  {mediaLoading && (
                    <div className="flex items-center justify-center py-16">
                      <div className="text-center">
                        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto" />

                        <p className="text-xs font-semibold text-slate-500 mt-4">
                          Loading media...
                        </p>
                      </div>
                    </div>
                  )}

                  {/* EMPTY */}

                  {!mediaLoading && filteredMedia.length === 0 && (
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl py-20 px-6 text-center">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">
                        ▧
                      </div>

                      <h3 className="text-sm font-black text-slate-900 mt-5">
                        No Media Found
                      </h3>

                      <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
                        {mediaSearch
                          ? "Aap ki search ke mutabiq koi image nahi mili."
                          : "Abhi products ya categories mein koi uploaded image available nahi hai."}
                      </p>
                    </div>
                  )}

                  {/* MEDIA GRID */}

                  {!mediaLoading && filteredMedia.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {filteredMedia.map((item) => (
                        <div
                          key={item.id}
                          className="group border border-slate-200 rounded-2xl overflow-hidden bg-white hover:shadow-lg transition"
                        >
                          {/* IMAGE */}

                          <button
                            type="button"
                            onClick={() => handleMediaPreview(item)}
                            className="block w-full aspect-square bg-slate-50 overflow-hidden cursor-pointer"
                          >
                            <img
                              src={item.url}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </button>

                          {/* INFO */}

                          <div className="p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h4 className="text-[11px] font-bold text-slate-900 truncate">
                                  {item.title}
                                </h4>

                                <p className="text-[9px] text-slate-400 mt-1 truncate">
                                  {item.source}
                                </p>
                              </div>

                              <span
                                className={`shrink-0 px-1.5 py-1 rounded-md text-[8px] font-bold ${
                                  item.type === "Product"
                                    ? "bg-slate-100 text-slate-600"
                                    : "bg-emerald-50 text-emerald-600"
                                }`}
                              >
                                {item.type}
                              </span>
                            </div>

                            {/* ACTIONS */}

                            <div className="grid grid-cols-2 gap-2 mt-3">
                              <button
                                type="button"
                                onClick={() => handleMediaPreview(item)}
                                className="px-2 py-2 bg-slate-100 text-slate-700 rounded-lg text-[9px] font-bold hover:bg-slate-900 hover:text-white transition"
                              >
                                Preview
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCopyUrl(item.url)}
                                className="px-2 py-2 bg-slate-100 text-slate-700 rounded-lg text-[9px] font-bold hover:bg-slate-900 hover:text-white transition"
                              >
                                Copy URL
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ==================================================
                  MEDIA PREVIEW MODAL
              ================================================== */}

              {selectedMedia && (
                <div
                  className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
                  onClick={closeMediaPreview}
                >
                  <div
                    className="w-full max-w-3xl bg-white rounded-2xl overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* MODAL HEADER */}

                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                      <div className="min-w-0">
                        <h3 className="text-sm font-black text-slate-900 truncate">
                          {selectedMedia.title}
                        </h3>

                        <p className="text-[10px] text-slate-400 mt-1">
                          {selectedMedia.type} • {selectedMedia.source}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={closeMediaPreview}
                        className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition"
                      >
                        ✕
                      </button>
                    </div>

                    {/* IMAGE */}

                    <div className="p-5 bg-slate-50 flex items-center justify-center">
                      <img
                        src={selectedMedia.url}
                        alt={selectedMedia.title}
                        className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-sm"
                      />
                    </div>

                    {/* FOOTER */}

                    <div className="p-5 border-t border-slate-100">
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                        <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400 mb-2">
                          Image URL
                        </p>

                        <p className="text-[10px] text-slate-600 break-all leading-5">
                          {selectedMedia.url}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 mt-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyUrl(selectedMedia.url)
                          }
                          className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
                        >
                          Copy Image URL
                        </button>

                        <a
                          href={selectedMedia.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold text-center hover:bg-slate-200 transition"
                        >
                          Open Original
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================
                  ORDERS
              ================================================== */}

              {activeTab === "orders" && <ManageOrders />}

              {/* ==================================================
                  REVIEWS
              ================================================== */}

              {activeTab === "reviews" && <ManageReviews />}

              {/* ==================================================
                  MESSAGES
              ================================================== */}

              {activeTab === "messages" && <ContactMessages />}

              {/* ==================================================
                  ADD PRODUCT
              ================================================== */}

              {activeTab === "add-product" && <ProductForm />}

              {/* ==================================================
                  PRODUCTS LIST
              ================================================== */}

              {activeTab === "list" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">
                        Products
                      </h3>

                      <p className="text-xs text-slate-400 mt-1">
                        Manage your store products and inventory SKUs.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={goToAddProduct}
                      className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                    >
                      + Add Product
                    </button>
                  </div>

                  {products.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
                      <div className="text-3xl">◇</div>

                      <p className="text-sm font-bold text-slate-700 mt-3">
                        No Products Found
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        Add your first product to the store.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className="border border-slate-200 rounded-2xl overflow-hidden"
                        >
                          <div className="p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 hover:bg-slate-50/70 transition">
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="w-16 h-16 shrink-0 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden">
                                {product.image ? (
                                  <img
                                    src={product.image}
                                    alt={product.name || "Product"}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-2xl">
                                    💍
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0">
                                <h4 className="text-sm font-bold text-slate-900">
                                  {product.name || "Untitled Product"}
                                </h4>

                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  {product.sku && (
                                    <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] font-semibold text-slate-600 border border-slate-200">
                                      SKU: {product.sku}
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  {product.originalPrice && (
                                    <span className="text-[11px] text-slate-400 line-through">
                                      Rs.{" "}
                                      {formatPrice(product.originalPrice)}
                                    </span>
                                  )}

                                  <span className="text-xs font-black text-slate-900">
                                    Rs. {formatPrice(product.price)}
                                  </span>

                                  {product.discountPercent && (
                                    <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[9px] font-bold">
                                      {product.discountPercent}% OFF
                                    </span>
                                  )}
                                </div>

                                <p className="text-[10px] text-slate-400 mt-1">
                                  {product.category || "No Category"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end lg:self-center">
                              {product.featured && (
                                <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-[9px] font-bold">
                                  Featured
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={goToAddProduct}
                                className="px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold hover:bg-slate-100 transition cursor-pointer"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  alert(
                                    "Product delete ka actual function ProductForm.jsx mein already available hai. Yahan se delete karne ke liye separate delete connection required hoga."
                                  )
                                }
                                className="px-3 py-2 bg-white border border-slate-200 text-slate-500 rounded-lg text-[10px] font-bold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ==================================================
                  CATEGORY
              ================================================== */}

              {activeTab === "add-category" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      Category Management
                    </h3>

                    <p className="text-xs text-slate-400 mt-1">
                      Categories ProductForm ke andar manage hoti hain.
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {categories.length} Categories Available
                        </p>

                        <p className="text-[10px] text-slate-400 mt-1">
                          Add, edit aur delete categories ProductForm mein
                          available hain.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={goToAddProduct}
                        className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
                      >
                        Open Category Manager
                      </button>
                    </div>
                  </div>

                  {categories.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className="border border-slate-200 rounded-2xl p-4 flex items-center gap-3"
                        >
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                              🏷️
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {category.name}
                            </p>

                            <p className="text-[9px] text-slate-400 mt-1">
                              Category
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ==================================================
                  VARIANTS
              ================================================== */}

              {activeTab === "variants" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      Product Variants
                    </h3>

                    <p className="text-xs text-slate-400 mt-1">
                      Product variants ProductForm ke andar manage hoti hain.
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-2xl p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-[10px] uppercase font-bold text-slate-400">
                          Products
                        </p>

                        <p className="text-xl font-black mt-2">
                          {products.length}
                        </p>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-[10px] uppercase font-bold text-slate-400">
                          Variant Images
                        </p>

                        <p className="text-xl font-black mt-2">
                          {products.reduce(
                            (total, product) =>
                              total +
                              (Array.isArray(product?.variants)
                                ? product.variants.length
                                : 0),
                            0
                          )}
                        </p>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-[10px] uppercase font-bold text-slate-400">
                          Media
                        </p>

                        <p className="text-xl font-black mt-2">
                          {mediaItems.length}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={goToAddProduct}
                      className="mt-5 px-5 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
                    >
                      Manage Product Variants
                    </button>
                  </div>
                </div>
              )}

              {/* ==================================================
                  POSTS
              ================================================== */}

              {activeTab === "posts" && (
                <div className="flex items-center justify-center min-h-[55vh]">
                  <div className="text-center">
                    <div className="text-3xl">◉</div>

                    <h3 className="text-sm font-black text-slate-900 mt-4">
                      Posts
                    </h3>

                    <p className="text-xs text-slate-400 mt-1">
                      Posts management section.
                    </p>
                  </div>
                </div>
              )}

              {/* ==================================================
                  ALL PAGES
              ================================================== */}

              {activeTab === "all-pages" && (
                <div className="flex items-center justify-center min-h-[55vh]">
                  <div className="text-center">
                    <div className="text-3xl">▤</div>

                    <h3 className="text-sm font-black text-slate-900 mt-4">
                      All Pages
                    </h3>

                    <p className="text-xs text-slate-400 mt-1">
                      Pages management section.
                    </p>
                  </div>
                </div>
              )}

              {/* ==================================================
                  ADD PAGE
              ================================================== */}

              {activeTab === "add-page" && (
                <div className="flex items-center justify-center min-h-[55vh]">
                  <div className="text-center">
                    <div className="text-3xl">＋</div>

                    <h3 className="text-sm font-black text-slate-900 mt-4">
                      Add New Page
                    </h3>

                    <p className="text-xs text-slate-400 mt-1">
                      Create a new page.
                    </p>
                  </div>
                </div>
              )}

              {/* ==================================================
                  PAYMENTS
              ================================================== */}

              {activeTab === "payments" && (
                <div className="flex items-center justify-center min-h-[55vh]">
                  <div className="text-center">
                    <div className="text-3xl">₨</div>

                    <h3 className="text-sm font-black text-slate-900 mt-4">
                      Payments
                    </h3>

                    <p className="text-xs text-slate-400 mt-1">
                      Payment management section.
                    </p>
                  </div>
                </div>
              )}

              {/* ==================================================
                  ANALYTICS
              ================================================== */}

              {activeTab === "analytics" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      Analytics
                    </h3>

                    <p className="text-xs text-slate-400 mt-1">
                      Current store overview.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="border border-slate-200 rounded-2xl p-5">
                      <p className="text-[10px] uppercase font-bold text-slate-400">
                        Products
                      </p>

                      <p className="text-2xl font-black mt-2">
                        {products.length}
                      </p>
                    </div>

                    <div className="border border-slate-200 rounded-2xl p-5">
                      <p className="text-[10px] uppercase font-bold text-slate-400">
                        Categories
                      </p>

                      <p className="text-2xl font-black mt-2">
                        {categories.length}
                      </p>
                    </div>

                    <div className="border border-slate-200 rounded-2xl p-5">
                      <p className="text-[10px] uppercase font-bold text-slate-400">
                        Orders
                      </p>

                      <p className="text-2xl font-black mt-2">
                        {orders.length}
                      </p>
                    </div>

                    <div className="border border-slate-200 rounded-2xl p-5">
                      <p className="text-[10px] uppercase font-bold text-slate-400">
                        Revenue
                      </p>

                      <p className="text-2xl font-black mt-2">
                        Rs. {formatPrice(totalRevenue)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================
                  SETTINGS
              ================================================== */}

              {activeTab === "settings" && (
                <div className="flex items-center justify-center min-h-[55vh]">
                  <div className="text-center">
                    <div className="text-3xl">⚙</div>

                    <h3 className="text-sm font-black text-slate-900 mt-4">
                      Settings
                    </h3>

                    <p className="text-xs text-slate-400 mt-1">
                      Admin settings section.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;