import React, { useState } from "react";
import { useStore } from "../context/StoreContext";
import { Plus, Search, Trash2, Edit2, AlertCircle, Upload, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";

export default function CategoriesView() {
  const { categories, addCategory, updateCategory, deleteCategory } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);

  const initialFormState = () => ({
    name: "",
    image: "",
  });

  const [formData, setFormData] = useState(initialFormState());

  const convertToBase64 = (file) => {
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
      maxSizeMB: 0.2,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      const base64Image = await convertToBase64(compressedFile);
      setFormData((prev) => ({ ...prev, image: base64Image }));
    } catch (err) {
      console.error("Image compression error:", err);
      setValidationError("Image compress ya read karne mein error aaya. Dobara try karein.");
    } finally {
      setUploading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormData(initialFormState());
    setValidationError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: typeof cat === "string" ? cat : cat.name || "",
      image: typeof cat === "string" ? "" : cat.image || "",
    });
    setValidationError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setValidationError("Category ka naam likhna zaroori hai.");
      return;
    }

    setSaving(true);
    setValidationError("");

    try {
      const payload = {
        name: formData.name.trim(),
        image: formData.image || "https://via.placeholder.com/150",
      };

      if (editingCategory) {
        const catId = editingCategory.id || editingCategory;
        await updateCategory(catId, payload);
      } else {
        await addCategory(payload);
      }

      setIsModalOpen(false);
      setFormData(initialFormState());
      setEditingCategory(null);
    } catch (error) {
      console.error("Error saving category:", error);
      setValidationError(error.message || "Category save karte hue error aaya.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Kya aap waqai is category ko delete karna chahte hain?")) return;
    try {
      await deleteCategory(id);
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const filteredCategories = (categories || []).filter((c) => {
    const catName = typeof c === "string" ? c : c.name;
    return catName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Categories</h1>
          <p className="text-sm text-slate-500">Manage collections shown on Home and Shop pages</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-xl font-medium text-sm hover:opacity-90 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
        />
      </div>

      {filteredCategories.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-10 text-center text-slate-400 text-sm">
          Koi category nahi mili. "Add Category" se nayi category banayein.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {filteredCategories.map((cat, index) => {
            const catId = typeof cat === "string" ? cat : cat.id || index;
            const catName = typeof cat === "string" ? cat : cat.name;
            const catImage = typeof cat === "string" ? "https://via.placeholder.com/150" : cat.image || "https://via.placeholder.com/150";

            return (
              <div
                key={catId}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex flex-col items-center text-center shadow-sm relative group"
              >
                <img
                  src={catImage}
                  alt={catName}
                  className="w-20 h-20 rounded-full object-cover border border-slate-200 mb-3"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/150";
                  }}
                />
                <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1 w-full">
                  {catName}
                </p>
                
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(cat)}
                    className="text-slate-400 hover:text-blue-500 transition p-1 cursor-pointer"
                    title="Edit category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(catId)}
                    className="text-slate-400 hover:text-red-500 transition p-1 cursor-pointer"
                    title="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {validationError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Necklace"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Category Image (Optional)</label>
                <div className="mt-1 flex items-center gap-4">
                  <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    {uploading ? (
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <Loader2 className="w-4 h-4 animate-spin" /> Compressing...
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-500">
                        <Upload className="w-5 h-5" />
                        <span className="text-xs font-medium">Click to upload image</span>
                        <span className="text-[10px] text-slate-400">PNG, JPG or WEBP</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>

                  {formData.image && (
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border border-slate-200 shrink-0">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading || saving}
                className="w-full bg-black dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
              >
                {saving ? "Saving..." : editingCategory ? "Update Category" : "Save Category"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}