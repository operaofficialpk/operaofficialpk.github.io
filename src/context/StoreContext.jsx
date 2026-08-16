import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDocs,
} from "firebase/firestore";

export const StoreContext = createContext();

const initialProducts = [
  {
    id: "prod-1",
    name: "Wireless Headphones",
    sku: "WNC-001",
    category: "Electronics",
    originalPrice: 5000,
    discountPrice: 4000,
    stock: 25,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
    status: "active",
    variants: [],
  },
];

export const StoreProvider = ({ children }) => {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem("app_products");
    return saved ? JSON.parse(saved) : initialProducts;
  });

  // Categories state
  const [categories, setCategories] = useState([]);

  // Wishlist state
  const [wishlist, setWishlist] = useState(() => {
    const savedWishlist = localStorage.getItem("app_wishlist");
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  const [toast, setToast] = useState(null);

  // Firestore se products aur categories load karna
  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodSnapshot = await getDocs(collection(db, "products"));
        const firestoreProducts = prodSnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        if (firestoreProducts.length > 0) {
          setProducts(firestoreProducts);
        }

        const catSnapshot = await getDocs(collection(db, "categories"));
        const firestoreCategories = catSnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        if (firestoreCategories.length > 0) {
          setCategories(firestoreCategories);
        }
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem("app_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("app_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const showToast = (message) => {
    setToastingState(message);
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };
  
  const setToastingState = (msg) => {
    // helper to avoid naming conflicts if any
  };

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        showToast("Removed from Wishlist");
        return prev.filter((item) => item.id !== product.id);
      } else {
        showToast("Added to Wishlist");
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  // Categories Functions
  const addCategory = async (categoryData) => {
    try {
      // Clean payload ensuring plain data types
      const cleanData = {
        name: String(categoryData.name || "").trim(),
        image: String(categoryData.image || ""),
      };

      const docRef = await addDoc(collection(db, "categories"), cleanData);
      setCategories((prev) => [{ id: docRef.id, ...cleanData }, ...prev]);
      showToast("Category saved successfully!");
    } catch (error) {
      console.error("Error adding category to Firestore:", error);
      showToast("Error: Category save nahi hui!");
      throw error;
    }
  };

  const updateCategory = async (id, updatedData) => {
    try {
      const categoryRef = doc(db, "categories", id);
      await updateDoc(categoryRef, updatedData);
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updatedData } : c))
      );
      showToast("Category updated successfully!");
    } catch (error) {
      console.error("Error updating category in Firestore:", error);
      showToast("Error: Category update nahi hui!");
    }
  };

  const deleteCategory = async (id) => {
    try {
      await deleteDoc(doc(db, "categories", id));
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showToast("Category deleted!");
    } catch (error) {
      console.error("Error deleting category from Firestore:", error);
      showToast("Error: Category delete nahi hui!");
    }
  };

  const addProduct = async (product) => {
    try {
      const docRef = await addDoc(collection(db, "products"), product);
      setProducts((prev) => [{ ...product, id: docRef.id }, ...prev]);
      showToast("Product saved successfully!");
    } catch (error) {
      console.error("Error adding product to Firestore:", error);
      showToast("Error: Product Firestore mein save nahi hua!");
      throw error;
    }
  };

  const updateProduct = async (id, updatedData) => {
    try {
      const productRef = doc(db, "products", id);
      await updateDoc(productRef, updatedData);
      setProducts((prev) =>
        prev.path ? prev : prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p))
      );
      showToast("Product updated successfully!");
    } catch (error) {
      console.error("Error updating product in Firestore:", error);
      showToast("Error: Product update nahi hua!");
    }
  };

  const deleteProduct = async (id) => {
    try {
      await deleteDoc(doc(db, "products", id));
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast("Product deleted!");
    } catch (error) {
      console.error("Error deleting product from Firestore:", error);
      showToast("Error: Product delete nahi hua!");
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        addProduct,
        updateProduct,
        deleteProduct,
        toast,
        wishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);