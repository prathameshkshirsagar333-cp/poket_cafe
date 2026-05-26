import nodemailer from 'nodemailer';

// If EMAIL_USER is present, we prioritize Gmail App Passwords. Otherwise, use Resend if available.
const useResend = !!process.env.RESEND_API_KEY && !process.env.EMAIL_USER;

// Detailed SMTP configuration
const transporter = nodemailer.createTransport(
  useResend
    ? {
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        auth: {
          user: 'resend',
          pass: process.env.RESEND_API_KEY,
        },
        debug: process.env.NODE_ENV !== 'production',
        logger: process.env.NODE_ENV !== 'production',
      }
    : {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === 'production',
        },
        debug: process.env.NODE_ENV !== 'production',
        logger: process.env.NODE_ENV !== 'production',
      }
);

export const verifyTransporter = async () => {
  try {
    if (!useResend && (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)) {
      throw new Error("Missing EMAIL_USER or EMAIL_PASS in environment variables.");
    }
    
    await transporter.verify();
    console.log("SMTP Connection verified successfully. Ready to send emails.");
    return { success: true, message: "SMTP configuration is perfectly valid" };
  } catch (error: any) {
    console.error("SMTP Verification Failed:", error.message || error);
    return { success: false, message: error.message || "Failed to verify SMTP credentials.", error };
  }
};

export const sendOtpEmail = async (email: string, otp: string) => {
  if (!email) throw new Error("No recipient email provided for sendOtpEmail");
  if (!useResend && !process.env.EMAIL_USER) throw new Error("EMAIL_USER environment variable is undefined");
  
  // Resend free tier forces us to only send to our test email, or it errors.
  const isTesting = !process.env.RESEND_FROM_EMAIL;
  
  // If using Gmail, just send exactly to the user's provided email.
  const toEmail = useResend && isTesting ? (process.env.RESEND_TEST_EMAIL || email) : email;
  const fromEmail = useResend ? (process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev') : process.env.EMAIL_USER;

  const mailOptions = {
    from: `"Cafe Security" <${fromEmail}>`,
    to: toEmail,
    subject: 'Your Secure Login Code - Cafe',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 10px; background-color: #fcfbf8;">
        <h2 style="color: #4a3b32; text-align: center;">Verify Your Login</h2>
        <p style="color: #555; font-size: 16px;">Hello,</p>
        <p style="color: #555; font-size: 16px;">Please use the verification code below to securely login. This code is valid for <strong>5 minutes</strong>.</p>
        <div style="background-color: #fff; border: 2px dashed #b89876; padding: 15px; text-align: center; margin: 25px 0; border-radius: 8px;">
          <span style="font-size: 38px; font-weight: bold; letter-spacing: 8px; color: #4a3b32; font-family: monospace;">${otp}</span>
        </div>
        <p style="color: #777; font-size: 14px; text-align: center;">If you didn't attempt to sign in, safely ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent: ${info.messageId}`);
    return { success: true, info };
  } catch (error: any) {
    console.error('SMTP Error:', error.message);
    
    // If we're in development, bypass SMTP failures and just print the OTP so the dev isn't blocked!
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n======================================================');
      console.log(`🚀 DEVELOPMENT MODE: SMTP Bypass Active`);
      console.log(`📧 Intended Recipient: ${toEmail}`);
      console.log(`🔐 YOUR OTP CODE IS: ${otp}`);
      console.log('======================================================\n');
      return { success: true, message: "Mocked delivery (Check server console for OTP)" };
    }

    return { 
      success: false, 
      error,
      message: error.message || "Failed to deliver email" 
    };
  }
};

export const sendOrderConfirmationEmail = async (
  email: string,
  customerName: string,
  orderNumber: string,
  totalAmount: number,
  itemsList: string,
  status: string = "Pending",
  estimatedDelivery: string = "20-30 minutes"
) => {
  if (!email) return { success: false, message: "No email provided" };

  const fromEmail = useResend ? (process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev') : process.env.EMAIL_USER;
  // If testing with Resend free tier, restrict to test email
  const isTesting = !process.env.RESEND_FROM_EMAIL;
  const toEmail = useResend && isTesting ? (process.env.RESEND_TEST_EMAIL || email) : email;

  const mailOptions = {
    from: `"Cafe Express" <${fromEmail}>`,
    to: toEmail,
    subject: `Order Confirmed! #${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 10px;">
        <h2 style="color: #4a3b32; text-align: center;">🍽️ Order Confirmed!</h2>
        <p style="color: #555; font-size: 16px;">Hi ${customerName},</p>
        <p style="color: #555; font-size: 16px;">Thank you for ordering from Cafe Express ☕.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #4a3b32; margin-top: 0;">Order Details:</h3>
          <p style="margin: 5px 0;"><strong>Order ID:</strong> #${orderNumber}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> ${status}</p>
          <p style="margin: 5px 0;"><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>
          
          <hr style="border: 0; border-top: 1px solid #ddd; margin: 15px 0;" />
          
          <h4 style="margin: 0 0 10px 0;">Items:</h4>
          <pre style="font-family: Arial, sans-serif; white-space: pre-wrap; margin: 0; color: #555;">${itemsList}</pre>
          
          <hr style="border: 0; border-top: 1px solid #ddd; margin: 15px 0;" />
          
          <p style="margin: 5px 0; font-size: 18px;"><strong>Total:</strong> ₹${totalAmount.toFixed(2)}</p>
        </div>
        
        <p style="color: #777; font-size: 14px; text-align: center;">We are preparing your order. Enjoy your meal!</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent: ${info.messageId}`);
    return { success: true, info };
  } catch (error: any) {
    console.error('SMTP Error (Order Email):', error.message);
    return { success: false, message: error.message };
  }
};
