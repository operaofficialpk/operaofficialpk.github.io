import { Link } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";
// Apne banner ki image ko assets folder mein 'banner.jpg' ke naam se save karein
import bannerImg from "../assets/banner.jpg";

function Home() {
  const { products, addToCart } = useContext(CartContext);

  return (
    <div className="bg-white min-h-screen">
      {/* 1. Main Luxury Hero Banner Section */}
      <section className="w-full bg-black">
        <div className="max-w-7xl mx-auto">
          <img 
            src={bannerImg} 
            alt="Opera Official PK - Luxury Jewellery & Perfumes" 
            className="w-full h-auto object-cover max-h-[550px] shadow-2xl"
          />
        </div>
      </section>

      {/* 2. Brand Highlights / Features Bar */}
      <section className="bg-black text-white py-6 px-4 border-t border-gray-900">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-xs tracking-widest uppercase">
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg">💎</span>
            <span className="font-semibold">Premium Quality</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg">🛡️</span>
            <span className="font-semibold">Trusted Service</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg">📦</span>
            <span className="font-semibold">Secure Packaging</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg">🚚</span>
            <span className="font-semibold">All Pakistan Delivery</span>
          </div>
        </div>
      </section>

      {/* 3. Featured Collections / Shop Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-widest uppercase text-black">
            Our Collections
          </h2>
          <p className="text-gray-500 text-xs md:text-sm mt-2 tracking-wider">
            Elegance You Deserve • Handcrafted Jewellery & Signature Perfumes
          </p>
          <div className="w-16 h-0.5 bg-black mx-auto mt-4"></div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products && products.length > 0 ? (
            products.slice(0, 8).map((product) => (
              <div key={product.id} className="group flex flex-col bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                <Link to={`/product/${product.id}`} className="overflow-hidden bg-gray-50 aspect-square">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </Link>
                <div className="p-4 flex flex-col flex-grow justify-between text-center">
                  <div>
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm font-bold text-black mt-1">
                      Rs. {product.price?.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    className="mt-4 w-full bg-black text-white py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-gray-800 transition rounded"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500 text-sm">
              No products found. Add products from the Admin Portal.
            </div>
          )}
        </div>

        {/* View All Collection Button */}
        <div className="text-center mt-12">
          <Link 
            to="/shop" 
            className="inline-block border border-black text-black px-8 py-3 text-xs font-semibold tracking-widest uppercase hover:bg-black hover:text-white transition duration-300"
          >
            View All Jewellery
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;