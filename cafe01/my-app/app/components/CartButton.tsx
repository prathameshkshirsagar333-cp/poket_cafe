"use client";

import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";
import { FaShoppingBag } from "react-icons/fa";

export default function CartButton() {
  const { cartCount, openCart, addedItemId } = useCart();
  const router = useRouter();
  const isAnimating = addedItemId !== null;

  const handleClick = () => {
    // On mobile / small screens, navigate to full cart page; on desktop open sidebar
    if (window.innerWidth < 1024) {
      router.push("/cart");
    } else {
      openCart();
    }
  };

  return (
    <button
      id="cart-button"
      onClick={handleClick}
      aria-label={`Open cart, ${cartCount} items`}
      className="relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-cafe-secondary group"
    >
      <FaShoppingBag
        size={20}
        className={`text-white transition-transform duration-300 ${
          isAnimating ? "scale-125" : "scale-100"
        }`}
      />

      {cartCount > 0 && (
        <span
          key={cartCount}
          className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-cafe-secondary text-[#1A110C] text-[10px] font-black flex items-center justify-center shadow-lg transition-all duration-300 ${
            isAnimating ? "scale-125 bg-green-400" : "scale-100"
          }`}
        >
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      )}

      {isAnimating && (
        <span className="absolute inset-0 rounded-full animate-ping bg-cafe-secondary/40 pointer-events-none" />
      )}
    </button>
  );
}
