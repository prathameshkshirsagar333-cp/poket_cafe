import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import { sendWhatsAppOrderConfirmation } from "@/lib/whatsapp";
import { sendOrderConfirmationEmail } from "@/lib/nodemailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not configured");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentEntity = event.payload.payment?.entity;
      const rzpOrderId = paymentEntity?.order_id || event.payload.order?.entity?.id;
      // We don't save rzpOrderId in DB directly unless we add a field, but we can search by orderNumber which is passed in receipt.
      const receipt = paymentEntity?.notes?.receipt || event.payload.order?.entity?.receipt;

      if (!receipt) {
         console.warn("Received payment.captured but no receipt (orderNumber) was found in notes/entity.");
         return NextResponse.json({ status: "ok" });
      }

      await connectToDatabase();
      const order = await Order.findOne({ orderNumber: receipt });

      if (order && order.status === "pending") {
        order.status = "paid";
        order.paymentId = paymentEntity?.id || order.paymentId;
        await order.save();

        // Send confirmation since the order is now officially paid
        const itemsList = order.items.map((item: any) => `  - ${item.quantity}x ${item.name} (₹${item.price})`).join("\n");
        const customerName = order.guestName || order.address.fullName || "Valued Customer";
        const customerEmail = order.guestEmail || order.address.email;
        
        sendWhatsAppOrderConfirmation(
          order.address.phone,
          customerName,
          order.orderNumber,
          order.total,
          itemsList
        ).then((whatsappSuccess) => {
           if (!whatsappSuccess && customerEmail) {
              console.log("WhatsApp failed, attempting email fallback...");
              sendOrderConfirmationEmail(customerEmail, customerName, order.orderNumber, order.total, itemsList, "paid");
           }
        }).catch(err => console.error("Error in confirmation flow:", err));
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[RAZORPAY WEBHOOK ERROR]", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
