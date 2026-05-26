"use client";

import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaTimes,
  FaPlus,
  FaMinus,
  FaTrash,
  FaShoppingBag,
  FaArrowRight,
  FaExternalLinkAlt,
} from "react-icons/fa";
import Image from "next/image";

export default function CartSidebar() {
  const {
    cartItems,
    cartCount,
    cartTotal,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
  } = useCart();
  const router = useRouter();

  const tax = Math.round(cartTotal * 0.05);
  const deliveryNote =
    cartTotal >= 500 ? "Free delivery!" : `₹${500 - cartTotal} away from free delivery`;
  const deliveryFee = cartTotal >= 500 || cartTotal === 0 ? 0 : 50;
  const grandTotal = cartTotal + tax + deliveryFee;

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] transition-opacity duration-400 ${
          isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Sidebar Drawer */}
      <aside
        id="cart-sidebar"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        style={{ backgroundColor: "#1A110C" }}
        className={`fixed top-0 right-0 h-full w-full max-w-[420px] z-[90] flex flex-col shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.87,0,0.13,1)] ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10" style={{ backgroundColor: "#1A110C" }}>
          <div className="flex items-center gap-3">
            <FaShoppingBag className="text-cafe-secondary" size={18} />
            <h2 className="text-white font-bold text-lg tracking-wide">
              Your Cart
            </h2>
            {cartCount > 0 && (
              <span 
                className="bg-cafe-secondary text-xs font-black px-2 py-0.5 rounded-full"
                style={{ color: "#1A110C" }}
              >
                {cartCount}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-200"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto py-4 px-6 space-y-4 scrollbar-thin" style={{ backgroundColor: "#1A110C" }}>
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
                <FaShoppingBag size={40} className="text-white/20" />
              </div>
              <div>
                <p className="text-white/70 font-semibold text-lg">
                  Your cart is empty
                </p>
                <p className="text-white/40 text-sm mt-1">
                  Browse our menu and add something delicious!
                </p>
              </div>
              <button
                onClick={closeCart}
                className="mt-2 px-6 py-2.5 bg-cafe-secondary rounded-full font-bold text-sm hover:scale-105 transition-transform"
                style={{ color: "#1A110C" }}
              >
                Explore Menu
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 bg-white/5 rounded-2xl p-3 group hover:bg-white/8 transition-colors border border-white/5"
              >
                {/* Image */}
                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white/10">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2">
                      {item.name}
                    </h3>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      aria-label={`Remove ${item.name}`}
                      className="text-white/30 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>

                  <p className="text-cafe-secondary text-xs mt-0.5 font-medium">
                    {item.category}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-2 bg-white/10 rounded-full px-1 py-0.5">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        aria-label="Decrease quantity"
                        className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 text-white transition-colors"
                      >
                        <FaMinus size={9} />
                      </button>
                      <span className="text-white font-bold text-sm min-w-[16px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        aria-label="Increase quantity"
                        className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 text-white transition-colors"
                      >
                        <FaPlus size={9} />
                      </button>
                    </div>

                    {/* Item Total */}
                    <span className="text-cafe-secondary font-bold text-sm">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* View Full Cart Link */}
        {cartItems.length > 0 && (
          <div className="px-6 pb-2" style={{ backgroundColor: "#1A110C" }}>
            <Link
              href="/cart"
              onClick={closeCart}
              style={{
                border: "1px solid rgba(197,160,89,0.25)",
                color: "rgba(197,160,89,0.8)",
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs hover:text-cafe-secondary hover:border-cafe-secondary/50 transition-all duration-200"
            >
              <FaExternalLinkAlt size={9} />
              View Full Cart Page
            </Link>
          </div>
        )}

        {/* Footer / Summary */}
        {cartItems.length > 0 && (
          <div className="border-t border-white/10 px-6 py-5 space-y-3" style={{ backgroundColor: "#1A110C" }}>
            {/* Delivery Progress */}
            <div className="bg-white/5 rounded-xl px-4 py-3">
              <p className="text-white/60 text-xs font-medium">{deliveryNote}</p>
              {cartTotal < 500 && (
                <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cafe-secondary rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((cartTotal / 500) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-white/60 text-sm">
                <span>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              <div className="flex justify-between text-white/60 text-sm">
                <span>Tax (5%)</span>
                <span>₹{tax}</span>
              </div>
              <div className="flex justify-between text-white/60 text-sm">
                <span>Delivery</span>
                <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between text-white font-bold text-base pt-2 border-t border-white/10">
                <span>Total</span>
                <span className="text-cafe-secondary">₹{grandTotal}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              id="checkout-btn"
              onClick={handleCheckout}
              style={{ color: "#1A110C" }}
              className="w-full flex items-center justify-center gap-2 py-4 bg-cafe-secondary rounded-2xl font-black text-base uppercase tracking-wide hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-cafe-secondary/20"
            >
              Proceed to Checkout
              <FaArrowRight size={14} />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
