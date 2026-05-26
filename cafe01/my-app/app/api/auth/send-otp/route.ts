import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
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

    await connectToDatabase();

    // Check for existing OTP and enforce a 30-second cooldown per email
    const existingOtp = await Otp.findOne({ email }).sort({ createdAt: -1 });
    if (existingOtp) {
      const timeDiffInSeconds = (Date.now() - new Date(existingOtp.createdAt).getTime()) / 1000;
      if (timeDiffInSeconds < 30) {
        return NextResponse.json(
          { message: `Please wait ${Math.ceil(30 - timeDiffInSeconds)} seconds before requesting a new OTP.` },
          { status: 429 }
        );
      }
      // If past 30s cooldown but not yet expired, delete old records
      await Otp.deleteMany({ email });
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create a new OTP record (expires automatically after 5 mins per TTL index in schema)
    await Otp.create({ email, otp });

    // Send the OTP via standard Nodemailer SMTP
    const emailResponse = await sendOtpEmail(email, otp);

    if (!emailResponse.success) {
      // If SMTP fails, clean up the unused OTP from DB
      await Otp.deleteMany({ email });
      return NextResponse.json({ message: 'Failed to send OTP email via SMTP. Check your credentials.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'OTP sent successfully to your email.' }, { status: 200 });
  } catch (error: any) {
    console.error('Error in send-otp route:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
