import { Link } from "react-router-dom";

function Categories() {
  // Aapke categories ki list (Images ke sath)
  const collections = [
    { name: "MALA", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=300&auto=format&fit=crop" },
    { name: "BANGLES", image: "https://images.unsplash.com/photo-1611591475716-f3b1456d56be?q=80&w=300&auto=format&fit=crop" },
    { name: "EARRINGS", image: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=300&auto=format&fit=crop" },
    { name: "NECKLACE", image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=300&auto=format&fit=crop" },
    { name: "LOCKET", image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=300&auto=format&fit=crop" },
    { name: "MATHA PATTI", image: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=300&auto=format&fit=crop" },
    { name: "BRIDAL JEWELRY", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=300&auto=format&fit=crop" },
    { name: "PERFUMES", image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=300&auto=format&fit=crop" }
  ];

  return (
    <section className="py-16 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-widest uppercase text-black">
            Our Collections
          </h2>
          <div className="w-16 h-0.5 bg-black mx-auto mt-3"></div>
        </div>

        {/* Circular Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6 justify-items-center">
          {collections.map((item, index) => (
            <Link 
              to="/shop" 
              key={index} 
              className="group flex flex-col items-center cursor-pointer"
            >
              {/* Circular Image Container with Golden/Dark Border */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-amber-600/60 p-1 shadow-md group-hover:border-black group-hover:scale-105 transition-all duration-300">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition duration-500"
                />
              </div>
              {/* Category Name */}
              <span className="mt-3 text-[11px] sm:text-xs font-semibold tracking-wider text-gray-800 text-center uppercase group-hover:text-amber-700 transition">
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Categories;