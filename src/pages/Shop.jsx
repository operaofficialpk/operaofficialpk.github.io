import { Link } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

function Shop() {
  const { addToCart } = useContext(CartContext);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = [
    "All",
    "Necklace",
    "Earrings",
    "Ring",
    "Bridal"
  ];

  // Fetch products from Firebase Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsList);
      } catch (error) {
        console.error("Error fetching products from Firebase:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchSearch = product.name
      ? product.name.toLowerCase().includes(search.toLowerCase())
      : true;

    const matchCategory =
      category === "All" || product.category === category;

    return matchSearch && matchCategory;
  });

  return (
    <section className="py-20 px-6 bg-gray-50">
      <h1 className="text-5xl font-bold text-center mb-10">
        Jewellery Collection
      </h1>

      {/* Search */}
      <div className="max-w-xl mx-auto mb-8">
        <input
          type="text"
          placeholder="Search Jewellery..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-full px-6 py-4 outline-none"
        />
      </div>

      {/* Categories */}
      <div className="flex justify-center gap-4 flex-wrap mb-12">
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            className={`px-6 py-2 rounded-full border ${
              category === item
                ? "bg-black text-white"
                : "bg-white text-black"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Loading Indicator */}
      {loading ? (
        <div className="text-center py-10 font-semibold text-lg text-gray-600">
          Loading products...
        </div>
      ) : (
        /* Products Grid */
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {filteredProducts.length === 0 ? (
            <div className="col-span-3 text-center text-gray-500 text-xl py-10">
              No products found.
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-3xl overflow-hidden shadow hover:shadow-xl transition"
              >
                <Link to={`/product/${product.id}`}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-96 object-cover"
                  />
                </Link>

                <div className="p-6 text-center">
                  <p className="text-gray-500">{product.category}</p>

                  <h2 className="text-xl font-bold mt-2">
                    {product.name}
                  </h2>

                  <p className="mt-3 font-semibold">
                    Rs. {product.price}
                  </p>

                  <button
                    onClick={() => addToCart(product)}
                    className="mt-5 bg-black text-white px-8 py-3 rounded-full cursor-pointer hover:bg-gray-800 transition"
                  >
                    Add To Cart
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}

export default Shop;