"use client";

import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  FaShoppingBag,
  FaPlus,
  FaMinus,
  FaTrash,
  FaArrowRight,
  FaArrowLeft,
  FaTag,
  FaTruck,
  FaReceipt,
  FaGift,
  FaLock,
} from "react-icons/fa";

const PROMO_CODES: Record<string, number> = {
  CAFE10: 10,
  WELCOME20: 20,
  FIRST15: 15,
};

export default function CartPage() {
  const {
    cartItems,
    cartCount,
    cartTotal,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();
  const router = useRouter();

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState("");
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const discountPercent = appliedPromo ? PROMO_CODES[appliedPromo] : 0;
  const discountAmount = Math.round((cartTotal * discountPercent) / 100);
  const subtotalAfterDiscount = cartTotal - discountAmount;
  const tax = Math.round(subtotalAfterDiscount * 0.05);
  const deliveryFee =
    subtotalAfterDiscount >= 500 || cartTotal === 0
      ? 0
      : 50;
  const grandTotal = subtotalAfterDiscount + tax + deliveryFee;
  const freeDeliveryProgress = Math.min((cartTotal / 500) * 100, 100);

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setAppliedPromo(code);
      setPromoError("");
      setPromoCode("");
    } else {
      setPromoError("Invalid promo code. Try CAFE10, WELCOME20, or FIRST15.");
      setAppliedPromo(null);
    }
  };

  const handleRemove = async (id: number) => {
    setRemovingId(id);
    await new Promise((r) => setTimeout(r, 300));
    removeFromCart(id);
    setRemovingId(null);
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  if (!mounted) return null;

  return (
    <div
      style={{ backgroundColor: "#100B07", minHeight: "100vh" }}
      className="font-sans"
    >
      {/* ── Page Header ── */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #1A110C 0%, #2C1E16 50%, #1A110C 100%)",
          borderBottom: "1px solid rgba(197,160,89,0.15)",
        }}
        className="pt-28 pb-10 px-4"
      >
        <div className="max-w-7xl mx-auto">
          <Link
            href="/#menu"
            className="inline-flex items-center gap-2 text-white/50 hover:text-cafe-secondary transition-colors duration-200 text-sm font-semibold mb-6 group"
          >
            <FaArrowLeft
              size={12}
              className="group-hover:-translate-x-1 transition-transform duration-200"
            />
            Continue Shopping
          </Link>
          <div className="flex items-center gap-4">
            <div
              style={{ backgroundColor: "rgba(197,160,89,0.15)" }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
            >
              <FaShoppingBag style={{ color: "#C5A059" }} size={24} />
            </div>
            <div>
              <h1
                className="text-white font-black text-4xl md:text-5xl tracking-tight"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Your Cart
              </h1>
              <p className="text-white/40 text-sm mt-1 font-medium">
                {cartCount > 0
                  ? `${cartCount} item${cartCount !== 1 ? "s" : ""} ready for checkout`
                  : "Your cart is waiting to be filled"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {cartItems.length === 0 ? (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              style={{
                background:
                  "radial-gradient(circle, rgba(197,160,89,0.1) 0%, transparent 70%)",
              }}
              className="w-48 h-48 rounded-full flex items-center justify-center mb-8"
            >
              <div
                style={{ backgroundColor: "rgba(197,160,89,0.08)" }}
                className="w-32 h-32 rounded-full flex items-center justify-center"
              >
                <FaShoppingBag
                  style={{ color: "rgba(197,160,89,0.4)" }}
                  size={52}
                />
              </div>
            </div>
            <h2 className="text-white font-black text-3xl mb-3">
              Your cart is empty
            </h2>
            <p className="text-white/40 text-base max-w-sm mb-10 leading-relaxed">
              Looks like you haven&apos;t added anything yet. Browse our menu
              and discover something delicious!
            </p>
            <Link
              href="/#menu"
              style={{ backgroundColor: "#C5A059", color: "#1A110C" }}
              className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-base uppercase tracking-widest hover:brightness-110 hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl"
            >
              <FaShoppingBag size={16} />
              Browse Our Menu
            </Link>
          </div>
        ) : (
          /* ── Main Layout ── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ── Left: Cart Items ── */}
            <div className="lg:col-span-8 space-y-4">
              {/* Cart Items Header */}
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-white font-bold text-lg">
                  Order Items
                  <span
                    style={{
                      backgroundColor: "rgba(197,160,89,0.15)",
                      color: "#C5A059",
                    }}
                    className="ml-2 text-xs font-black px-2.5 py-1 rounded-full"
                  >
                    {cartCount}
                  </span>
                </h2>
                <button
                  onClick={() => clearCart()}
                  className="text-white/30 hover:text-red-400 text-xs font-semibold transition-colors duration-200 flex items-center gap-1.5"
                >
                  <FaTrash size={10} />
                  Clear All
                </button>
              </div>

              {/* Item Cards */}
              {cartItems.map((item, index) => (
                <div
                  key={item.productId}
                  style={{
                    backgroundColor:
                      removingId === item.productId
                        ? "rgba(255,60,60,0.05)"
                        : "rgba(255,255,255,0.04)",
                    border:
                      removingId === item.productId
                        ? "1px solid rgba(255,60,60,0.2)"
                        : "1px solid rgba(255,255,255,0.07)",
                    opacity: removingId === item.productId ? 0.5 : 1,
                    transform:
                      removingId === item.productId
                        ? "scale(0.98)"
                        : "scale(1)",
                    transition:
                      "all 0.3s ease, opacity 0.3s ease, transform 0.3s ease",
                    animationDelay: `${index * 60}ms`,
                  }}
                  className="rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row gap-4 group hover:border-cafe-secondary/20 animate-fade-in-up"
                >
                  {/* Product Image */}
                  <div className="relative w-full sm:w-28 h-40 sm:h-28 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/images/placeholder.jpg";
                      }}
                    />
                    {/* Category badge */}
                    <span
                      style={{
                        backgroundColor: "rgba(197,160,89,0.9)",
                        color: "#1A110C",
                      }}
                      className="absolute bottom-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide"
                    >
                      {item.category}
                    </span>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-white font-bold text-base md:text-lg leading-snug">
                          {item.name}
                        </h3>
                        <p
                          style={{ color: "#C5A059" }}
                          className="text-sm font-semibold mt-0.5"
                        >
                          ₹{item.price}{" "}
                          <span className="text-white/30 font-normal">
                            / item
                          </span>
                        </p>
                      </div>
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(item.productId)}
                        aria-label={`Remove ${item.name} from cart`}
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
                      {/* Quantity Stepper */}
                      <div
                        style={{
                          backgroundColor: "rgba(255,255,255,0.08)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                        className="flex items-center gap-0 rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                          className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all duration-150"
                        >
                          <FaMinus size={10} />
                        </button>
                        <span className="text-white font-black text-base min-w-[40px] text-center select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                          className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all duration-150"
                        >
                          <FaPlus size={10} />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-white/40 text-xs font-medium mb-0.5">
                          Item Total
                        </p>
                        <p
                          style={{ color: "#C5A059" }}
                          className="font-black text-xl"
                        >
                          ₹{item.price * item.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Free Delivery Progress Bar */}
              {cartTotal < 500 && (
                <div
                  style={{
                    backgroundColor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                  className="rounded-2xl p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <FaTruck style={{ color: "#C5A059" }} size={16} />
                    <p className="text-white/70 text-sm font-semibold">
                      Add{" "}
                      <span style={{ color: "#C5A059" }} className="font-black">
                        ₹{500 - cartTotal}
                      </span>{" "}
                      more for{" "}
                      <span className="text-white font-bold">
                        FREE Delivery
                      </span>
                    </p>
                  </div>
                  <div
                    style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                    className="h-2 rounded-full overflow-hidden"
                  >
                    <div
                      style={{
                        width: `${freeDeliveryProgress}%`,
                        backgroundColor: "#C5A059",
                        transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
                      }}
                      className="h-full rounded-full"
                    />
                  </div>
                </div>
              )}
              {cartTotal >= 500 && (
                <div
                  style={{
                    backgroundColor: "rgba(34,197,94,0.08)",
                    border: "1px solid rgba(34,197,94,0.2)",
                  }}
                  className="rounded-2xl p-4 flex items-center gap-3"
                >
                  <FaTruck
                    style={{ color: "rgb(74,222,128)" }}
                    size={16}
                  />
                  <p
                    style={{ color: "rgb(134,239,172)" }}
                    className="text-sm font-bold"
                  >
                    🎉 You qualify for Free Delivery!
                  </p>
                </div>
              )}

              {/* Continue Shopping — Mobile */}
              <div className="lg:hidden pt-2">
                <Link
                  href="/#menu"
                  style={{
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.6)",
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm hover:text-white hover:border-white/25 transition-all duration-200"
                >
                  <FaArrowLeft size={12} />
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* ── Right: Order Summary ── */}
            <div className="lg:col-span-4 lg:sticky lg:top-28">
              <div
                style={{
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                className="rounded-3xl overflow-hidden"
              >
                {/* Summary Header */}
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #2C1E16 0%, #1A110C 100%)",
                    borderBottom: "1px solid rgba(197,160,89,0.15)",
                  }}
                  className="px-6 py-5 flex items-center gap-3"
                >
                  <FaReceipt style={{ color: "#C5A059" }} size={16} />
                  <h2 className="text-white font-bold text-base tracking-wide">
                    Order Summary
                  </h2>
                </div>

                <div className="px-6 py-6 space-y-5">
                  {/* Promo Code */}
                  <div>
                    <label className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2 block flex items-center gap-2">
                      <FaGift size={10} style={{ color: "#C5A059" }} />
                      Promo Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value.toUpperCase());
                          setPromoError("");
                        }}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleApplyPromo()
                        }
                        placeholder="Enter code (e.g. CAFE10)"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.06)",
                          border: promoError
                            ? "1px solid rgba(239,68,68,0.5)"
                            : "1px solid rgba(255,255,255,0.1)",
                          color: "white",
                        }}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold placeholder:text-white/20 outline-none focus:border-cafe-secondary/50 transition-all duration-200"
                      />
                      <button
                        onClick={handleApplyPromo}
                        style={{ backgroundColor: "#C5A059", color: "#1A110C" }}
                        className="px-4 py-2.5 rounded-xl font-black text-sm hover:brightness-110 active:scale-95 transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <FaTag size={10} />
                        Apply
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-red-400 text-xs font-medium mt-1.5">
                        {promoError}
                      </p>
                    )}
                    {appliedPromo && (
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-green-400 text-xs font-bold flex items-center gap-1.5">
                          ✓ {appliedPromo} applied — {discountPercent}% off
                        </p>
                        <button
                          onClick={() => setAppliedPromo(null)}
                          className="text-white/30 hover:text-white/60 text-xs transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
                    }}
                    className="h-px"
                  />

                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/50 text-sm font-medium">
                        Subtotal ({cartCount} items)
                      </span>
                      <span className="text-white font-semibold text-sm">
                        ₹{cartTotal}
                      </span>
                    </div>

                    {appliedPromo && (
                      <div className="flex justify-between items-center">
                        <span className="text-green-400/80 text-sm font-medium flex items-center gap-1.5">
                          <FaTag size={10} />
                          Discount ({discountPercent}%)
                        </span>
                        <span className="text-green-400 font-bold text-sm">
                          − ₹{discountAmount}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-white/50 text-sm font-medium">
                        Tax (5% GST)
                      </span>
                      <span className="text-white font-semibold text-sm">
                        ₹{tax}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-white/50 text-sm font-medium flex items-center gap-1.5">
                        <FaTruck size={10} />
                        Delivery
                      </span>
                      {deliveryFee === 0 ? (
                        <span className="text-green-400 font-bold text-sm">
                          FREE
                        </span>
                      ) : (
                        <span className="text-white font-semibold text-sm">
                          ₹{deliveryFee}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(197,160,89,0.3), transparent)",
                    }}
                    className="h-px"
                  />

                  {/* Grand Total */}
                  <div className="flex justify-between items-center">
                    <span className="text-white font-black text-lg">
                      Total
                    </span>
                    <div className="text-right">
                      <p
                        style={{ color: "#C5A059" }}
                        className="font-black text-2xl leading-none"
                      >
                        ₹{grandTotal}
                      </p>
                      {appliedPromo && (
                        <p className="text-green-400 text-[11px] font-semibold mt-0.5">
                          You save ₹{discountAmount}!
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <button
                    id="cart-page-checkout-btn"
                    onClick={handleCheckout}
                    style={{ backgroundColor: "#C5A059", color: "#1A110C" }}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-base uppercase tracking-widest hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-xl mt-2"
                  >
                    <FaLock size={13} />
                    Proceed to Checkout
                    <FaArrowRight size={13} />
                  </button>

                  {/* Trust Badges */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {[
                      { icon: "🔒", label: "Secure Payment" },
                      { icon: "↩️", label: "Easy Returns" },
                      { icon: "⭐", label: "Premium Quality" },
                    ].map((badge) => (
                      <div
                        key={badge.label}
                        style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                        className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl"
                      >
                        <span className="text-base">{badge.icon}</span>
                        <span className="text-white/30 text-[10px] font-semibold text-center leading-tight">
                          {badge.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Continue Shopping — Desktop */}
              <div className="hidden lg:block mt-4">
                <Link
                  href="/#menu"
                  style={{
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.45)",
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm hover:text-white hover:border-white/20 transition-all duration-200"
                >
                  <FaArrowLeft size={11} />
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
