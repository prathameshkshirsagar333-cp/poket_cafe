import type { Metadata } from "next";
import CheckoutModal from "@/app/components/CheckoutModal";

export const metadata: Metadata = {
  title: "Checkout – Cafe",
  description: "Complete your order securely",
};

export default function CheckoutPage() {
  return <CheckoutModal />;
}
