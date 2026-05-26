import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // Global Access Control: Protect routes automatically, except public pages and assets
  matcher: [
    "/((?!$|cart|checkout|login|signup|api/auth|api/signup|api/cart|api/orders|api/webhooks|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
