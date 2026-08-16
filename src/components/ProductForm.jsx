import React, { useEffect, useRef, useState } from "react";
import { uploadImage } from "../utils/cloudinary";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

function ProductForm() {
  // =========================================================
  // PRODUCT STATES
  // =========================================================

  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    originalPrice: "",
    price: "",
    discountPercent: "",
    category: "",
    description: "",
    featured: false,
  });

  // =========================================================
  // CATEGORY STATES
  // =========================================================

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState("");
  const [categoryImagePreview, setCategoryImagePreview] =
    useState("");

  const [categoryImageLoading, setCategoryImageLoading] =
    useState(false);

  const [editingCategoryId, setEditingCategoryId] =
    useState(null);

  const categoryFileInputRef = useRef(null);

  // =========================================================
  // VARIANTS
  // =========================================================

  const [variants, setVariants] = useState([
    {
      imageFile: "",
      imagePreview: "",
      uploading: false,
    },
  ]);

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // =========================================================
  // FETCH CATEGORIES
  // =========================================================

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);

      const snapshot = await getDocs(
        collection(db, "categories")
      );

      const catList = snapshot.docs.map((categoryDoc) => ({
        id: categoryDoc.id,
        ...categoryDoc.data(),
      }));

      setCategories(catList);

      if (catList.length > 0) {
        setFormData((prev) => ({
          ...prev,
          category:
            prev.category || catList[0].name,
        }));
      }
    } catch (error) {
      console.error(
        "Error fetching categories:",
        error
      );

      alert(
        "Categories load nahi ho saki."
      );
    } finally {
      setCategoriesLoading(false);
    }
  };

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================

  const fetchProducts = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "products")
      );

      const prodList = snapshot.docs.map(
        (productDoc) => ({
          id: productDoc.id,
          ...productDoc.data(),
        })
      );

      setProducts(prodList);
    } catch (error) {
      console.error(
        "Error fetching products:",
        error
      );

      alert(
        "Products load nahi ho sake."
      );
    }
  };

  // =========================================================
  // RESET PRODUCT FORM
  // =========================================================

  const resetProductForm = () => {
    setEditingId(null);

    setFormData({
      name: "",
      sku: "",
      originalPrice: "",
      price: "",
      discountPercent: "",
      category:
        categories.length > 0
          ? categories[0].name
          : "",
      description: "",
      featured: false,
    });

    setImageUrl("");

    setVariants([
      {
        imageFile: "",
        imagePreview: "",
        uploading: false,
      },
    ]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =========================================================
  // RESET CATEGORY FORM
  // =========================================================

  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setCategoryName("");
    setCategoryImage("");
    setCategoryImagePreview("");

    if (categoryFileInputRef.current) {
      categoryFileInputRef.current.value = "";
    }
  };

  // =========================================================
  // PRODUCT INPUT CHANGE
  // =========================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]:
          type === "checkbox"
            ? checked
            : value,
      };

      // Auto discount calculation
      if (
        name === "price" ||
        name === "originalPrice"
      ) {
        const original =
          parseFloat(
            updated.originalPrice
          ) || 0;

        const selling =
          parseFloat(
            updated.price
          ) || 0;

        if (
          original > 0 &&
          selling > 0 &&
          original > selling
        ) {
          const discount = Math.round(
            ((original - selling) /
              original) *
              100
          );

          updated.discountPercent =
            discount.toString();
        } else {
          updated.discountPercent = "";
        }
      }

      return updated;
    });
  };

  // =========================================================
  // MAIN PRODUCT IMAGE UPLOAD
  // =========================================================

  const handleImage = async (e) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    setImageLoading(true);

    try {
      const url =
        await uploadImage(file);

      if (!url) {
        throw new Error(
          "Cloudinary URL empty"
        );
      }

      setImageUrl(url);
    } catch (error) {
      console.error(
        "Failed to upload image:",
        error
      );

      alert(
        "Main product image upload karne mein masla aaya hai."
      );
    } finally {
      setImageLoading(false);
    }
  };

  // =========================================================
  // REMOVE MAIN PRODUCT IMAGE
  // =========================================================

  const handleRemoveImage = () => {
    setImageUrl("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =========================================================
  // CATEGORY IMAGE UPLOAD
  // =========================================================

  const handleCategoryImage = async (e) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    setCategoryImageLoading(true);

    try {
      const url =
        await uploadImage(file);

      if (!url) {
        throw new Error(
          "Cloudinary URL empty"
        );
      }

      setCategoryImage(url);

      setCategoryImagePreview(
        URL.createObjectURL(file)
      );
    } catch (error) {
      console.error(
        "Failed to upload category image:",
        error
      );

      alert(
        "Category image upload karne mein masla aaya hai."
      );
    } finally {
      setCategoryImageLoading(false);
    }
  };

  // =========================================================
  // REMOVE CATEGORY IMAGE
  // =========================================================

  const handleRemoveCategoryImage =
    () => {
      setCategoryImage("");
      setCategoryImagePreview("");

      if (
        categoryFileInputRef.current
      ) {
        categoryFileInputRef.current.value =
          "";
      }
    };

  // =========================================================
  // ADD / UPDATE CATEGORY
  // =========================================================

  const handleCategorySubmit =
    async (e) => {
      e.preventDefault();

      if (!categoryName.trim()) {
        alert(
          "Please enter category name."
        );
        return;
      }

      try {
        setCategoryImageLoading(
          true
        );

        const categoryPayload = {
          name: categoryName.trim(),
          image: categoryImage || "",
        };

        if (editingCategoryId) {
          await updateDoc(
            doc(
              db,
              "categories",
              editingCategoryId
            ),
            categoryPayload
          );

          alert(
            "Category updated successfully!"
          );
        } else {
          await addDoc(
            collection(
              db,
              "categories"
            ),
            categoryPayload
          );

          alert(
            "Category added successfully!"
          );
        }

        resetCategoryForm();

        await fetchCategories();
      } catch (error) {
        console.error(
          "Error saving category:",
          error
        );

        alert(
          "Category save karte waqt masla aaya hai."
        );
      } finally {
        setCategoryImageLoading(
          false
        );
      }
    };

  // =========================================================
  // EDIT CATEGORY
  // =========================================================

  const handleCategoryEdit = (
    category
  ) => {
    if (!category) return;

    setEditingCategoryId(
      category.id
    );

    setCategoryName(
      category.name || ""
    );

    setCategoryImage(
      category.image || ""
    );

    setCategoryImagePreview(
      category.image || ""
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // DELETE CATEGORY
  // =========================================================

  const handleCategoryDelete =
    async (id) => {
      if (!id) return;

      const confirmed =
        window.confirm(
          "Kya aap waqai is category ko delete karna chahte hain?"
        );

      if (!confirmed) return;

      try {
        await deleteDoc(
          doc(
            db,
            "categories",
            id
          )
        );

        alert(
          "Category deleted successfully!"
        );

        await fetchCategories();
      } catch (error) {
        console.error(
          "Error deleting category:",
          error
        );

        alert(
          "Category delete nahi ho saki."
        );
      }
    };

  // =========================================================
  // VARIANT IMAGE UPLOAD
  // =========================================================

  const handleVariantImageChange =
    async (index, e) => {
      const file =
        e.target.files?.[0];

      if (!file) return;

      setVariants((prev) =>
        prev.map((variant, i) =>
          i === index
            ? {
                ...variant,
                uploading: true,
              }
            : variant
        )
      );

      try {
        const url =
          await uploadImage(file);

        if (!url) {
          throw new Error(
            "Variant image URL empty"
          );
        }

        setVariants((prev) =>
          prev.map((variant, i) =>
            i === index
              ? {
                  ...variant,
                  imageFile: url,
                  imagePreview:
                    URL.createObjectURL(
                      file
                    ),
                  uploading: false,
                }
              : variant
          )
        );
      } catch (error) {
        console.error(
          "Variant image upload failed:",
          error
        );

        alert(
          "Variant image upload nahi ho saki."
        );

        setVariants((prev) =>
          prev.map((variant, i) =>
            i === index
              ? {
                  ...variant,
                  uploading: false,
                }
              : variant
          )
        );
      }
    };

  // =========================================================
  // ADD VARIANT
  // =========================================================

  const addVariantField = () => {
    setVariants((prev) => [
      ...prev,
      {
        imageFile: "",
        imagePreview: "",
        uploading: false,
      },
    ]);
  };

  // =========================================================
  // REMOVE VARIANT
  // =========================================================

  const removeVariantField = (
    index
  ) => {
    setVariants((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  };

  // =========================================================
  // SUBMIT PRODUCT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (imageLoading) {
      alert(
        "Please wait. Main image is still uploading."
      );
      return;
    }

    const variantUploading =
      variants.some(
        (variant) =>
          variant.uploading
      );

    if (variantUploading) {
      alert(
        "Please wait. Variant image is still uploading."
      );
      return;
    }

    if (!formData.name.trim()) {
      alert(
        "Please enter product name."
      );
      return;
    }

    if (!formData.price) {
      alert(
        "Please enter selling price."
      );
      return;
    }

    if (!imageUrl) {
      alert(
        "Please upload a main product image."
      );
      return;
    }

    if (!formData.category) {
      alert(
        "Please select a category."
      );
      return;
    }

    try {
      setLoading(true);

      const formattedVariants =
        variants
          .filter(
            (variant) =>
              variant &&
              variant.imageFile
          )
          .map((variant) => ({
            image: variant.imageFile,
          }));

      const productPayload = {
        name:
          formData.name.trim(),

        sku:
          formData.sku.trim(),

        originalPrice:
          formData.originalPrice
            ? Number(
                formData.originalPrice
              )
            : null,

        price:
          Number(formData.price) ||
          0,

        discountPercent:
          formData.discountPercent
            ? Number(
                formData.discountPercent
              )
            : null,

        category:
          formData.category.trim(),

        description:
          formData.description || "",

        variants:
          formattedVariants,

        featured:
          Boolean(
            formData.featured
          ),

        image: imageUrl,

        updatedAt: new Date(),
      };

      if (editingId) {
        await updateDoc(
          doc(
            db,
            "products",
            editingId
          ),
          productPayload
        );

        alert(
          "Product updated successfully!"
        );
      } else {
        await addDoc(
          collection(
            db,
            "products"
          ),
          {
            ...productPayload,
            createdAt: new Date(),
          }
        );

        alert(
          "Product successfully added to database!"
        );
      }

      resetProductForm();

      await fetchProducts();
    } catch (error) {
      console.error(
        "Error saving product:",
        error
      );

      alert(
        "Database mein product save karte waqt masla aaya hai."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // EDIT PRODUCT
  // =========================================================

  const handleEdit = (product) => {
    if (!product) return;

    setEditingId(product.id);

    setFormData({
      name:
        product.name || "",

      sku:
        product.sku || "",

      originalPrice:
        product.originalPrice ??
        "",

      price:
        product.price ?? "",

      discountPercent:
        product.discountPercent ??
        "",

      category:
        product.category || "",

      description:
        product.description || "",

      featured:
        Boolean(
          product.featured
        ),
    });

    setImageUrl(
      product.image || ""
    );

    if (
      Array.isArray(
        product.variants
      ) &&
      product.variants.length > 0
    ) {
      setVariants(
        product.variants.map(
          (variant) => ({
            imageFile:
              variant.image || "",

            imagePreview:
              variant.image || "",

            uploading: false,
          })
        )
      );
    } else {
      setVariants([
        {
          imageFile: "",
          imagePreview: "",
          uploading: false,
        },
      ]);
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // DELETE PRODUCT
  // =========================================================

  const handleDelete = async (
    id
  ) => {
    if (!id) return;

    const confirmed =
      window.confirm(
        "Kya aap waqai is product ko permanently delete karna chahte hain?"
      );

    if (!confirmed) return;

    try {
      await deleteDoc(
        doc(
          db,
          "products",
          id
        )
      );

      alert(
        "Product deleted successfully!"
      );

      await fetchProducts();
    } catch (error) {
      console.error(
        "Error deleting product:",
        error
      );

      alert(
        "Product delete nahi ho saka."
      );
    }
  };

  // =========================================================
  // COUNTS
  // =========================================================

  const featuredCount =
    products.filter(
      (product) =>
        product.featured
    ).length;

  const activeVariants =
    variants.filter(
      (variant) =>
        variant.imageFile
    ).length;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-8 font-sans pb-12">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
            Store Management
          </h1>

          <p className="text-xs text-gray-500 mt-1">
            Manage categories and products seamlessly.
          </p>
        </div>
      </div>

      {/* =====================================================
          METRIC CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Total Products
            </p>

            <h3 className="text-2xl font-black text-gray-900 mt-1">
              {products.length}
            </h3>
          </div>

          <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-xl">
            📦
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Categories
            </p>

            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              {categories.length}
            </h3>
          </div>

          <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-xl">
            🏷️
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Featured Items
            </p>

            <h3 className="text-2xl font-black text-gray-900 mt-1">
              {featuredCount}
            </h3>
          </div>

          <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-xl">
            ⭐
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Active Variants
            </p>

            <h3 className="text-2xl font-black text-gray-900 mt-1">
              {activeVariants}
            </h3>
          </div>

          <div className="w-12 h-12 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center text-xl">
            🖼️
          </div>
        </div>

      </div>

      {/* =====================================================
          CATEGORY MANAGEMENT
      ===================================================== */}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">

        <h2 className="text-lg font-black uppercase tracking-tight mb-6 text-gray-900 pb-4 border-b border-gray-100">
          {editingCategoryId
            ? "Edit Category"
            : "Add New Category"}
        </h2>

        <form
          onSubmit={
            handleCategorySubmit
          }
          className="space-y-4 mb-6"
        >

          <input
            type="text"
            placeholder="e.g. Necklace Sets, Bridal, Earrings"
            value={categoryName}
            onChange={(e) =>
              setCategoryName(
                e.target.value
              )
            }
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-black transition"
            required
          />

          {/* Category Image */}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Category Collection Image
            </label>

            <div className="flex flex-wrap items-center gap-4 p-4 border border-gray-200 rounded-2xl bg-gray-50">

              <label className="px-4 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition">
                Choose Image

                <input
                  ref={
                    categoryFileInputRef
                  }
                  type="file"
                  accept="image/*"
                  onChange={
                    handleCategoryImage
                  }
                  className="hidden"
                />
              </label>

              {categoryImageLoading && (
                <span className="text-xs text-blue-600 animate-pulse font-bold">
                  Uploading category image...
                </span>
              )}

              {(categoryImagePreview ||
                categoryImage) && (
                <div className="relative w-16 h-16">

                  <img
                    src={
                      categoryImagePreview ||
                      categoryImage
                    }
                    alt="Category Preview"
                    className="w-full h-full object-cover rounded-xl border border-gray-200"
                  />

                  <button
                    type="button"
                    onClick={
                      handleRemoveCategoryImage
                    }
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px] hover:bg-red-700"
                  >
                    ×
                  </button>

                </div>
              )}

            </div>
          </div>

          <div className="flex justify-end gap-2">

            {editingCategoryId && (
              <button
                type="button"
                onClick={
                  resetCategoryForm
                }
                className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold uppercase transition"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={
                categoryImageLoading
              }
              className="px-6 py-3 bg-black text-white hover:bg-gray-800 rounded-xl text-xs font-bold uppercase tracking-wider transition disabled:opacity-50"
            >
              {editingCategoryId
                ? "Update Category"
                : "Add Category +"}
            </button>

          </div>

        </form>

        {/* Existing Categories */}

        <div className="space-y-2">

          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Existing Categories
          </h3>

          {categoriesLoading ? (
            <p className="text-xs text-gray-400">
              Loading categories...
            </p>
          ) : categories.length ===
            0 ? (
            <p className="text-xs text-gray-400">
              No categories found.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">

              {categories.map(
                (category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-100 rounded-2xl gap-3"
                  >

                    <div className="flex items-center gap-3 min-w-0">

                      {category.image ? (
                        <img
                          src={
                            category.image
                          }
                          alt={
                            category.name
                          }
                          className="w-9 h-9 object-cover rounded-xl border border-gray-200 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-xs shrink-0">
                          🏷️
                        </div>
                      )}

                      <span className="text-xs font-bold text-gray-900 truncate">
                        {
                          category.name
                        }
                      </span>

                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">

                      <button
                        type="button"
                        onClick={() =>
                          handleCategoryEdit(
                            category
                          )
                        }
                        className="px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-[10px] font-bold transition"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleCategoryDelete(
                            category.id
                          )
                        }
                        className="px-2.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg text-[10px] font-bold transition"
                      >
                        Delete
                      </button>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </div>

      </div>

      {/* =====================================================
          PRODUCT FORM
      ===================================================== */}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">

        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">

          <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">
            {editingId
              ? "Edit Product Details"
              : "Add New Product"}
          </h2>

          {editingId && (
            <button
              type="button"
              onClick={
                resetProductForm
              }
              className="text-xs font-bold text-red-600 hover:text-red-700"
            >
              Cancel Editing
            </button>
          )}

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* Main Image */}

          <div>

            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Main Product Image
            </label>

            <div className="flex flex-wrap items-center gap-4 p-4 border border-gray-200 rounded-2xl bg-gray-50">

              <label className="px-4 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition">
                Choose Image

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={
                    handleImage
                  }
                  className="hidden"
                />
              </label>

              {imageLoading && (
                <span className="text-xs text-blue-600 animate-pulse font-bold">
                  Uploading main image...
                </span>
              )}

              {imageUrl && (
                <div className="relative w-20 h-20">

                  <img
                    src={imageUrl}
                    alt="Product Preview"
                    className="w-full h-full object-cover rounded-xl border border-gray-200"
                  />

                  <button
                    type="button"
                    onClick={
                      handleRemoveImage
                    }
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px]"
                  >
                    ×
                  </button>

                </div>
              )}

            </div>
          </div>

          {/* Name / SKU */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>

              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Product Name
              </label>

              <input
                type="text"
                name="name"
                placeholder="e.g. Royal Bridal Necklace Set"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-black transition"
                required
              />

            </div>

            <div>

              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Product SKU
              </label>

              <input
                type="text"
                name="sku"
                placeholder="e.g. NK-SET-001"
                value={formData.sku}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-black transition"
              />

            </div>

          </div>

          {/* Prices */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div>

              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Original Price (Rs.)
              </label>

              <input
                type="number"
                min="0"
                name="originalPrice"
                placeholder="e.g. 7000"
                value={
                  formData.originalPrice
                }
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-black transition"
              />

            </div>

            <div>

              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Selling Price (Rs.)
              </label>

              <input
                type="number"
                min="0"
                name="price"
                placeholder="e.g. 5000"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-black transition"
                required
              />

            </div>

            <div>

              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Discount (%)
              </label>

              <input
                type="number"
                min="0"
                max="100"
                name="discountPercent"
                placeholder="Auto-calculated"
                value={
                  formData.discountPercent
                }
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-emerald-600 outline-none"
              />

            </div>

          </div>

          {/* Category */}

          <div>

            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Category
            </label>

            <select
              name="category"
              value={
                formData.category
              }
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-black transition cursor-pointer"
              required
            >

              <option value="">
                Select Category
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={
                      category.name
                    }
                  >
                    {
                      category.name
                    }
                  </option>
                )
              )}

            </select>

          </div>

          {/* Description */}

          <div>

            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Description
            </label>

            <textarea
              rows="4"
              name="description"
              placeholder="Write a brief description about the product..."
              value={
                formData.description
              }
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-black transition resize-none"
            />

          </div>

          {/* Variants */}

          <div>

            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Product Variants
            </label>

            <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50 space-y-3">

              {variants.map(
                (
                  variant,
                  index
                ) => (
                  <div
                    key={index}
                    className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-xl border border-gray-200"
                  >

                    <div className="flex-1 min-w-[220px]">

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(
                          e
                        ) =>
                          handleVariantImageChange(
                            index,
                            e
                          )
                        }
                        className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                      />

                    </div>

                    <div className="flex items-center gap-3">

                      {variant.uploading && (
                        <span className="text-[11px] text-blue-600 animate-pulse font-bold">
                          Uploading...
                        </span>
                      )}

                      {variant.imagePreview && (
                        <img
                          src={
                            variant.imagePreview
                          }
                          alt={`Variant ${
                            index + 1
                          }`}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                        />
                      )}

                      {variants.length >
                        1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeVariantField(
                              index
                            )
                          }
                          className="bg-rose-50 text-rose-600 px-3 py-2 rounded-lg text-xs font-bold hover:bg-rose-100 transition"
                        >
                          Remove
                        </button>
                      )}

                    </div>

                  </div>
                )
              )}

              <button
                type="button"
                onClick={
                  addVariantField
                }
                className="w-full py-3 bg-gray-100 text-gray-800 hover:bg-black hover:text-white rounded-xl text-xs font-bold tracking-wider uppercase transition"
              >
                + Add Another Variant Image
              </button>

            </div>

          </div>

          {/* Featured */}

          <div className="flex items-center gap-2">

            <input
              type="checkbox"
              name="featured"
              id="featured"
              checked={
                formData.featured
              }
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 cursor-pointer"
            />

            <label
              htmlFor="featured"
              className="text-xs font-bold text-gray-700 cursor-pointer uppercase tracking-wider"
            >
              Mark as Featured Product
            </label>

          </div>

          {/* Product Buttons */}

          <div className="flex justify-end pt-4 border-t border-gray-100 gap-3">

            {editingId && (
              <button
                type="button"
                onClick={
                  resetProductForm
                }
                className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold uppercase tracking-wider transition"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={
                loading ||
                imageLoading ||
                categoriesLoading
              }
              className="px-6 py-3.5 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Processing..."
                : editingId
                ? "Update Product"
                : "Publish Product"}
            </button>

          </div>

        </form>

      </div>

      {/* =====================================================
          PRODUCTS MANAGEMENT LIST
      ===================================================== */}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">

          <div>

            <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">
              Manage Products
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              Edit or delete products from your store.
            </p>

          </div>

          <button
            type="button"
            onClick={fetchProducts}
            className="px-4 py-2.5 bg-gray-100 hover:bg-black hover:text-white rounded-xl text-xs font-bold transition"
          >
            Refresh
          </button>

        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl">

            <p className="text-gray-400 text-xs font-medium">
              No products available.
            </p>

          </div>
        ) : (
          <div className="space-y-3">

            {products.map(
              (product) => (
                <div
                  key={product.id}
                  className="flex flex-wrap items-center justify-between p-4 border border-gray-100 rounded-2xl bg-gray-50/30 hover:bg-gray-50 transition gap-4"
                >

                  <div className="flex items-center gap-4 min-w-0">

                    <img
                      src={
                        product.image ||
                        "https://placehold.co/100x100?text=No+Image"
                      }
                      alt={
                        product.name ||
                        "Product"
                      }
                      className="w-14 h-14 object-cover rounded-xl border border-gray-200 shrink-0"
                    />

                    <div className="min-w-0">

                      <h3 className="font-bold text-gray-900 text-sm truncate">
                        {
                          product.name ||
                          "Unnamed Product"
                        }
                      </h3>

                      <div className="text-[11px] text-gray-500 mt-1 flex flex-wrap items-center gap-2">

                        {product.sku && (
                          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-bold">
                            SKU:{" "}
                            {
                              product.sku
                            }
                          </span>
                        )}

                        {product.originalPrice && (
                          <span className="line-through text-gray-400">
                            Rs.{" "}
                            {Number(
                              product.originalPrice
                            ).toLocaleString()}
                          </span>
                        )}

                        <span className="font-bold text-gray-800">
                          Rs.{" "}
                          {Number(
                            product.price ||
                              0
                          ).toLocaleString()}
                        </span>

                        {product.discountPercent && (
                          <span className="text-emerald-600 font-bold">
                            {
                              product.discountPercent
                            }
                            % OFF
                          </span>
                        )}

                        {product.category && (
                          <span>
                            •{" "}
                            <strong className="text-gray-800">
                              {
                                product.category
                              }
                            </strong>
                          </span>
                        )}

                        {product.featured && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded font-bold text-[10px]">
                            Featured
                          </span>
                        )}

                      </div>

                    </div>

                  </div>

                  <div className="flex items-center gap-2 shrink-0">

                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(
                          product
                        )
                      }
                      className="px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          product.id
                        )
                      }
                      className="px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-bold transition"
                    >
                      Delete
                    </button>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>

    </div>
  );
}

export default ProductForm;