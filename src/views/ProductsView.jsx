import React, { useState } from "react";
import { useStore } from "../context/StoreContext";
import { calculateDiscount, validatePrices } from "../utils/pricing.js";
import { Modal } from "../components/common/Modal";
import { PriceDisplay } from "../components/common/PriceDisplay.jsx";
import { DiscountBadge } from "../components/common/DiscountBadge";
import { Plus, Search, Trash2, Edit3, AlertCircle, Upload, Loader2, X, Sparkles, Layers, Package, FileText, Lock, LogOut } from "lucide-react";
import imageCompression from "browser-image-compression";

export const ProductsView = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  
  // No 1: Admin Authentication State (Username & Password Protection)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("admin_auth") === "true";
  });
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadingVariant, setUploadingVariant] = useState(false);

  const [categories, setCategories] = useState(["Bridal Set", "Necklaces", "Rings", "Earrings", "Bracelets"]);
  const [newCategoryName, setNewCategoryName] = useState("");

  const initialFormState = () => ({
    name: "",
    description: "",
    sku: `JW-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
    category: categories[0] || "Bridal Set",
    originalPrice: "",
    discountPrice: "",
    stock: "",
    image: "",
    variants: [],
  });

  const initialVariantDraft = () => ({
    colorName: "Finish",
    colorHex: "#D4AF37",
    image: "",
  });

  const [formData, setFormData] = useState(initialFormState());
  const [variantDraft, setVariantDraft] = useState(initialVariantDraft());
  const [validationError, setValidationError] = useState("");

  const liveDiscount = calculateDiscount(formData.originalPrice, formData.discountPrice);

  // Handle Admin Login
  const handleLogin = (e) => {
    e.preventDefault();
    // Aap yahan apna pasandeeda username aur password set kar sakte hain
    if (loginData.username === "admin" && loginData.password === "admin123") {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_auth", "true");
      setLoginError("");
    } else {
      setLoginError("Ghalat Username ya Password!");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_auth");
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setValidationError("");

    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      const base64Url = await convertFileToBase64(compressedFile);
      setFormData((prev) => ({ ...prev, image: base64Url }));
    } catch (err) {
      console.error("Image upload error:", err);
      setValidationError("Image upload karne mein error aaya.");
    } finally {
      setUploading(false);
    }
  };

  const handleVariantImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVariant(true);
    setValidationError("");

    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      const base64Url = await convertFileToBase64(compressedFile);
      setVariantDraft((prev) => ({ ...prev, image: base64Url }));
    } catch (err) {
      console.error("Variant image upload error:", err);
      setValidationError("Variant image upload karne mein error aaya.");
    } finally {
      setUploadingVariant(false);
    }
  };

  const handleAddVariant = () => {
    if (!variantDraft.image) {
      setValidationError("Variant add karne ke liye image upload karna lazmi hai.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { ...variantDraft }],
    }));

    setVariantDraft(initialVariantDraft());
    setValidationError("");
  };

  const handleRemoveVariant = (index) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleAddCategory = () => {
    const trimmedName = newCategoryName.trim();
    if (trimmedName && !categories.includes(trimmedName)) {
      setCategories([...categories, trimmedName]);
      setNewCategoryName("");
    }
  };

  const handleDeleteCategory = (catToDelete) => {
    if (categories.length <= 1) {
      alert("Kam az kam ek category hona lazmi hai!");
      return;
    }
    const updatedCategories = categories.filter((c) => c !== catToDelete);
    setCategories(updatedCategories);
    if (formData.category === catToDelete) {
      setFormData((prev) => ({ ...prev, category: updatedCategories[0] }));
    }
  };

  const handlePriceChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    const check = validatePrices(
      field === "originalPrice" ? value : formData.originalPrice,
      field === "discountPrice" ? value : formData.discountPrice
    );

    if (!check.isValid && (formData.originalPrice || formData.discountPrice)) {
      setValidationError(check.error);
    } else {
      setValidationError("");
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      sku: `JW-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      category: categories[0] || "Bridal Set",
      originalPrice: "",
      discountPrice: "",
      stock: "",
      image: "",
      variants: [],
    });
    setVariantDraft(initialVariantDraft());
    setValidationError("");
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      sku: product.sku || "",
      category: product.category || categories[0],
      originalPrice: product.originalPrice ?? "",
      discountPrice: product.discountPrice ?? "",
      stock: product.stock ?? "",
      image: product.image || "",
      variants: product.variants || [],
    });
    setVariantDraft(initialVariantDraft());
    setValidationError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const check = validatePrices(formData.originalPrice, formData.discountPrice);
    if (!check.isValid) {
      setValidationError(check.error);
      return;
    }

    if (!formData.image) {
      setValidationError("Jewellery piece ki image upload karna lazmi hai.");
      return;
    }

    try {
      const payload = {
        ...formData,
        originalPrice: Number(formData.originalPrice),
        discountPrice: Number(formData.discountPrice) || 0,
        stock: Number(formData.stock) || 0,
        image: formData.image,
        variants: formData.variants,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await addProduct(payload);
      }

      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData(initialFormState());
      setVariantDraft(initialVariantDraft());
      setValidationError("");
    } catch (err) {
      console.error("Error saving product:", err);
      setValidationError("Product save karte hue error aaya.");
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Kya aap waqai is jewellery item ko delete karna chahte hain?")) {
      deleteProduct(id);
    }
  };

  const filteredProducts = (products || []).filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // NO 1: Agar Admin authenticated nahi hai toh Login Screen dikhayein
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 mb-1">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Admin Login</h1>
            <p className="text-xs text-slate-500">Enter credentials to manage jewellery inventory</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Username</label>
              <input
                type="text"
                required
                placeholder="admin"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                className="w-full mt-1.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="w-full mt-1.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 py-3 rounded-2xl font-bold text-sm hover:opacity-95 transition shadow-lg shadow-slate-900/10"
            >
              Login to Panel
            </button>
          </form>
          <div className="text-center">
            <p className="text-[11px] text-slate-400">Default Credentials — Username: <span className="font-mono font-semibold">admin</span> | Password: <span className="font-mono font-semibold">admin123</span></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto bg-slate-50/50 dark:bg-slate-950 min-h-screen">
      
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-xs uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Luxury Collection Management
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">Jewellery Inventory</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your fine jewelry pieces, precious metals, and pricing</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 px-6 py-3 rounded-2xl font-medium text-sm hover:opacity-95 shadow-lg shadow-slate-900/10 transition-all"
          >
            <Plus className="w-4 h-4" /> Add New Piece
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl font-medium text-sm hover:bg-red-100 transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Categories & Search Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Manager Box */}
        <div className="lg:col-span-1 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Collections
            </label>
            <span className="text-xs bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium">
              {categories.length} Categories
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New Collection Name..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-semibold hover:opacity-90 transition"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 max-h-40 overflow-y-auto">
            {categories.map((cat) => (
              <div
                key={cat}
                className="group flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60"
              >
                <span>{cat}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat)}
                  className="text-slate-400 hover:text-red-500 transition"
                  title="Delete category"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Search Bar & Quick Stats */}
        <div className="lg:col-span-2 flex flex-col justify-between p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Package className="w-3.5 h-3.5" /> Catalog Search
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by jewellery name, SKU, or collection..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Items</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{products?.length || 0}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Active Filters</p>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">{filteredProducts.length}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Products Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                <th className="p-4 pl-6">Piece</th>
                <th className="p-4">Name</th>
                <th className="p-4">Collection</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Price</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Finishes</th>
                <th className="p-4">Stock</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-400">
                    <p className="font-medium">Koi jewellery piece nahi mila.</p>
                    <p className="text-xs text-slate-400 mt-1">Naya product add karne ke upar button dabayein.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id || p.sku} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="p-4 pl-6">
                      <img
                        src={p.image || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400"}
                        alt={p.name}
                        className="w-12 h-12 object-cover rounded-xl border border-slate-200/80 shadow-sm"
                      />
                    </td>
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">{p.name}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/40 dark:border-amber-800/40">
                        {p.category || "Bridal Set"}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-xs">{p.sku}</td>
                    <td className="p-4">
                      <PriceDisplay originalPrice={p.originalPrice} discountPrice={p.discountPrice} size="sm" />
                    </td>
                    <td className="p-4">
                      <DiscountBadge originalPrice={p.originalPrice} discountPrice={p.discountPrice} />
                    </td>
                    <td className="p-4">
                      {Array.isArray(p.variants) && p.variants.length > 0 ? (
                        <div className="flex -space-x-1.5">
                          {p.variants.slice(0, 4).map((v, i) => (
                            <img
                              key={i}
                              src={v.image}
                              alt="Variant"
                              className="w-6 h-6 rounded-full object-cover border-2 border-white dark:border-slate-900 shadow-sm"
                            />
                          ))}
                          {p.variants.length > 4 && (
                            <span className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 text-[9px] flex items-center justify-center font-bold text-slate-600">
                              +{p.variants.length - 4}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="p-4 font-medium text-slate-700 dark:text-slate-300">{p.stock}</td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="text-slate-400 hover:text-amber-600 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl transition"
                          title="Edit product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-slate-400 hover:text-red-500 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl transition"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingProduct(null); }} 
        title={editingProduct ? "Edit Jewellery Piece" : "Add New Jewellery Piece"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {validationError && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Piece Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Royal Kundan Bridal Set"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full mt-1.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Description
            </label>
            <textarea
              rows={3}
              placeholder="Enter details about materials, polish, gemstones, or design..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full mt-1.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Collection *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full mt-1.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white cursor-pointer"
              >
                {categories.map((cat, index) => (
                  <option key={index} value={cat} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-1">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">SKU Code *</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full mt-1.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Main Product Image *</label>
            <div className="mt-1.5 flex items-center gap-4">
              <label className="flex-1 flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-amber-50/30 dark:hover:bg-slate-800/50 transition">
                {uploading ? (
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing image...
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-slate-500">
                    <Upload className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-medium">Click to upload jewelry photo</span>
                    <span className="text-[10px] text-slate-400">PNG, JPG or WEBP</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {formData.image && (
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 shrink-0 shadow-sm">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-amber-50/30 dark:bg-slate-800/40 rounded-2xl border border-amber-100/60 dark:border-slate-700 space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Variant Images (Optional)</label>

            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-50 transition">
                {uploadingVariant ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-amber-600" />}
                <span>{uploadingVariant ? "Processing..." : "Upload Variant Image"}</span>
                <input type="file" accept="image/*" onChange={handleVariantImageUpload} className="hidden" />
              </label>

              {variantDraft.image && (
                <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                  <img src={variantDraft.image} alt="Variant" className="w-full h-full object-cover" />
                </div>
              )}

              <button
                type="button"
                onClick={handleAddVariant}
                className="px-4 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition shrink-0"
              >
                + Add Variant
              </button>
            </div>

            {formData.variants.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {formData.variants.map((v, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full pl-1.5 pr-3 py-1 shadow-sm"
                  >
                    <img src={v.image} alt="Variant" className="w-6 h-6 rounded-full object-cover" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Variant {index + 1}</span>
                    <button type="button" onClick={() => handleRemoveVariant(index)} className="text-slate-400 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Original Price *</label>
              <input
                type="number"
                required
                min="0"
                step="any"
                value={formData.originalPrice}
                onChange={(e) => handlePriceChange("originalPrice", e.target.value)}
                className="w-full mt-1.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sale Price</label>
              <input
                type="number"
                min="0"
                step="any"
                value={formData.discountPrice}
                onChange={(e) => handlePriceChange("discountPrice", e.target.value)}
                className="w-full mt-1.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Discount</label>
              <div className="mt-1.5 p-2.5 rounded-xl bg-amber-100/50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold text-xs text-center flex items-center justify-center">
                {liveDiscount.hasDiscount ? `${liveDiscount.discountPercentage}% OFF` : "0%"}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Quantity *</label>
            <input
              type="number"
              required
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="w-full mt-1.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* NO 2: Mobile par button click lock hone ka masla khatam kar diya gaya hai */}
          <button
            type="submit"
            disabled={uploading || uploadingVariant}
            className="w-full bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 py-3.5 rounded-2xl font-bold text-sm hover:opacity-95 disabled:opacity-50 transition-all shadow-lg shadow-slate-900/10 cursor-pointer"
          >
            {uploading ? "Saving Piece..." : editingProduct ? "Update Jewellery Piece" : "Save Jewellery Piece"}
          </button>
        </form>
      </Modal>

    </div>
  );
};