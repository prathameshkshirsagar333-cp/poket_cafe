import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // Protect all routes including home page, except auth pages, apis and static assets
  matcher: [
    "/((?!login|signup|api|_next/static|_next/image|favicon.ico|.*\\..*).*)"
  ],
};
