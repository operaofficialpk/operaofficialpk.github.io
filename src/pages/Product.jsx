import { useParams } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

function Product() {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSingleProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSingleProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-20 font-semibold text-xl text-gray-600">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold">Product Not Found</h1>
        <p className="text-gray-500 mt-2">The requested product does not exist.</p>
      </div>
    );
  }

  const whatsappMessage = `Hi Opera Official, I want to order this product:\nName: ${product.name}\nPrice: Rs. ${product.price}\nImage: ${product.image}`;

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Image */}
        <div>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-[500px] object-cover rounded-3xl shadow-md"
          />
        </div>

        {/* Details */}
        <div>
          <p className="text-gray-500 font-medium uppercase tracking-wide">
            {product.category}
          </p>

          <h1 className="text-4xl font-bold mt-2">
            {product.name}
          </h1>

          <p className="text-3xl font-bold text-gray-900 mt-4">
            Rs. {product.price}
          </p>

          {product.description && (
            <p className="text-gray-600 mt-6 leading-relaxed">
              {product.description}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={() => addToCart(product)}
              className="bg-black text-white px-10 py-4 rounded-full cursor-pointer hover:bg-gray-800 transition font-semibold"
            >
              Add To Cart
            </button>

            <a
              href={`https://wa.me/923173355420?text=${encodeURIComponent(whatsappMessage)}`}
              target="_blank"
              rel="noreferrer"
              className="bg-green-600 text-white px-10 py-4 rounded-full cursor-pointer hover:bg-green-700 transition font-semibold flex items-center justify-center"
            >
              Order On WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Product;