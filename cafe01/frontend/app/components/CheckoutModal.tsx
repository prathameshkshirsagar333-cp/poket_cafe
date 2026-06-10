"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { useForm } from "react-hook-form";
import { useCart } from "@/app/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
  FaPrint,
  FaShoppingBag,
  FaHome,
  FaCheck,
  FaClock,
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
    items: any[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

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

  useEffect(() => {
    if (step !== "success" || !orderResult) return;
    
    const key = `order_time_${orderResult.orderNumber}`;
    let startTime = localStorage.getItem(key);
    if (!startTime) {
      startTime = Date.now().toString();
      localStorage.setItem(key, startTime);
    }
    
    const startTimestamp = parseInt(startTime, 10);
    
    const updateElapsed = () => {
      const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
      setElapsedSeconds(elapsed);
    };
    
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    
    return () => clearInterval(interval);
  }, [step, orderResult]);

  useEffect(() => {
    if (orderType !== "delivery" && paymentMethod === "cod") {
      setPaymentMethod("upi");
    }
  }, [orderType, paymentMethod]);

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

      if (data.razorpayOrderId) {
        // Open Razorpay Checkout (supports online full payment and COD 50% advance)
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_1DP5mmOlF5G5ag",
          amount: paymentMethod === "cod" ? Math.round(grandTotal * 0.5 * 100) : Math.round(grandTotal * 100),
          currency: "INR",
          name: "Poket Cafe",
          description: paymentMethod === "cod" ? "50% Non-Refundable COD Advance" : "Order Checkout",
          order_id: data.razorpayOrderId,
          handler: async function (response: any) {
            // Payment Success
            setOrderResult({
              orderNumber: data.order.orderNumber,
              total: data.order.total,
              items: [...cartItems],
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
        // Fallback for offline testing or order creations without Razorpay
        setOrderResult({
          orderNumber: data.order.orderNumber,
          total: data.order.total,
          items: [...cartItems],
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
      desc: "50% advance online, 50% cash on delivery",
    },
  ];

  const filteredPaymentMethods = paymentMethods.filter(
    (m) => m.id !== "cod" || orderType === "delivery"
  );

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
    const today = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div className="min-h-screen bg-[#1A110C]/90 backdrop-blur-md flex items-center justify-center px-4 py-12 relative overflow-y-auto">
        <div className="max-w-xl w-full text-center space-y-8 py-6">
          {/* Animated Success Badge */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto shadow-lg shadow-green-500/10">
              <FaCheckCircle size={52} className="text-green-400" />
            </div>
            {/* Ripple rings */}
            <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="w-24 h-24 rounded-full bg-green-500/20 animate-ping" />
            </span>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-white font-black text-3xl md:text-4xl tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>
              Order Placed Successfully! 🎉
            </h1>
            <p className="text-white/60 text-sm mt-2 font-medium">
              Thank you for dining with Poket Cafe. We are preparing your delicious order!
            </p>
          </div>

          {/* Order Tracking Progress Timeline */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center shadow-lg">
            <h3 className="text-white font-bold text-xs uppercase tracking-widest text-left mb-6 text-white/50">
              Order Status Track
            </h3>
            <div className="relative flex items-center justify-between max-w-sm mx-auto">
              {/* Connector lines behind */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex z-0">
                <div 
                  className={`h-[2px] w-1/2 transition-colors duration-1000 ${
                    elapsedSeconds >= 60 ? "bg-green-500" : "bg-white/10"
                  }`} 
                />
                <div 
                  className={`h-[2px] w-1/2 transition-colors duration-1000 ${
                    elapsedSeconds >= 240 ? "bg-green-500" : "bg-white/10"
                  }`} 
                />
              </div>
              
              {/* Step 1: Placed */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-500 text-[#1A110C] flex items-center justify-center shadow-md">
                  <FaCheck size={12} className="font-bold" />
                </div>
                <span className="text-[11px] font-bold text-green-400">Placed</span>
              </div>

              {/* Step 2: Preparing */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-500 ${
                    elapsedSeconds >= 60 
                      ? "bg-green-500 text-[#1A110C]" 
                      : "bg-cafe-secondary text-[#1A110C] animate-pulse"
                  }`}
                >
                  {elapsedSeconds >= 60 ? (
                    <FaCheck size={12} className="font-bold" />
                  ) : (
                    <FaClock size={12} className="animate-spin" style={{ animationDuration: "3s" }} />
                  )}
                </div>
                <span 
                  className={`text-[11px] font-bold transition-colors duration-500 ${
                    elapsedSeconds >= 60 ? "text-green-400" : "text-cafe-secondary"
                  }`}
                >
                  {elapsedSeconds >= 60 ? "Prepared" : "Preparing"}
                </span>
              </div>

              {/* Step 3: Ready */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md border transition-all duration-500 ${
                    elapsedSeconds >= 240
                      ? "bg-green-500 border-transparent text-[#1A110C]"
                      : elapsedSeconds >= 60
                      ? "bg-cafe-secondary border-transparent text-[#1A110C] animate-pulse"
                      : "bg-[#1A110C] border-white/20 text-white/40"
                  }`}
                >
                  {elapsedSeconds >= 240 ? (
                    <FaCheck size={12} className="font-bold" />
                  ) : elapsedSeconds >= 60 ? (
                    <FaClock size={12} className="animate-spin" style={{ animationDuration: "3s" }} />
                  ) : (
                    <FaMotorcycle size={12} />
                  )}
                </div>
                <span 
                  className={`text-[11px] font-bold transition-colors duration-500 ${
                    elapsedSeconds >= 240 
                      ? "text-green-400" 
                      : elapsedSeconds >= 60 
                      ? "text-cafe-secondary" 
                      : "text-white/40"
                  }`}
                >
                  {elapsedSeconds >= 240 ? "Ready" : "Ready"}
                </span>
              </div>
            </div>
          </div>

          {/* Receipt Card */}
          <div className="bg-[#2C1E16]/95 border border-[#C5A059]/20 rounded-3xl p-6 relative overflow-hidden shadow-2xl text-left before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-2 before:bg-[radial-gradient(circle_at_bottom,_transparent_50%,_rgba(197,160,89,0.2)_50%)] before:bg-[length:12px_8px] before:bg-repeat-x">
            {/* Receipt Header */}
            <div className="text-center pt-2">
              <h2 className="text-[#C5A059] font-black text-2xl tracking-widest uppercase" style={{ fontFamily: "var(--font-serif)" }}>
                Poket Cafe
              </h2>
              <p className="text-white/40 text-[9px] uppercase tracking-wider font-bold mt-1">
                Premium Dining & Food Delivery
              </p>
              <div className="border-b border-dashed border-white/10 my-4" />
            </div>

            {/* Receipt Details Info */}
            <div className="space-y-2 text-xs text-white/50 font-medium font-sans">
              <div className="flex justify-between">
                <span>Receipt Date:</span>
                <span className="text-white/80">{today}</span>
              </div>
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span className="text-[#C5A059] font-bold font-mono">{orderResult.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <span className="text-white/80 uppercase">
                  {paymentMethod === "cod" ? "Cash on Delivery (50% Advance)" : paymentMethod}
                </span>
              </div>
              {paymentMethod === "cod" ? (
                <>
                  <div className="flex justify-between text-green-400 font-bold border-t border-white/5 pt-1.5 mt-1">
                    <span>50% Advance Paid Online:</span>
                    <span>₹{Math.round(orderResult.total * 0.5)}</span>
                  </div>
                  <div className="flex justify-between text-yellow-400 font-bold">
                    <span>Remaining Due on Delivery:</span>
                    <span>₹{orderResult.total - Math.round(orderResult.total * 0.5)}</span>
                  </div>
                  <div className="text-[10px] text-red-400/80 font-bold uppercase tracking-wider text-center mt-2.5">
                    ⚠️ Note: Advance payment is non-refundable.
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span>Payment Status:</span>
                  <span className="text-green-400 font-bold">Paid</span>
                </div>
              )}
            </div>

            <div className="border-b border-dashed border-white/10 my-4" />

            {/* Receipt Ordered Items */}
            <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-3 text-white/40">
              Ordered Items
            </h3>
            <div className="space-y-3">
              {orderResult.items && orderResult.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-8 h-8 rounded-lg object-cover border border-white/10 flex-shrink-0"
                      />
                    )}
                    <div>
                      <p className="text-white font-bold">{item.name}</p>
                      <p className="text-white/40 text-xs font-semibold">₹{item.price} x {item.quantity}</p>
                    </div>
                  </div>
                  <span className="text-[#C5A059] font-black">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-b border-dashed border-[#C5A059]/30 my-4" />

            {/* Receipt Grand Total */}
            <div className="flex justify-between items-center">
              <span className="text-white font-black text-base uppercase tracking-wider">
                Total Amount
              </span>
              <span className="text-[#C5A059] font-black text-2xl font-serif">
                ₹{orderResult.total}
              </span>
            </div>
            
            <p className="text-[10px] text-center text-white/30 font-medium mt-4 tracking-wide italic">
              Thank you for ordering! Visit us again soon.
            </p>
          </div>

          {/* Action Buttons CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {session && (
              <button
                onClick={() => router.push("/orders")}
                style={{ backgroundColor: "#C5A059", color: "#1A110C" }}
                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-sm uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-xl"
              >
                <FaShoppingBag size={14} />
                View My Orders
              </button>
            )}
            <button
              onClick={() => router.push("/")}
              className="w-full flex items-center justify-center gap-2.5 py-4 bg-white/10 text-white border border-white/15 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-white/15 active:scale-95 transition-all shadow-md"
            >
              <FaHome size={14} />
              Back to Home
            </button>
          </div>

          {/* Print Invoice Link */}
          <div>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors duration-200 text-xs font-bold uppercase tracking-widest pt-2 group"
            >
              <FaPrint size={12} className="group-hover:scale-110 transition-transform duration-200" />
              Print Receipt / Invoice
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
    <div className="min-h-screen bg-[#1A110C]/85">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#1A110C]/90 backdrop-blur-xl border-b border-white/10 px-4 py-4">
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
                {filteredPaymentMethods.map((m) => (
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
                  <h3 className="text-white font-bold">Cash on Delivery (COD)</h3>
                  <p className="text-white/70 text-sm">
                    For Cash on Delivery, a <span className="text-cafe-secondary font-bold">50% advance payment</span> is required online now. The remaining 50% is due in cash when your order arrives.
                  </p>
                  
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-3 space-y-2 text-left text-xs font-sans">
                    <div className="flex justify-between">
                      <span className="text-white/50">Total Order Amount:</span>
                      <span className="text-white font-bold">₹{grandTotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Advance to Pay Online (50%):</span>
                      <span className="text-cafe-secondary font-black">₹{Math.round(grandTotal * 0.5)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Cash Due on Delivery (50%):</span>
                      <span className="text-white font-bold">₹{grandTotal - Math.round(grandTotal * 0.5)}</span>
                    </div>
                    <p className="text-red-400 text-[10px] text-center font-bold uppercase tracking-wider mt-2">
                      ⚠️ Note: 50% Advance is strictly non-refundable.
                    </p>
                  </div>
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
                ? `Pay 50% Advance · ₹${Math.round(grandTotal * 0.5)}`
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
