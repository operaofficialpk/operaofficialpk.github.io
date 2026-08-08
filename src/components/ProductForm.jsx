import { useState, useRef } from "react";
import { uploadImage } from "./cloudinary";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

function ProductForm() {
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "Necklace",
    description: "",
    colors: "", // Naya field
    featured: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageLoading(true);
    try {
      const url = await uploadImage(file);
      setImageUrl(url);
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Image upload karne mein masla aaya hai.");
    } finally {
      setImageLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (imageLoading) {
      alert("Please wait for the image to finish uploading.");
      return;
    }

    if (!imageUrl) {
      alert("Please upload an image before submitting.");
      return;
    }

    setLoading(true);

    try {
      // Colors ko comma se split karke array bana rahe hain
      const colorArray = formData.colors
        ? formData.colors.split(",").map((c) => c.trim())
        : [];

      const productPayload = {
        name: formData.name,
        price: Number(formData.price),
        category: formData.category,
        description: formData.description,
        colors: colorArray, // Array format mein save hoga
        featured: formData.featured,
        image: imageUrl,
        createdAt: new Date(),
      };

      await addDoc(collection(db, "products"), productPayload);

      alert("Product successfully added to database!");

      // Reset Form State
      setFormData({
        name: "",
        price: "",
        category: "Necklace",
        description: "",
        colors: "",
        featured: false,
      });
      setImageUrl("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error saving product to Firebase:", error);
      alert("Database mein save karte waqt masla aaya hai.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-10">
      <h2 className="text-3xl font-bold mb-8">Add New Product</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border rounded-xl px-5 py-3 outline-none focus:border-black"
          required
        />

        <input
          type="number"
          name="price"
          placeholder="Price (Rs.)"
          value={formData.price}
          onChange={handleChange}
          className="w-full border rounded-xl px-5 py-3 outline-none focus:border-black"
          required
        />

        {/* Naya Color Input */}
        <input
          type="text"
          name="colors"
          placeholder="Colors (e.g. Gold, Silver, Rose Gold)"
          value={formData.colors}
          onChange={handleChange}
          className="w-full border rounded-xl px-5 py-3 outline-none focus:border-black"
        />

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full border rounded-xl px-5 py-3 outline-none focus:border-black cursor-pointer"
        >
          <option value="Necklace">Necklace</option>
          <option value="Earrings">Earrings</option>
          <option value="Ring">Ring</option>
          <option value="Bridal">Bridal</option>
        </select>

        <textarea
          rows="4"
          name="description"
          placeholder="Product Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border rounded-xl px-5 py-3 outline-none focus:border-black"
        />

        <div>
          <label className="block font-semibold mb-3">Product Image</label>
          <label className="inline-block bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-800 font-medium px-5 py-2.5 rounded-xl cursor-pointer transition">
            Choose Image
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="hidden"
            />
          </label>
        </div>

        {/* ... (image loading/preview code remains same) */}
        {imageLoading && <p className="text-blue-600 animate-pulse">Uploading...</p>}
        {imageUrl && (
          <div className="relative w-48 h-48 mt-4">
            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
            <button type="button" onClick={handleRemoveImage} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1">✕</button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || imageLoading}
          className={`w-full py-4 rounded-xl text-white font-semibold ${loading ? "bg-gray-400" : "bg-black hover:bg-gray-800"}`}
        >
          {loading ? "Saving..." : "Save Product"}
        </button>
      </form>
    </div>
  );
}

export default ProductForm;