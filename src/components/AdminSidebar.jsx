import React, { useState } from "react";

function AdminSidebar({ activeTab, setActiveTab }) {
  const [pagesOpen, setPagesOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  return (
    <aside className="w-64 bg-[#1d2327] text-[#c3c4c7] min-h-screen p-3 flex flex-col font-sans select-none text-xs">
      
      {/* Brand / Title */}
      <div className="px-3 py-4 mb-2 text-white font-bold text-sm tracking-wide border-b border-slate-700/50">
        OPERA OFFICIAL PK
      </div>

      <nav className="flex-1 space-y-1">
        
        {/* Dashboard */}
        <button 
          onClick={() => setActiveTab("dashboard")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition ${activeTab === "dashboard" ? "bg-[#2271b1] text-white font-semibold" : "hover:bg-[#2c3338] hover:text-white"}`}
        >
          <span>📊</span> Dashboard
        </button>

        {/* Posts */}
        <button 
          onClick={() => setActiveTab("posts")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition ${activeTab === "posts" ? "bg-[#2271b1] text-white font-semibold" : "hover:bg-[#2c3338] hover:text-white"}`}
        >
          <span>📌</span> Posts
        </button>

        {/* Media */}
        <button 
          onClick={() => setActiveTab("media")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition ${activeTab === "media" ? "bg-[#2271b1] text-white font-semibold" : "hover:bg-[#2c3338] hover:text-white"}`}
        >
          <span>🖼️</span> Media
        </button>

        {/* Pages with Submenu */}
        <div>
          <button 
            onClick={() => setPagesOpen(!pagesOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded hover:bg-[#2c3338] hover:text-white transition"
          >
            <span className="flex items-center gap-3">📑 Pages</span>
            <span>{pagesOpen ? "▲" : "▼"}</span>
          </button>
          {pagesOpen && (
            <div className="pl-8 space-y-1 mt-1 border-l border-slate-700 ml-3">
              <button onClick={() => setActiveTab("all-pages")} className="w-full text-left py-1.5 hover:text-white transition">All Pages</button>
              <button onClick={() => setActiveTab("add-page")} className="w-full text-left py-1.5 hover:text-white transition">Add New Page</button>
            </div>
          )}
        </div>

        {/* WooCommerce / Products with Submenu */}
        <div>
          <button 
            onClick={() => setProductsOpen(!productsOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded hover:bg-[#2c3338] hover:text-white transition"
          >
            <span className="flex items-center gap-3">🛍️ Products</span>
            <span>{productsOpen ? "▲" : "▼"}</span>
          </button>
          {productsOpen && (
            <div className="pl-8 space-y-1 mt-1 border-l border-slate-700 ml-3">
              <button onClick={() => setActiveTab("list")} className="w-full text-left py-1.5 hover:text-white transition">Manage Products List</button>
              <button onClick={() => setActiveTab("add-product")} className="w-full text-left py-1.5 hover:text-white transition">Add New Product</button>
              <button onClick={() => setActiveTab("add-category")} className="w-full text-left py-1.5 hover:text-white transition">Add New Category</button>
              <button onClick={() => setActiveTab("variants")} className="w-full text-left py-1.5 hover:text-white transition">Product Variants</button>
            </div>
          )}
        </div>

        {/* Payments / Analytics / Marketing */}
        <button onClick={() => setActiveTab("payments")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded hover:bg-[#2c3338] hover:text-white transition">
          <span>💵</span> Payments
        </button>
        <button onClick={() => setActiveTab("analytics")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded hover:bg-[#2c3338] hover:text-white transition">
          <span>📈</span> Analytics
        </button>
        <button onClick={() => setActiveTab("marketing")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded hover:bg-[#2c3338] hover:text-white transition">
          <span>📢</span> Marketing
        </button>

        {/* Appearance & Plugins */}
        <button onClick={() => setActiveTab("appearance")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded hover:bg-[#2c3338] hover:text-white transition">
          <span>🎨</span> Appearance
        </button>
        <button onClick={() => setActiveTab("plugins")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded hover:bg-[#2c3338] hover:text-white transition">
          <span>🔌</span> Plugins
        </button>

        {/* Users & Settings */}
        <button onClick={() => setActiveTab("users")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded hover:bg-[#2c3338] hover:text-white transition">
          <span>👤</span> Users
        </button>
        <button onClick={() => setActiveTab("tools")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded hover:bg-[#2c3338] hover:text-white transition">
          <span>🛠️</span> Tools
        </button>
        <button onClick={() => setActiveTab("settings")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded hover:bg-[#2c3338] hover:text-white transition">
          <span>⚙️</span> Settings
        </button>

      </nav>

      {/* Collapse Footer */}
      <div className="pt-4 border-t border-slate-700/50 mt-auto">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-[#2c3338] hover:text-white transition text-slate-400">
          <span>◀</span> Collapse menu
        </button>
      </div>

    </aside>
  );
}

export default AdminSidebar;