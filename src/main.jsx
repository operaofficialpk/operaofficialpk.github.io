import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async"; // <-- HelmetProvider import kiya

import App from "./App.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { StoreProvider } from "./context/StoreContext.jsx";

import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <HelmetProvider> {/* <-- Yahan HelmetProvider add kar diya hai */}
        <AuthProvider>
          <CartProvider>
            <StoreProvider>
              <App />
            </StoreProvider>
          </CartProvider>
        </AuthProvider>
      </HelmetProvider>
    </HashRouter>
  </StrictMode>
);