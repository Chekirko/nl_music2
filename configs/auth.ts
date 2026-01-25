import User from "@/models/user";
import { connectToDB } from "@/utils/database";
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcryptjs from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image: string;
      role: string;
    };
  }
}

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    image: string;
    role: string;
  }
}

export const authConfig: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {},
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };
        try {
          await connectToDB();
          const user = await User.findOne({ email: email.toLowerCase().trim() });
          if (!user) {
            throw new Error("USER_NOT_FOUND");
          }
          // Check if user has a password (might be Google-only)
          if (!user.password) {
            throw new Error("GOOGLE_ONLY_USER");
          }
          const passwordsMatch = await bcryptjs.compare(
            password,
            user.password
          );
          if (!passwordsMatch) {
            throw new Error("INVALID_PASSWORD");
          }
          return user;
        } catch (error) {
          console.log("Error:", error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const { name, email, image } = user;
          if (!email) return false;
          
          await connectToDB();
          const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
          
          if (existingUser) {
            // User exists - link Google account if not already linked
            if (!existingUser.googleId) {
              existingUser.googleId = user.id;
              // If user had credentials, now has both
              if (existingUser.password) {
                existingUser.authProvider = "both";
              } else {
                existingUser.authProvider = "google";
              }
              if (image && !existingUser.image) {
                existingUser.image = image;
              }
              await existingUser.save();
            }
            return true;
          }
          
          // Create new user via Google
          const newUser = new User({
            name: name,
            email: email.toLowerCase().trim(),
            image: image,
            googleId: user.id,
            authProvider: "google",
            role: "user",
          });
          await newUser.save();
          return true;
        } catch (err) {
          console.log("Google sign in error:", err);
          return false;
        }
      }
      return true;
    },
    
    async jwt({ token, user, account }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      
      // For Google sign-in, fetch role from database
      if (account?.provider === "google" && token.email) {
        try {
          await connectToDB();
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
            token.role = dbUser.role;
            token.name = dbUser.name;
            token.authProvider = dbUser.authProvider;
          }
        } catch (err) {
          console.log("JWT callback error:", err);
        }
      }
      
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
        (session.user as any).authProvider = token.authProvider as string;
      }
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      // After sign in, redirect to /songs
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return `${baseUrl}/songs`;
    },
  },
  secret: process.env.NEXTAUTH_SECRET!,
  pages: {
    signIn: "/login-page",
    newUser: "/signup-page",
  },
};
