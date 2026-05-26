import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Reservation from "@/models/Reservation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // 1. BACKEND PROTECTION: Verify session exists securely on the server
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized access. Please log in." },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // 2. Fetch data tied ONLY to the authenticated user's email
    const userReservations = await Reservation.find({ email: session.user.email }).sort({ date: 1, time: 1 });

    return NextResponse.json(
      { reservations: userReservations },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Secure API Error:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
