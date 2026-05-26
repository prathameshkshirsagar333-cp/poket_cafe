import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  id: number;
  name: string;
  category: "Coffee" | "Tea" | "Snacks" | "Dessert";
  description: string;
  price: number;
  priceDisplay: string;
  image: string;
  popular: boolean;
  available: boolean;
}

const ProductSchema: Schema = new Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["Coffee", "Tea", "Snacks", "Dessert"],
    },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    priceDisplay: { type: String, required: true },
    image: { type: String, required: true },
    popular: { type: Boolean, default: false },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Product =
  mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
