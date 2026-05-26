import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Reservation from "@/models/Reservation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // 1. BACKEND PROTECTION FOR WRITE OPERATIONS
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized access. You must be logged in to book a table." },
        { status: 401 }
      );
    }

    const data = await req.json();

    // Basic Validation
    if (!data.name || !data.email || !data.date || !data.time || !data.guests) {
      return NextResponse.json(
        { message: "Please provide all required fields." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 2. ENFORCE DATA INTEGRITY: Use the verified server session email, NOT the frontend payload. 
    // This prevents malicious users from booking tables under someone else's email.
    const newReservation = await Reservation.create({
      name: data.name,
      email: session.user.email, // Secure backend override
      date: data.date,
      time: data.time,
      guests: data.guests,
      request: data.request || "",
    });

    return NextResponse.json(
      {
        message: "Reservation confirmed successfully!",
        reservation: newReservation,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Reservation API Error:", error);
    return NextResponse.json(
      { message: "Internal server error while creating reservation." },
      { status: 500 }
    );
  }
}
