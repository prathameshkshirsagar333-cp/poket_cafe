import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Cart from "@/models/Cart";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Helper to get identity (userId or guestId)
async function getIdentity(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return { userId: session.user.id, guestId: null };
  }
  const cookieStore = await cookies();
  let guestId = cookieStore.get("cafe_guest_id")?.value;
  return { userId: null, guestId: guestId || null };
}

// GET /api/cart — fetch current cart
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { userId, guestId } = await getIdentity(req);

    if (!userId && !guestId) {
      return NextResponse.json({ items: [] });
    }

    const query = userId ? { userId } : { guestId };
    const cart = await Cart.findOne(query).lean();

    return NextResponse.json({ items: cart?.items || [] });
  } catch (error) {
    console.error("[CART GET]", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

// POST /api/cart — add or update item
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { userId, guestId } = await getIdentity(req);
    const body = await req.json();
    const { productId, name, price, priceDisplay, image, category, quantity = 1 } = body;

    if (!productId || !name || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const query = userId ? { userId } : { guestId };
    let cart = await Cart.findOne(query);

    if (!cart) {
      cart = new Cart({ ...query, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (i: { productId: number }) => i.productId === productId
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, name, price, priceDisplay, image, category, quantity });
    }

    await cart.save();

    // Set guestId cookie if new guest
    const response = NextResponse.json({ items: cart.items, success: true });
    if (!userId && !guestId) {
      const newGuestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      cart.guestId = newGuestId;
      await cart.save();
      response.cookies.set("cafe_guest_id", newGuestId, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
        httpOnly: true,
        sameSite: "lax",
      });
    }

    return response;
  } catch (error) {
    console.error("[CART POST]", error);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}

// DELETE /api/cart — remove an item or clear cart
export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const { userId, guestId } = await getIdentity(req);
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const clearAll = searchParams.get("clear") === "true";

    const query = userId ? { userId } : { guestId };
    const cart = await Cart.findOne(query);

    if (!cart) {
      return NextResponse.json({ items: [] });
    }

    if (clearAll) {
      cart.items = [];
    } else if (productId) {
      cart.items = cart.items.filter(
        (i: { productId: number }) => i.productId !== parseInt(productId)
      );
    }

    await cart.save();
    return NextResponse.json({ items: cart.items, success: true });
  } catch (error) {
    console.error("[CART DELETE]", error);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}

// PATCH /api/cart — update item quantity
export async function PATCH(req: NextRequest) {
  try {
    await connectToDatabase();
    const { userId, guestId } = await getIdentity(req);
    const { productId, quantity } = await req.json();

    const query = userId ? { userId } : { guestId };
    const cart = await Cart.findOne(query);

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const item = cart.items.find(
      (i: { productId: number }) => i.productId === productId
    );
    if (item) {
      if (quantity <= 0) {
        cart.items = cart.items.filter(
          (i: { productId: number }) => i.productId !== productId
        );
      } else {
        item.quantity = quantity;
      }
    }

    await cart.save();
    return NextResponse.json({ items: cart.items, success: true });
  } catch (error) {
    console.error("[CART PATCH]", error);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}
