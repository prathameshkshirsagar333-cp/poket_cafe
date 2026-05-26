"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { useForm } from "react-hook-form";
import { useCart } from "@/app/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaCreditCard,
  FaMobile,
  FaUniversity,
  FaMotorcycle,
  FaLock,
  FaReceipt,
  FaChevronRight,
} from "react-icons/fa";

type PaymentMethod = "upi" | "card" | "netbanking" | "cod";
type OrderType = "dine-in" | "takeaway" | "delivery";
type Step = "details" | "payment" | "processing" | "success";

interface AddressForm {
  name: string;
  phone: string;
  email: string;
  orderType: OrderType;
  tableNumber: string;
  street: string;
  city: string;
  pincode: string;
}

interface PaymentForm {
  upiId: string;
  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCvv: string;
  bank: string;
}

const BANKS = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
  "IndusInd Bank",
];

export default function CheckoutModal() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  const [step, setStep] = useState<Step>("details");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<{
    orderNumber: string;
    total: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tax = Math.round(cartTotal * 0.05);
  const deliveryFee = cartTotal >= 500 || cartTotal === 0 ? 0 : 50;
  const grandTotal = cartTotal + tax + deliveryFee;

  const {
    register: registerAddr,
    handleSubmit: handleAddrSubmit,
    watch: watchAddr,
    formState: { errors: addrErrors },
  } = useForm<AddressForm>({
    defaultValues: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      orderType: "dine-in",
    },
  });

  const {
    register: registerPay,
    handleSubmit: handlePaySubmit,
    watch: watchPay,
    formState: { errors: payErrors },
  } = useForm<PaymentForm>();

  const orderType = watchAddr("orderType");
  const [addressData, setAddressData] = useState<AddressForm | null>(null);

  const onAddressSubmit = (data: AddressForm) => {
    setAddressData(data);
    setStep("payment");
  };

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  };

  const onPaymentSubmit = async (payData: PaymentForm) => {
    if (!addressData) return;
    setIsSubmitting(true);
    setStep("processing");
    setError(null);

    // Simulate payment processing delay
    await new Promise((r) => setTimeout(r, 2200));

    try {
      const payload = {
        items: cartItems,
        subtotal: cartTotal,
        tax,
        deliveryFee,
        total: grandTotal,
        paymentMethod,
        paymentId: paymentMethod !== "cod" ? `DEMO_${Date.now()}` : null,
        upiId: null, // No longer collecting upiId locally
        address: {
          name: addressData.name,
          phone: addressData.phone,
          street: addressData.street || "",
          city: addressData.city || "",
          pincode: addressData.pincode || "",
          orderType: addressData.orderType,
          tableNumber: addressData.tableNumber || "",
        },
        guestEmail: session ? null : addressData.email,
        guestName: session ? null : addressData.name,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Order failed");
      }

      if (paymentMethod !== "cod" && data.razorpayOrderId) {
        // Open Razorpay Checkout
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_1DP5mmOlF5G5ag",
          amount: Math.round(grandTotal * 100),
          currency: "INR",
          name: "Cafe Express",
          description: "Order Checkout",
          order_id: data.razorpayOrderId,
          handler: async function (response: any) {
            // Payment Success
            setOrderResult({
              orderNumber: data.order.orderNumber,
              total: data.order.total,
            });
            await clearCart();
            setStep("success");
          },
          prefill: {
            name: session?.user?.name || addressData.name,
            email: session?.user?.email || addressData.email,
            contact: addressData.phone,
            method: paymentMethod === "upi" ? "upi" : undefined, // hint to open UPI
          },
          theme: {
            color: "#C5A059",
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          setError(response.error.description || "Payment failed. Please try again.");
          setStep("payment");
        });
        rzp.open();
      } else {
        // COD Success
        setOrderResult({
          orderNumber: data.order.orderNumber,
          total: data.order.total,
        });
        await clearCart();
        setStep("success");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setStep("payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentMethods: {
    id: PaymentMethod;
    label: string;
    icon: React.ReactNode;
    desc: string;
  }[] = [
    {
      id: "upi",
      label: "UPI",
      icon: <FaMobile size={18} />,
      desc: "Pay using any UPI app",
    },
    {
      id: "card",
      label: "Debit / Credit Card",
      icon: <FaCreditCard size={18} />,
      desc: "Visa, Mastercard, RuPay",
    },
    {
      id: "netbanking",
      label: "Net Banking",
      icon: <FaUniversity size={18} />,
      desc: "All major banks supported",
    },
    {
      id: "cod",
      label: "Cash on Delivery",
      icon: <FaMotorcycle size={18} />,
      desc: "Pay when you receive",
    },
  ];

  // ─────────────────────────────────────────────
  // ORDER SUMMARY SIDEBAR
  // ─────────────────────────────────────────────
  const OrderSummary = () => (
    <div className="bg-[#2C1E16] rounded-2xl p-6 space-y-4 sticky top-8">
      <h3 className="text-white font-bold text-base flex items-center gap-2">
        <FaReceipt className="text-cafe-secondary" /> Order Summary
      </h3>
      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {cartItems.map((item) => (
          <div key={item.productId} className="flex gap-3 items-center">
            <img
              src={item.image}
              alt={item.name}
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium line-clamp-1">
                {item.name}
              </p>
              <p className="text-white/50 text-xs">×{item.quantity}</p>
            </div>
            <span className="text-cafe-secondary text-xs font-bold">
              ₹{item.price * item.quantity}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 pt-3 space-y-1.5">
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
          <span className="text-cafe-secondary text-lg">₹{grandTotal}</span>
        </div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────
  // PROCESSING SCREEN
  // ─────────────────────────────────────────────
  if (step === "processing") {
    return (
      <div className="min-h-screen bg-[#1A110C] flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 rounded-full border-4 border-cafe-secondary/30 border-t-cafe-secondary animate-spin mx-auto" />
          <div>
            <p className="text-white font-bold text-xl">Processing Payment</p>
            <p className="text-white/50 text-sm mt-1">
              Please wait, do not close this window...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // SUCCESS SCREEN
  // ─────────────────────────────────────────────
  if (step === "success" && orderResult) {
    return (
      <div className="min-h-screen bg-[#1A110C] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
              <FaCheckCircle size={56} className="text-green-400" />
            </div>
            {/* Ripple rings */}
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-28 h-28 rounded-full bg-green-500/20 animate-ping" />
            </span>
          </div>

          <div>
            <h1 className="text-white font-bold text-3xl">Order Placed! 🎉</h1>
            <p className="text-white/60 text-sm mt-2">
              Thank you for your order. We're preparing it now!
            </p>
          </div>

          <div className="bg-[#2C1E16] rounded-2xl p-6 text-left space-y-3">
            <div className="flex justify-between">
              <span className="text-white/60 text-sm">Order Number</span>
              <span className="text-cafe-secondary font-bold text-sm font-mono">
                {orderResult.orderNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60 text-sm">Amount Paid</span>
              <span className="text-white font-bold">₹{orderResult.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60 text-sm">Payment Method</span>
              <span className="text-white font-medium capitalize">
                {paymentMethod === "cod"
                  ? "Cash on Delivery"
                  : paymentMethod.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60 text-sm">Status</span>
              <span className="text-green-400 font-bold text-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                {paymentMethod === "cod" ? "Confirmed" : "Paid"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            {session && (
              <button
                onClick={() => router.push("/orders")}
                className="w-full py-3.5 bg-cafe-secondary text-[#1A110C] rounded-2xl font-bold hover:brightness-110 transition-all"
              >
                View My Orders
              </button>
            )}
            <button
              onClick={() => router.push("/")}
              className="w-full py-3.5 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // MAIN CHECKOUT LAYOUT
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#1A110C]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#1A110C]/95 backdrop-blur-xl border-b border-white/10 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => (step === "payment" ? setStep("details") : router.back())}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium"
          >
            <FaArrowLeft size={14} />
            {step === "payment" ? "Back to Details" : "Back to Cart"}
          </button>
          <h1 className="text-white font-bold text-lg">Checkout</h1>
          <div className="flex items-center gap-2 text-white/40 text-xs font-medium">
            <FaLock size={10} />
            Secure
          </div>
        </div>

        {/* Step Progress */}
        <div className="max-w-5xl mx-auto mt-4 flex items-center gap-2">
          {(["details", "payment"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s
                    ? "bg-cafe-secondary text-[#1A110C]"
                    : i < (step === "payment" ? 1 : 0)
                    ? "bg-green-500 text-white"
                    : "bg-white/10 text-white/40"
                }`}
              >
                {i < (step === "payment" ? 1 : 0) ? "✓" : i + 1}
              </div>
              <span
                className={`text-xs font-medium capitalize hidden sm:block ${
                  step === s ? "text-white" : "text-white/40"
                }`}
              >
                {s === "details" ? "Order Details" : "Payment"}
              </span>
              {i < 1 && <div className="flex-1 h-px bg-white/10 mx-1" />}
            </div>
          ))}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        {/* ── STEP 1: ORDER DETAILS ── */}
        {step === "details" && (
          <form
            onSubmit={handleAddrSubmit(onAddressSubmit)}
            className="space-y-6"
          >
            <div className="bg-[#2C1E16] rounded-2xl p-6 space-y-5">
              <h2 className="text-white font-bold text-lg">Contact Details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-xs font-semibold mb-1 block uppercase tracking-wider">
                    Full Name *
                  </label>
                  <input
                    {...registerAddr("name", { required: "Name is required" })}
                    placeholder="Your full name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-cafe-secondary transition-colors"
                  />
                  {addrErrors.name && (
                    <p className="text-red-400 text-xs mt-1">
                      {addrErrors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-white/60 text-xs font-semibold mb-1 block uppercase tracking-wider">
                    Phone Number *
                  </label>
                  <input
                    {...registerAddr("phone", {
                      required: "Phone is required",
                      pattern: {
                        value: /^(?:\+?91|91)?\d{10}$/,
                        message: "Enter valid 10-digit number (e.g., 91XXXXXXXXXX)",
                      },
                    })}
                    placeholder="91XXXXXXXXXX"
                    maxLength={13}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-cafe-secondary transition-colors"
                  />
                  {addrErrors.phone && (
                    <p className="text-red-400 text-xs mt-1">
                      {addrErrors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              {!session && (
                <div>
                  <label className="text-white/60 text-xs font-semibold mb-1 block uppercase tracking-wider">
                    Email Address *
                  </label>
                  <input
                    {...registerAddr("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email",
                      },
                    })}
                    type="email"
                    placeholder="your@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-cafe-secondary transition-colors"
                  />
                  {addrErrors.email && (
                    <p className="text-red-400 text-xs mt-1">
                      {addrErrors.email.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Order Type */}
            <div className="bg-[#2C1E16] rounded-2xl p-6 space-y-5">
              <h2 className="text-white font-bold text-lg">Order Type</h2>
              <div className="grid grid-cols-3 gap-3">
                {(["dine-in", "takeaway", "delivery"] as OrderType[]).map(
                  (type) => (
                    <label
                      key={type}
                      className={`cursor-pointer rounded-xl border p-4 text-center transition-all ${
                        orderType === type
                          ? "border-cafe-secondary bg-cafe-secondary/10 text-cafe-secondary"
                          : "border-white/10 text-white/50 hover:border-white/30"
                      }`}
                    >
                      <input
                        {...registerAddr("orderType")}
                        type="radio"
                        value={type}
                        className="sr-only"
                      />
                      <span className="text-sm font-bold capitalize block">
                        {type === "dine-in"
                          ? "🍽️ Dine In"
                          : type === "takeaway"
                          ? "🥡 Takeaway"
                          : "🛵 Delivery"}
                      </span>
                    </label>
                  )
                )}
              </div>

              {orderType === "dine-in" && (
                <div>
                  <label className="text-white/60 text-xs font-semibold mb-1 block uppercase tracking-wider">
                    Table Number
                  </label>
                  <input
                    {...registerAddr("tableNumber")}
                    placeholder="e.g. T-12"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-cafe-secondary transition-colors"
                  />
                </div>
              )}

              {orderType === "delivery" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-white/60 text-xs font-semibold mb-1 block uppercase tracking-wider">
                      Street Address *
                    </label>
                    <input
                      {...registerAddr("street", {
                        required:
                          orderType === "delivery"
                            ? "Street is required for delivery"
                            : false,
                      })}
                      placeholder="House No, Street, Area"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-cafe-secondary transition-colors"
                    />
                    {addrErrors.street && (
                      <p className="text-red-400 text-xs mt-1">
                        {addrErrors.street.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/60 text-xs font-semibold mb-1 block uppercase tracking-wider">
                        City *
                      </label>
                      <input
                        {...registerAddr("city", {
                          required:
                            orderType === "delivery" ? "City is required" : false,
                        })}
                        placeholder="City"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-cafe-secondary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-xs font-semibold mb-1 block uppercase tracking-wider">
                        Pincode *
                      </label>
                      <input
                        {...registerAddr("pincode", {
                          required:
                            orderType === "delivery"
                              ? "Pincode is required"
                              : false,
                          pattern: {
                            value: /^\d{6}$/,
                            message: "6-digit pincode",
                          },
                        })}
                        placeholder="6-digit pincode"
                        maxLength={6}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-cafe-secondary transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              id="proceed-to-payment-btn"
              className="w-full py-4 bg-cafe-secondary text-[#1A110C] rounded-2xl font-black text-base uppercase tracking-wide hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              Continue to Payment
              <FaChevronRight size={14} />
            </button>
          </form>
        )}

        {/* ── STEP 2: PAYMENT ── */}
        {step === "payment" && (
          <form onSubmit={handlePaySubmit(onPaymentSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="bg-[#2C1E16] rounded-2xl p-6 space-y-4">
              <h2 className="text-white font-bold text-lg">Payment Method</h2>
              <div className="space-y-2">
                {paymentMethods.map((m) => (
                  <label
                    key={m.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === m.id
                        ? "border-cafe-secondary bg-cafe-secondary/10"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={m.id}
                      checked={paymentMethod === m.id}
                      onChange={() => setPaymentMethod(m.id)}
                      className="sr-only"
                    />
                    <div
                      className={`${
                        paymentMethod === m.id
                          ? "text-cafe-secondary"
                          : "text-white/40"
                      }`}
                    >
                      {m.icon}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-bold text-sm ${
                          paymentMethod === m.id ? "text-white" : "text-white/60"
                        }`}
                      >
                        {m.label}
                      </p>
                      <p className="text-white/40 text-xs">{m.desc}</p>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === m.id
                          ? "border-cafe-secondary"
                          : "border-white/20"
                      }`}
                    >
                      {paymentMethod === m.id && (
                        <div className="w-2 h-2 rounded-full bg-cafe-secondary" />
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Dynamic Payment Input */}
            <div className="bg-[#2C1E16] rounded-2xl p-6 space-y-4">
              {/* UPI */}
              {paymentMethod === "upi" && (
                <div className="bg-white/5 rounded-xl p-4 text-center">
                   <p className="text-white font-bold mb-2">Pay securely with Razorpay</p>
                   <p className="text-white/60 text-xs mb-4">
                     You will be redirected to the secure payment gateway to complete your UPI transaction. 
                     Scan the QR code on your desktop or use any UPI app on your mobile.
                   </p>
                </div>
              )}

              {/* Card or Netbanking */}
              {(paymentMethod === "card" || paymentMethod === "netbanking") && (
                <div className="bg-white/5 rounded-xl p-4 text-center">
                   <p className="text-white font-bold mb-2">Pay securely with Razorpay</p>
                   <p className="text-white/60 text-xs">
                     You will be redirected to the secure payment gateway to complete your transaction.
                   </p>
                </div>
              )}

              {/* COD */}
              {paymentMethod === "cod" && (
                <div className="text-center py-4 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-cafe-secondary/10 flex items-center justify-center mx-auto">
                    <FaMotorcycle size={28} className="text-cafe-secondary" />
                  </div>
                  <h3 className="text-white font-bold">Cash on Delivery</h3>
                  <p className="text-white/50 text-sm">
                    Pay ₹{grandTotal} in cash when your order arrives. Have
                    exact change ready!
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-cafe-secondary text-[#1A110C] rounded-2xl font-black text-base uppercase tracking-wide hover:brightness-110 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FaLock size={14} />
              {paymentMethod === "cod"
                ? `Confirm Order · ₹${grandTotal}`
                : `Pay ₹${grandTotal}`}
            </button>
          </form>
        )}

        {/* ORDER SUMMARY SIDEBAR */}
        <div>
          <OrderSummary />
        </div>
      </div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </div>
  );
}
