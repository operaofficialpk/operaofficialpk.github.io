import { useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";

function Cart() {
  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    totalPrice
  } = useContext(CartContext);

  return (
    <section className="min-h-screen bg-gray-50 py-16 px-6">
      <h1 className="text-5xl font-bold text-center mb-14">
        Your Cart
      </h1>

      <div className="max-w-6xl mx-auto">
        {cart.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl shadow-md p-8">
            <p className="text-2xl text-gray-500 font-medium mb-6">
              Your cart is currently empty.
            </p>
            <Link
              to="/shop"
              className="inline-block bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl p-8">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex flex-col md:flex-row justify-between items-center border-b py-8 gap-5"
              >
                <div className="flex items-center gap-6">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-28 h-28 object-cover rounded-2xl border"
                  />

                  <div>
                    <h2 className="text-2xl font-bold">
                      {item.name}
                    </h2>

                    <p className="text-gray-600 mt-1 font-semibold">
                      Rs. {item.price}
                    </p>

                    <div className="flex items-center gap-4 mt-4">
                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        disabled={item.quantity <= 1}
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg transition ${
                          item.quantity <= 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gray-200 hover:bg-gray-300 text-black cursor-pointer"
                        }`}
                      >
                        -
                      </button>

                      <span className="font-bold text-lg min-w-[20px] text-center">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => increaseQuantity(item.id)}
                        className="bg-black text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg hover:bg-gray-800 transition cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-center md:text-right">
                  <p className="font-bold text-2xl text-gray-900">
                    Rs. {Number(item.price) * item.quantity}
                  </p>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-600 font-semibold mt-3 hover:text-red-800 transition cursor-pointer"
                  >
                    Remove Item
                  </button>
                </div>
              </div>
            ))}

            <div className="text-center md:text-right mt-10 pt-6 border-t">
              <h2 className="text-3xl font-bold">
                Total: <span className="text-black">Rs. {totalPrice}</span>
              </h2>

              <div className="mt-8 flex flex-wrap justify-center md:justify-end gap-4">
                <Link
                  to="/shop"
                  className="inline-block bg-gray-200 text-black px-8 py-4 rounded-full font-semibold hover:bg-gray-300 transition"
                >
                  Add More Items
                </Link>

                <Link
                  to="/checkout"
                  className="inline-block bg-black text-white px-12 py-4 rounded-full font-semibold hover:bg-gray-800 transition shadow-lg"
                >
                  Proceed To Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Cart;