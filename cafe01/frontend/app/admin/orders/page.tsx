"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { FaArrowLeft } from "react-icons/fa";

type Order = {
  _id: string;
  orderNumber: string;
  guestName: string | null;
  guestEmail: string | null;
  address: any;
  items: any[];
  total: number;
  status: string;
  createdAt: string;
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status } : o))
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const filteredOrders =
    filter === "All"
      ? orders
      : orders.filter((o) => o.status.toLowerCase() === filter.toLowerCase());

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cafe-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFBF8]">
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-[#FCFBF8] pointer-events-none" />
        
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
            Admin Panel
          </h1>
          <p className="text-white/60 text-xs sm:text-sm mt-1 font-semibold">
            Manage all Poket Cafe orders
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8 mt-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-500 text-sm mt-1">Filter and update customer orders</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All", "Pending", "Paid", "Processing", "Completed", "Cancelled"].map(
              (f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    filter === f
                      ? "bg-cafe-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {f}
                </button>
              )
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs tracking-wider">
                <th className="p-4 font-bold">Order Details</th>
                <th className="p-4 font-bold">Customer</th>
                <th className="p-4 font-bold">Items</th>
                <th className="p-4 font-bold">Total</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No orders found matching this status.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={order._id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-mono font-bold text-gray-900">
                        {order.orderNumber}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-800">
                        {order.address?.name || order.guestName || "Guest"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {order.address?.phone || "No phone"}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-700">
                        {order.items.length} items
                      </div>
                      <div className="text-xs text-gray-500 mt-1 max-w-[200px] truncate">
                        {order.items.map((i) => i.name).join(", ")}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-cafe-primary">
                      ₹{order.total}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full ${
                          order.status === "processing"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "preparing"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "delivered" || order.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-cafe-primary focus:border-cafe-primary block w-full p-2"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
