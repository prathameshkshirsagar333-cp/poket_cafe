import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Otp from '@/models/Otp';
import { sendOtpEmail } from '@/lib/nodemailer';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    await connectToDatabase();

    // 1. Check if user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Act identically whether user exists or not to prevent email enumeration sniffing
      return NextResponse.json({ message: 'If an account exists, a reset code was sent.' }, { status: 200 });
    }

    // 2. Cooldown check
    const existingOtp = await Otp.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });
    if (existingOtp) {
      const timeDiffInSeconds = (Date.now() - new Date(existingOtp.createdAt).getTime()) / 1000;
      if (timeDiffInSeconds < 30) {
        return NextResponse.json(
          { message: `Please wait ${Math.ceil(30 - timeDiffInSeconds)} seconds before requesting a new code.` },
          { status: 429 }
        );
      }
      await Otp.deleteMany({ email: normalizedEmail });
    }

    // 3. Generate and store OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.create({ email: normalizedEmail, otp, attempts: 0 });

    // 4. Send email
    const emailResponse = await sendOtpEmail(normalizedEmail, otp);
    if (!emailResponse.success) {
      await Otp.deleteMany({ email: normalizedEmail });
      return NextResponse.json({ message: `SMTP Error: ${emailResponse.message}` }, { status: 500 });
    }

    return NextResponse.json({ message: 'If an account exists, a reset code was sent.' }, { status: 200 });
  } catch (error: any) {
    console.error('Error in forgot-password/send-otp:', error);
    return NextResponse.json({ message: 'Internal server error', exactError: error.message }, { status: 500 });
  }
}
