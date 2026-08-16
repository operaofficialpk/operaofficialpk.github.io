import { createContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const CartContext = createContext();

export function CartProvider({ children }) {
  // ============================================================
  // ROUTE CHANGE LISTENER (Auto-close drawer on navigation)
  // ============================================================
  const location = useLocation();

  useEffect(() => {
    setIsCartOpen(false);
  }, [location]);

  // ============================================================
  // CART STATE
  // ============================================================

  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cart");

      if (!savedCart) {
        return [];
      }

      const parsedCart = JSON.parse(savedCart);

      return Array.isArray(parsedCart) ? parsedCart : [];
    } catch (error) {
      console.error("Error reading cart from localStorage:", error);
      return [];
    }
  });

  // ============================================================
  // CART DRAWER STATE
  // ============================================================

  const [isCartOpen, setIsCartOpen] = useState(false);

  // ============================================================
  // SAVE CART
  // ============================================================

  const saveCart = (newCart) => {
    setCart(newCart);

    try {
      localStorage.setItem("cart", JSON.stringify(newCart));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  };

  // ============================================================
  // OPEN CART DRAWER
  // ============================================================

  const openCart = () => {
    setIsCartOpen(true);
  };

  // ============================================================
  // CLOSE CART DRAWER
  // ============================================================

  const closeCart = () => {
    setIsCartOpen(false);
  };

  // ============================================================
  // ADD TO CART
  // ============================================================

  const addToCart = (product, qtyToAdd = 1) => {
    if (!product) return;

    const selectedColor = product.selectedColor || "Default";

    const quantityToAdd =
      Number(qtyToAdd) > 0 ? Number(qtyToAdd) : 1;

    const existing = cart.find(
      (item) =>
        String(item.id) === String(product.id) &&
        (item.selectedColor || "Default") === selectedColor
    );

    const basePrice =
      Number(product.price) ||
      Number(product.discountPrice) ||
      Number(product.finalPrice) ||
      Number(product.originalPrice) ||
      0;

    let updatedCart;

    if (existing) {
      updatedCart = cart.map((item) => {
        const sameProduct =
          String(item.id) === String(product.id);

        const sameColor =
          (item.selectedColor || "Default") === selectedColor;

        if (sameProduct && sameColor) {
          return {
            ...item,
            price: basePrice,
            quantity:
              Number(item.quantity || 1) + quantityToAdd,
            selectedColor,
          };
        }

        return item;
      });
    } else {
      updatedCart = [
        ...cart,
        {
          ...product,
          price: basePrice,
          quantity: quantityToAdd,
          selectedColor,
        },
      ];
    }

    saveCart(updatedCart);

    // Product add hone ke baad drawer automatically open
    setIsCartOpen(true);
  };

  // ============================================================
  // INCREASE QUANTITY
  // ============================================================

  const increaseQuantity = (
    id,
    selectedColor = "Default"
  ) => {
    const updatedCart = cart.map((item) => {
      const sameProduct =
        String(item.id) === String(id);

      const sameColor =
        (item.selectedColor || "Default") === selectedColor;

      if (sameProduct && sameColor) {
        return {
          ...item,
          quantity: Number(item.quantity || 1) + 1,
        };
      }

      return item;
    });

    saveCart(updatedCart);
  };

  // ============================================================
  // DECREASE QUANTITY
  // ============================================================

  const decreaseQuantity = (
    id,
    selectedColor = "Default"
  ) => {
    const updatedCart = cart.map((item) => {
      const sameProduct =
        String(item.id) === String(id);

      const sameColor =
        (item.selectedColor || "Default") === selectedColor;

      if (sameProduct && sameColor) {
        const currentQuantity =
          Number(item.quantity || 1);

        return {
          ...item,
          quantity:
            currentQuantity > 1
              ? currentQuantity - 1
              : 1,
        };
      }

      return item;
    });

    saveCart(updatedCart);
  };

  // ============================================================
  // UPDATE QUANTITY
  // ============================================================

  const updateQuantity = (
    id,
    newQty,
    selectedColor = "Default"
  ) => {
    const quantity = Number(newQty);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      removeFromCart(id, selectedColor);
      return;
    }

    const updatedCart = cart.map((item) => {
      const sameProduct =
        String(item.id) === String(id);

      const sameColor =
        (item.selectedColor || "Default") === selectedColor;

      if (sameProduct && sameColor) {
        return {
          ...item,
          quantity: Math.floor(quantity),
        };
      }

      return item;
    });

    saveCart(updatedCart);
  };

  // ============================================================
  // REMOVE FROM CART
  // ============================================================

  const removeFromCart = (
    id,
    selectedColor = null
  ) => {
    const updatedCart = cart.filter((item) => {
      const sameProduct =
        String(item.id) === String(id);

      if (!sameProduct) {
        return true;
      }

      if (selectedColor !== null) {
        const itemColor =
          item.selectedColor || "Default";

        return itemColor !== selectedColor;
      }

      return false;
    });

    saveCart(updatedCart);
  };

  // ============================================================
  // CLEAR ENTIRE CART
  // ============================================================

  const clearCart = () => {
    saveCart([]);
  };

  // ============================================================
  // TOTAL ITEMS
  // ============================================================

  const totalItems = cart.reduce(
    (sum, item) => {
      return sum + Number(item.quantity || 1);
    },
    0
  );

  // ============================================================
  // TOTAL PRICE
  // ============================================================

  const totalPrice = cart.reduce(
    (sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 1;

      return sum + price * quantity;
    },
    0
  );

  // ============================================================
  // ESC KEY + BODY SCROLL LOCK
  // ============================================================

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsCartOpen(false);
      }
    };

    if (isCartOpen) {
      document.addEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  // ============================================================
  // CONTEXT
  // ============================================================

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}