"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useSession } from "next-auth/react";

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  priceDisplay: string;
  image: string;
  category: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  isLoading: boolean;
  addedItemId: number | null;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (item: Omit<CartItem, "quantity">) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [addedItemId, setAddedItemId] = useState<number | null>(null);
  const hasFetched = useRef(false);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Fetch cart from backend
  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCartItems(data.items || []);
      }
    } catch (err) {
      console.error("Failed to fetch cart", err);
    }
  }, []);

  // Fetch cart once session is resolved
  useEffect(() => {
    if (status !== "loading" && !hasFetched.current) {
      hasFetched.current = true;
      fetchCart();
    }
  }, [status, fetchCart]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const addToCart = useCallback(
    async (item: Omit<CartItem, "quantity">) => {
      // Optimistic update
      setCartItems((prev) => {
        const existing = prev.find((i) => i.productId === item.productId);
        if (existing) {
          return prev.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
        }
        return [...prev, { ...item, quantity: 1 }];
      });

      // Flash animation indicator
      setAddedItemId(item.productId);
      setTimeout(() => setAddedItemId(null), 1200);

      try {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...item, quantity: 1 }),
        });
      } catch (err) {
        console.error("Add to cart failed", err);
        fetchCart(); // Re-sync on error
      }
    },
    [fetchCart]
  );

  const removeFromCart = useCallback(
    async (productId: number) => {
      setCartItems((prev) => prev.filter((i) => i.productId !== productId));
      try {
        await fetch(`/api/cart?productId=${productId}`, { method: "DELETE" });
      } catch (err) {
        console.error("Remove failed", err);
        fetchCart();
      }
    },
    [fetchCart]
  );

  const updateQuantity = useCallback(
    async (productId: number, quantity: number) => {
      if (quantity <= 0) {
        return removeFromCart(productId);
      }
      setCartItems((prev) =>
        prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
      );
      try {
        await fetch("/api/cart", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity }),
        });
      } catch (err) {
        console.error("Update qty failed", err);
        fetchCart();
      }
    },
    [removeFromCart, fetchCart]
  );

  const clearCart = useCallback(async () => {
    setCartItems([]);
    try {
      await fetch("/api/cart?clear=true", { method: "DELETE" });
    } catch (err) {
      console.error("Clear cart failed", err);
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        isCartOpen,
        isLoading,
        addedItemId,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
