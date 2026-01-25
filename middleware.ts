import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(_req) {
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
