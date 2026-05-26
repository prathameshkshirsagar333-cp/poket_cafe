import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Otp from '@/models/Otp';
import jwt from 'jsonwebtoken';
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!JWT_SECRET) {
      return NextResponse.json({ message: 'Server misconfiguration: JWT_SECRET is not set.' }, { status: 500 });
    }

    if (!email || !otp) {
      return NextResponse.json({ message: 'Email and OTP are required' }, { status: 400 });
    }

    await connectToDatabase();

    // 1. Locate the active OTP transaction
    const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return NextResponse.json({ message: 'Validation session has either expired or was not requested.' }, { status: 400 });
    }

    // 2. Halt if maximum incorrect attempts breached
    if (otpRecord.attempts >= 3) {
      await Otp.deleteMany({ email });
      return NextResponse.json({ message: 'Maximum validation attempts reached. Your session has been locked, please log in again.' }, { status: 403 });
    }

    // 3. Compare OTP precisely
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      
      const attemptsLeft = 3 - otpRecord.attempts;
      if (attemptsLeft === 0) {
         await Otp.deleteMany({ email });
         return NextResponse.json({ message: 'You incorrectly guessed the code. Session locked, please log in again.' }, { status: 403 });
      }

      return NextResponse.json(
        { message: `Incorrect security code. You have ${attemptsLeft} attempts remaining.` }, 
        { status: 400 }
      );
    }

    // 4. Valid OTP: Immediately invalidate to completely prevent replay attacks
    await Otp.deleteMany({ email });

    // 5. Generate secure JWT using existing server environment secret
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });

    // 6. Push JWT securely inside an HTTPOnly browser cookie that JavaScript cannot access
    const response = NextResponse.json({ message: 'Login completely verified!' }, { status: 200 });
    
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 Days in Seconds
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Error in strict verify-otp validation route:', error);
    return NextResponse.json({ message: 'Internal server error while resolving your code' }, { status: 500 });
  }
}
