import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { db } from "../firebase";
import { collection, getDocs, query, limit } from "firebase/firestore";

function FeaturedProducts() {
  const { addToCart } = useContext(CartContext);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // Firebase Firestore se latest 6 products fetch karna
        const q = query(collection(db, "products"), limit(6));

        const querySnapshot = await getDocs(q);
        const productsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFeaturedProducts(productsList);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <section className="py-20 px-6">
      <h2 className="text-4xl font-bold text-center mb-12">
        Featured Collection
      </h2>

      {loading ? (
        <div className="text-center py-10 text-gray-500 font-semibold">
          Loading Featured Collection...
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {featuredProducts.length === 0 ? (
            <div className="col-span-3 text-center text-gray-500 text-lg py-10">
              No featured products found.
            </div>
          ) : (
            featuredProducts.map((product) => (
              <div
                key={product.id}
                className="border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition bg-white flex flex-col justify-between"
              >
                <div>
                  <Link to={`/product/${product.id}`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-80 object-cover cursor-pointer"
                    />
                  </Link>

                  <div className="p-6 text-center">
                    <p className="text-gray-500 text-sm">
                      {product.category}
                    </p>

                    <Link to={`/product/${product.id}`}>
                      <h3 className="text-xl font-bold mt-2 hover:text-gray-500 transition">
                        {product.name}
                      </h3>
                    </Link>

                    <p className="mt-3 font-semibold text-lg">
                      Rs. {product.price}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 text-center">
                  <button
                    type="button"
                    onClick={() => addToCart(product)}
                    className="w-full bg-black text-white px-8 py-3 rounded-full cursor-pointer hover:bg-gray-800 transition"
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

export default FeaturedProducts;