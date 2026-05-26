import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Otp from '@/models/Otp';
import { sendOtpEmail } from '@/lib/nodemailer';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    await connectToDatabase();

    // 1. Verify User Credentials Securely
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Generic message prevents email enumeration attacks
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    if (!user.password) {
      return NextResponse.json({ message: 'Please sign in with Google.' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // 2. Verify 30-Second OTP Cooldown (strict)
    const existingOtp = await Otp.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });
    if (existingOtp) {
      const timeDiffInSeconds = (Date.now() - new Date(existingOtp.createdAt).getTime()) / 1000;
      if (timeDiffInSeconds < 30) {
        return NextResponse.json(
          { message: `Please wait ${Math.ceil(30 - timeDiffInSeconds)} seconds before requesting a new validation code.` },
          { status: 429 }
        );
      }
      
      // Clean up past 30s but unexpired records to prevent duplicate active tokens
      await Otp.deleteMany({ email: normalizedEmail });
    }

    // 3. Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in backend tightly linked to email
    await Otp.create({ email: normalizedEmail, otp, attempts: 0 });

    // 4. Dispatch Email Sequence Asynchronously
    const emailResponse = await sendOtpEmail(normalizedEmail, otp);

    if (!emailResponse.success) {
      // Revert generation if SMTP crashes
      await Otp.deleteMany({ email: normalizedEmail });
      // Return Exact SMTP Error Details for deep debugging!
      return NextResponse.json(
        { message: `SMTP Failure: ${emailResponse.message}` }, 
        { status: 500 }
      );
    }

    // Completely successful validation + send
    return NextResponse.json({ message: 'Credentials verified, OTP successfully sent.' }, { status: 200 });

  } catch (error: any) {
    console.error('Error in primary login flow route:', error);
    return NextResponse.json({ message: 'Internal server error', exactError: error.message }, { status: 500 });
  }
}
