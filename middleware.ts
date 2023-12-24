import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    console.log(req.nextUrl.pathname);

    if (
      req.nextUrl.pathname.startsWith("/create-song") ||
      (req.nextUrl.pathname.startsWith("/update-song") &&
        req.nextauth.token?.role !== "admin")
    ) {
      return NextResponse.rewrite(new URL("/denied", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/create-song",
    "/update-song",
    "/events/create-new",
    "/events/update-event",
  ],
};
