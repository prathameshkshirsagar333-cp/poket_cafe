import mongoose, { Schema, Document } from "mongoose";

export interface ICartItem {
  productId: number;
  name: string;
  price: number;
  priceDisplay: string;
  image: string;
  category: string;
  quantity: number;
}

export interface ICart extends Document {
  userId?: mongoose.Types.ObjectId;
  guestId?: string;
  items: ICartItem[];
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    productId: { type: Number, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    priceDisplay: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

const CartSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    guestId: { type: String, default: null },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true }
);

// Index for quick lookup
CartSchema.index({ userId: 1 });
CartSchema.index({ guestId: 1 });

const Cart = mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema);

export default Cart;
