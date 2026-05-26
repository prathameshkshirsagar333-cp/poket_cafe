"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "./context/CartContext";

import CartSidebar from "./components/CartSidebar";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
        <CartSidebar />
      </CartProvider>
    </SessionProvider>
  );
}
