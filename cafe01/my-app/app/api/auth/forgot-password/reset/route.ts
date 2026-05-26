import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Otp from '@/models/Otp';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (newPassword.length < 6) {
      return NextResponse.json({ message: 'New password must be at least 6 characters long' }, { status: 400 });
    }

    await connectToDatabase();

    // 1. Verify OTP existence and attempts
    const otpRecord = await Otp.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });
    if (!otpRecord) {
      return NextResponse.json({ message: 'Reset session expired or invalid.' }, { status: 400 });
    }

    if (otpRecord.attempts >= 3) {
      await Otp.deleteMany({ email: normalizedEmail });
      return NextResponse.json({ message: 'Too many failed attempts. Please request a new code.' }, { status: 403 });
    }

    // 2. Compare OTP
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const attemptsLeft = 3 - otpRecord.attempts;
      
      if (attemptsLeft === 0) {
         await Otp.deleteMany({ email: normalizedEmail });
         return NextResponse.json({ message: 'Too many incorrect guesses. Your reset session has been locked.' }, { status: 403 });
      }

      return NextResponse.json(
        { message: `Incorrect security code. You have ${attemptsLeft} attempts remaining.` }, 
        { status: 400 }
      );
    }

    // 3. OTP is valid! Hash the new password and update the user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.updateOne({ email: normalizedEmail }, { $set: { password: hashedPassword } });

    // 4. Destroy OTP session
    await Otp.deleteMany({ email: normalizedEmail });

    return NextResponse.json({ message: 'Password reset successfully! You can now log in.' }, { status: 200 });
  } catch (error: any) {
    console.error('Error in forgot-password/reset:', error);
    return NextResponse.json({ message: 'Internal server error', exactError: error.message }, { status: 500 });
  }
}
