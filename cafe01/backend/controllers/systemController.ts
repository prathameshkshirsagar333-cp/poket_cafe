import type { Request, Response } from "express";
import connectToDatabase from "../lib/mongodb.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Reservation from "../models/Reservation.js";
import Product from "../models/Product.js";

export async function getStatus(_req: Request, res: Response) {
  try {
    await connectToDatabase();
    const userCount = await User.countDocuments();
    const orderCount = await Order.countDocuments();
    const reservationCount = await Reservation.countDocuments();
    const productCount = await Product.countDocuments();

    res.json({
      status: "online",
      message: "Cafe Express Standalone Server is fully operational! ☕",
      database: {
        connection: "connected",
        users: userCount,
        orders: orderCount,
        reservations: reservationCount,
        products: productCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Health check failure:", error);
    res.status(500).json({
      status: "error",
      message: "Database connection failed or server is uninitialized",
      error: error.message,
    });
  }
}

export async function getUserCount(_req: Request, res: Response) {
  try {
    await connectToDatabase();
    const count = await User.countDocuments();
    res.json({
      success: true,
      count,
      message: `Database currently contains ${count} registered cafe customer accounts.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getProducts(_req: Request, res: Response) {
  try {
    await connectToDatabase();
    const products = await Product.find({}).limit(10);
    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
