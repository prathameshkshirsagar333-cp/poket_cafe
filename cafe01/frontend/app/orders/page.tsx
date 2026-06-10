"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FaReceipt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaTruck,
  FaArrowLeft,
  FaShoppingBag,
} from "react-icons/fa";

interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  status: string;
  paymentMethod: string;
  address: {
    name: string;
    phone: string;
    orderType: string;
    tableNumber?: string;
    city?: string;
  };
  createdAt: string;
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ReactNode; bg: string }
> = {
  pending: {
    label: "Pending",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    icon: <FaClock size={12} />,
  },
  paid: {
    label: "Paid",
    color: "text-green-400",
    bg: "bg-green-400/10",
    icon: <FaCheckCircle size={12} />,
  },
  processing: {
    label: "Preparing",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    icon: <FaClock size={12} />,
  },
  completed: {
    label: "Completed",
    color: "text-green-400",
    bg: "bg-green-400/10",
    icon: <FaCheckCircle size={12} />,
  },
  failed: {
    label: "Failed",
    color: "text-red-400",
    bg: "bg-red-400/10",
    icon: <FaTimesCircle size={12} />,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-400",
    bg: "bg-red-400/10",
    icon: <FaTimesCircle size={12} />,
  },
  delivered: {
    label: "Delivered",
    color: "text-green-400",
    bg: "bg-green-400/10",
    icon: <FaTruck size={12} />,
  },
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/orders");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/orders")
        .then((r) => r.json())
        .then((data) => setOrders(data.orders || []))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [status]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-[#1A110C] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-cafe-secondary/30 border-t-cafe-secondary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A110C]">
      {/* ── Page Header ── */}
      <div
        className="relative w-full h-[35vh] min-h-[260px] flex items-center justify-center overflow-hidden bg-black pt-[80px] border-b border-white/5"
      >
        <div className="absolute inset-0">
          <Image
            src="/poket_cafe_hero_4k.png"
            alt="Poket Cafe"
            fill
            unoptimized
            className="object-cover object-top brightness-[0.5] contrast-125 saturate-110"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-[#1A110C] pointer-events-none" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <Link
            href="/"
            className="absolute top-4 left-4 sm:left-8 inline-flex items-center gap-2 text-white/70 hover:text-cafe-secondary transition-colors duration-200 text-xs font-bold uppercase tracking-wider bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/10 group"
          >
            <FaArrowLeft
              size={10}
              className="group-hover:-translate-x-1 transition-transform duration-200"
            />
            Home
          </Link>

          <h2 
            className="text-white font-black text-3xl sm:text-4xl md:text-5xl tracking-widest uppercase filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Poket Cafe
          </h2>
          <div className="h-[2px] w-20 bg-cafe-secondary my-3 rounded-full" />
          <h1 className="text-cafe-secondary font-black text-xl sm:text-2xl uppercase tracking-wider">
            My Orders
          </h1>
          <p className="text-white/60 text-xs sm:text-sm mt-1 font-semibold">
            {orders.length} order{orders.length !== 1 ? "s" : ""} placed
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto">
              <FaShoppingBag size={36} className="text-white/20" />
            </div>
            <h2 className="text-white font-bold text-xl">No orders yet</h2>
            <p className="text-white/50 text-sm">
              Looks like you haven't placed any orders.
            </p>
            <Link
              href="/#menu"
              className="inline-block mt-4 px-6 py-3 bg-cafe-secondary text-[#1A110C] rounded-full font-bold text-sm hover:brightness-110 transition-all"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          orders.map((order) => {
            const cfg = statusConfig[order.status] || statusConfig.pending;
            const isExpanded = expandedOrder === order._id;
            const date = new Date(order.createdAt);

            return (
              <div
                key={order._id}
                className="bg-[#2C1E16] rounded-2xl overflow-hidden border border-white/5 transition-all"
              >
                {/* Order Header */}
                <button
                  id={`order-${order._id}`}
                  onClick={() =>
                    setExpandedOrder(isExpanded ? null : order._id)
                  }
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                      <FaReceipt className="text-cafe-secondary" size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-bold text-sm font-mono">
                        {order.orderNumber}
                      </p>
                      <p className="text-white/40 text-xs mt-0.5">
                        {date.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.color} ${cfg.bg}`}
                    >
                      {cfg.icon}
                      {cfg.label}
                    </div>
                    <span className="text-cafe-secondary font-bold">
                      ₹{order.total}
                    </span>
                    <span
                      className={`text-white/30 transition-transform duration-300 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    >
                      ▾
                    </span>
                  </div>
                </button>

                {/* Expandable Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-4">
                    {/* Items */}
                    <div className="space-y-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">
                              {item.name}
                            </p>
                            <p className="text-white/40 text-xs">
                              ×{item.quantity}
                            </p>
                          </div>
                          <span className="text-cafe-secondary text-sm font-bold">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Summary */}
                    <div className="bg-white/5 rounded-xl px-4 py-3 space-y-1.5">
                      <div className="flex justify-between text-white/50 text-xs">
                        <span>Subtotal</span>
                        <span>₹{order.subtotal}</span>
                      </div>
                      <div className="flex justify-between text-white/50 text-xs">
                        <span>Tax (5%)</span>
                        <span>₹{order.tax}</span>
                      </div>
                      <div className="flex justify-between text-white/50 text-xs">
                        <span>Delivery</span>
                        <span>
                          {order.deliveryFee === 0
                            ? "Free"
                            : `₹${order.deliveryFee}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-white/10">
                        <span>Total</span>
                        <span className="text-cafe-secondary">
                          ₹{order.total}
                        </span>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-3 text-xs">
                      <div className="bg-white/5 rounded-lg px-3 py-1.5 text-white/50">
                        <span className="text-white/30">Payment: </span>
                        <span className="text-white capitalize font-medium">
                          {order.paymentMethod === "cod"
                            ? "Cash on Delivery"
                            : order.paymentMethod.toUpperCase()}
                        </span>
                      </div>
                      <div className="bg-white/5 rounded-lg px-3 py-1.5 text-white/50">
                        <span className="text-white/30">Type: </span>
                        <span className="text-white capitalize font-medium">
                          {order.address?.orderType?.replace("-", " ") || "N/A"}
                          {order.address?.tableNumber
                            ? ` (${order.address.tableNumber})`
                            : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
