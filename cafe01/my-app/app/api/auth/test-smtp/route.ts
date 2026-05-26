import { NextResponse } from 'next/server';
import { sendOtpEmail, verifyTransporter } from '@/lib/nodemailer';
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isSmtpTestAllowed() {
  return (
    process.env.NODE_ENV !== 'production' ||
    process.env.ALLOW_SMTP_TEST === 'true'
  );
}

export async function POST(req: Request) {
  if (!isSmtpTestAllowed()) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }
  try {
    // 1. Immediately verify the transport credentials independent of OTP generation
    const validation = await verifyTransporter();
    if (!validation.success) {
      return NextResponse.json(
        { 
          message: 'SMTP Configuration is completely invalid. Check EMAIL_USER, EMAIL_PASS and Gmail App Passwords.', 
          exactError: validation.message,
          technicalDetails: validation.error
        }, 
        { status: 500 }
      );
    }

    // 2. Parse the desired test email destination
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Please provide an email to test sending.' }, { status: 400 });
    }

    // 3. Attempt to send a test email independently of the entire OTP validation flow
    const testOtp = "999999"; // Hardcoded test OTP
    const emailResponse = await sendOtpEmail(email, testOtp);

    if (!emailResponse.success) {
      return NextResponse.json(
        { 
          message: 'Transporter verified, but sending the email failed. Check recipient or SMTP quotas.', 
          exactError: emailResponse.message 
        }, 
        { status: 500 }
      );
    }

    // 4. Return robust JSON containing full success
    return NextResponse.json({ message: 'Great! Test email sent successfully globally. Your config is working.' }, { status: 200 });
  } catch (error: any) {
    console.error('Error in independent test-smtp route:', error);
    return NextResponse.json({ message: 'Internal server error while testing SMTP', specificError: error.message }, { status: 500 });
  }
}

// Added GET method to simply verify configuration via your browser URL directly!
export async function GET() {
  if (!isSmtpTestAllowed()) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

   const validation = await verifyTransporter();
   if (!validation.success) {
     return NextResponse.json({
       status: "FAILED",
       message: "Your SMTP configuration is invalid.",
       technicalDetails: validation.message,
       errorKeys: Object.keys(validation.error || {})
     }, { status: 500 });
   }

   return NextResponse.json({
     status: "SUCCESS",
     message: "Your Gmail Nodemailer credentials are valid and ready to send OTPs!"
   });
}

