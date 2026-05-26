import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import Razorpay from "razorpay";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import { sendWhatsAppOrderConfirmation } from "@/lib/whatsapp";
import { sendOrderConfirmationEmail } from "@/lib/nodemailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Generate readable order number
function generateOrderNumber(): string {
  const prefix = "CAFE";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// GET /api/orders — list orders for logged-in user
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await Order.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("[ORDERS GET]", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// POST /api/orders — place an order
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    const cookieStore = await cookies();
    const guestId = cookieStore.get("cafe_guest_id")?.value;

    const body = await req.json();
    const {
      items,
      subtotal,
      tax,
      deliveryFee,
      total,
      paymentMethod,
      paymentId,
      upiId,
      address,
      guestEmail,
      guestName,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!paymentMethod || !address) {
      return NextResponse.json({ error: "Missing payment or address info" }, { status: 400 });
    }

    // Validate phone
    if (!address.phone || !/^(?:\+?91|91)?\d{10}$/.test(address.phone.replace(/\s/g, ""))) {
      return NextResponse.json({ error: "Valid 10-digit phone number required (e.g. 91XXXXXXXXXX)" }, { status: 400 });
    }

    // For COD, mark as processing. For online payments, mark as pending until webhook confirms.
    const status = paymentMethod === "cod" ? "processing" : "pending";

    const orderNumber = generateOrderNumber();

    let razorpayOrderId = null;

    // Create Razorpay Order if not COD
    if (paymentMethod !== "cod") {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
      });

      const options = {
        amount: Math.round(total * 100), // amount in smallest currency unit (paise)
        currency: "INR",
        receipt: orderNumber,
      };

      try {
        const razorpayOrder = await razorpay.orders.create(options);
        razorpayOrderId = razorpayOrder.id;
      } catch (rzpError) {
        console.error("Razorpay Order Creation Error:", rzpError);
        return NextResponse.json({ error: "Failed to initialize payment gateway" }, { status: 500 });
      }
    }

    const order = new Order({
      orderNumber,
      userId: session?.user?.id || null,
      guestId: session?.user?.id ? null : guestId,
      guestEmail: session?.user?.id ? null : guestEmail,
      guestName: session?.user?.id ? null : guestName,
      items,
      subtotal,
      tax,
      deliveryFee,
      total,
      status,
      paymentMethod,
      paymentId: paymentId || null,
      upiId: upiId || null,
      address,
    });

    await order.save();

    // Clear the cart after successful order initialization
    if (session?.user?.id) {
      await Cart.findOneAndUpdate({ userId: session.user.id }, { items: [] });
    } else if (guestId) {
      await Cart.findOneAndUpdate({ guestId }, { items: [] });
    }

    // If COD, we trigger WhatsApp right away. If online payment, we might wait for webhook.
    // However, to keep it simple, we can trigger an 'Order Initiated' or just wait for webhook.
    // For now, let's keep the existing logic and only send confirmation if it's COD.
    if (status === "processing") {
      const itemsList = items.map((item: any) => `  - ${item.quantity}x ${item.name} (₹${item.price})`).join("\n");
      const customerName = session?.user?.name || guestName || address.fullName || "Valued Customer";
      const customerEmail = session?.user?.email || guestEmail || address.email;
      
      sendWhatsAppOrderConfirmation(
        address.phone,
        customerName,
        orderNumber,
        total,
        itemsList
      ).then((whatsappSuccess) => {
         if (!whatsappSuccess && customerEmail) {
            console.log("WhatsApp failed, attempting email fallback...");
            sendOrderConfirmationEmail(customerEmail, customerName, orderNumber, total, itemsList, status);
         }
      }).catch(err => console.error("Error in confirmation flow:", err));
    }

    return NextResponse.json({
      success: true,
      razorpayOrderId,
      order: {
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error("[ORDERS POST]", error);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
