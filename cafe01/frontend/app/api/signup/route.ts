import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

export async function POST(req: Request) {
  try {
    const { name, email, password, signupToken } = await req.json();

    // Validation
    if (!JWT_SECRET) {
      return NextResponse.json(
        { message: "Server misconfiguration: JWT_SECRET is not set." },
        { status: 500 }
      );
    }

    if (!name || !email || !password || !signupToken) {
      return NextResponse.json(
        { message: "Please complete OTP verification before creating your account." },
        { status: 403 }
      );
    }

    if (name.trim().length < 2) {
      return NextResponse.json(
        { message: "Name must be at least 2 characters long." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    let decodedToken: { email?: string; purpose?: string };
    try {
      decodedToken = jwt.verify(signupToken, JWT_SECRET) as {
        email?: string;
        purpose?: string;
      };
    } catch {
      return NextResponse.json(
        { message: "Verification session expired. Please request a new code." },
        { status: 403 }
      );
    }

    const normalizedEmail = email.toLowerCase();
    if (decodedToken.purpose !== "signup" || decodedToken.email !== normalizedEmail) {
      return NextResponse.json(
        { message: "Verification data mismatch. Please verify your email again." },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email is already registered. Please log in." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    return NextResponse.json(
      {
        message: "Account created successfully!",
        user: { id: newUser._id, email: newUser.email, name: newUser.name },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Internal server error during registration." },
      { status: 500 }
    );
  }
}
