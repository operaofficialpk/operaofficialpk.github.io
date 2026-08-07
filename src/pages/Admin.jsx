import { useState, useEffect } from "react";
import ProductForm from "../components/ProductForm";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

function Admin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login, setLogin] = useState(false);
  const [activeTab, setActiveTab] = useState("products"); // 'products' or 'orders'

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "opera" && password === "12345") {
      setLogin(true);
    } else {
      alert("Wrong Username or Password");
    }
  };

  // Fetch Products & Orders from Firebase
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Products
      const prodSnap = await getDocs(collection(db, "products"));
      const prodList = prodSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(prodList);

      // Fetch Orders
      const orderSnap = await getDocs(collection(db, "orders"));
      const orderList = orderSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOrders(orderList);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (login) {
      fetchData();
    }
  }, [login]);

  // Delete Product
  const handleDeleteProduct = async (id) => {
    if (window.confirm("Kya aap is product ko delete karna chahte hain?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        setProducts(products.filter((item) => item.id !== id));
        alert("Product deleted successfully!");
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Product delete karne mein masla aaya.");
      }
    }
  };

  if (!login) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
        <form
          onSubmit={handleLogin}
          className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md"
        >
          <h1 className="text-3xl font-bold text-center mb-8">
            Opera Admin Login
          </h1>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border px-5 py-3 rounded-full mb-4 outline-none focus:border-black"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-5 py-3 rounded-full mb-6 outline-none focus:border-black"
          />

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-full cursor-pointer hover:bg-gray-800 transition font-semibold"
          >
            Login
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="py-12 px-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold">Opera Admin Dashboard</h1>
          <button
            onClick={() => setLogin(false)}
            className="bg-red-600 text-white px-6 py-2 rounded-full cursor-pointer hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-8 py-3 rounded-full font-semibold transition cursor-pointer ${
              activeTab === "products"
                ? "bg-black text-white"
                : "bg-white text-black border"
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-8 py-3 rounded-full font-semibold transition cursor-pointer ${
              activeTab === "orders"
                ? "bg-black text-white"
                : "bg-white text-black border"
            }`}
          >
            Orders ({orders.length})
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="space-y-12">
            <ProductForm />

            <div className="bg-white p-8 rounded-3xl shadow-xl">
              <h2 className="text-2xl font-bold mb-6">Manage Products</h2>

              {loading ? (
                <p>Loading products...</p>
              ) : products.length === 0 ? (
                <p className="text-gray-500">No products added yet.</p>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="border rounded-2xl p-4 flex flex-col justify-between"
                    >
                      <div>
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-40 object-cover rounded-xl mb-3"
                        />
                        <h3 className="font-bold text-lg">{p.name}</h3>
                        <p className="text-gray-600">Rs. {p.price}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Category: {p.category} {p.featured && "• Featured"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="mt-4 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white py-2 rounded-xl transition cursor-pointer font-medium"
                      >
                        Delete Product
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="bg-white p-8 rounded-3xl shadow-xl">
            <h2 className="text-2xl font-bold mb-6">Customer Orders</h2>

            {loading ? (
              <p>Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-gray-500">No orders received yet.</p>
            ) : (
              <div className="space-y-6">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="border rounded-2xl p-6 bg-gray-50 flex flex-col md:flex-row justify-between gap-6"
                  >
                    <div>
                      <h3 className="font-bold text-lg text-black">
                        {o.customer?.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Phone: {o.customer?.phone}
                      </p>
                      <p className="text-sm text-gray-600">
                        Address: {o.customer?.address}, {o.customer?.city}
                      </p>
                    </div>

                    <div className="flex-1 max-w-md">
                      <h4 className="font-semibold text-sm mb-2 text-gray-700">
                        Ordered Items:
                      </h4>
                      <ul className="text-sm space-y-1">
                        {o.items?.map((item, idx) => (
                          <li key={idx} className="text-gray-600">
                            • {item.name} x{item.quantity} (Rs. {item.price})
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-xl">
                        Total: Rs. {o.totalAmount}
                      </p>
                      <span className="inline-block mt-2 text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold">
                        {o.status || "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default Admin;