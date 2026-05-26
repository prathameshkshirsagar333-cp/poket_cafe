import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import Otp from "@/models/Otp";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!JWT_SECRET) {
      return NextResponse.json(
        { message: "Server misconfiguration: JWT_SECRET is not set." },
        { status: 500 }
      );
    }

    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and verification code are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = String(email).toLowerCase();
    const otpRecord = await Otp.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return NextResponse.json(
        { message: "Verification session expired. Please request a new code." },
        { status: 400 }
      );
    }

    if (otpRecord.attempts >= 3) {
      await Otp.deleteMany({ email: normalizedEmail });
      return NextResponse.json(
        { message: "Too many invalid attempts. Please request a new code." },
        { status: 403 }
      );
    }

    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      const attemptsLeft = 3 - otpRecord.attempts;
      if (attemptsLeft <= 0) {
        await Otp.deleteMany({ email: normalizedEmail });
        return NextResponse.json(
          { message: "Too many invalid attempts. Please request a new code." },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { message: `Invalid code. ${attemptsLeft} attempts remaining.` },
        { status: 400 }
      );
    }

    await Otp.deleteMany({ email: normalizedEmail });

    const signupToken = jwt.sign(
      { email: normalizedEmail, purpose: "signup" },
      JWT_SECRET,
      { expiresIn: "10m" }
    );

    return NextResponse.json(
      { message: "Email verified successfully.", signupToken },
      { status: 200 }
    );
  } catch (error) {
    console.error("Signup OTP verification error:", error);
    return NextResponse.json(
      { message: "Internal server error during OTP verification." },
      { status: 500 }
    );
  }
}
