import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  productId: number;
  name: string;
  price: number;
  priceDisplay: string;
  image: string;
  category: string;
  quantity: number;
}

export interface IOrderAddress {
  name: string;
  phone: string;
  street: string;
  city: string;
  pincode: string;
  orderType: "dine-in" | "takeaway" | "delivery";
  tableNumber?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  userId?: mongoose.Types.ObjectId;
  guestId?: string;
  guestEmail?: string;
  guestName?: string;
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  status:
    | "pending"
    | "paid"
    | "processing"
    | "completed"
    | "failed"
    | "refunded"
    | "cancelled";
  paymentMethod: "upi" | "netbanking" | "card" | "cod";
  paymentId?: string;
  upiId?: string;
  address: IOrderAddress;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Number, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    priceDisplay: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const OrderAddressSchema = new Schema<IOrderAddress>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    pincode: { type: String, default: "" },
    orderType: {
      type: String,
      enum: ["dine-in", "takeaway", "delivery"],
      required: true,
    },
    tableNumber: { type: String, default: "" },
  },
  { _id: false }
);

const OrderSchema: Schema = new Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    guestId: { type: String, default: null },
    guestEmail: { type: String, default: null },
    guestName: { type: String, default: null },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    deliveryFee: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "processing",
        "completed",
        "failed",
        "refunded",
        "cancelled",
      ],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["upi", "netbanking", "card", "cod"],
      required: true,
    },
    paymentId: { type: String, default: null },
    upiId: { type: String, default: null },
    address: { type: OrderAddressSchema, required: true },
  },
  { timestamps: true }
);

// Indexes for performance
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ guestId: 1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ status: 1 });

const Order =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
