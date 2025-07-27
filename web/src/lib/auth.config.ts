import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from "next-auth/providers/credentials";

import { AuthOptions, NextAuthOptions } from "next-auth";
import jwt from 'jsonwebtoken';


export const authConfig: AuthOptions | NextAuthOptions = {
  // Secret used to encrypt JWT and session tokens
  secret: process.env.NEXTAUTH_SECRET,

  // Custom pages, here this is for custom singin page
  pages: {
    signIn: '/auth/login',
  },

  // Authentication providers
  providers: [
    // Google OAuth provider
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),

    // Custom credentials provider that authenticates users via an emailed code
    CredentialsProvider({
      name: "Code Login",
      credentials: {
        email: { label: "Email", type: "text" },
        code: { label: "Code", type: "text" },
      },

      // Custom authorize function validates the email + code by calling an API endpoint
      async authorize(credentials) {
        const res = await fetch(`${process.env.NEXTAUTH_URL}/api/smtp/verifyCode`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials?.email,
            enteredCode: credentials?.code,
          }),
        });

        const data = await res.json();

        // If verification succeeded, return user object for session
        if (res.ok && data.success) {
          return {
            id: credentials?.email,
            email: credentials?.email,
            name: data.name || "User",
          };
        }

        // Return null to indicate failed authentication
        return null;
      },
    }),
  ],

  callbacks: {
    // Handles redirects after sign in/out
    async redirect({ url, baseUrl }) {
      // If relative URL, prepend baseUrl
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow redirect if the URL has the same origin as baseUrl
      else if (new URL(url).origin === baseUrl) return url;
      // Otherwise redirect to home
      return baseUrl;
    },

    // Runs after a user signs in, before JWT and session creation
    async signIn({ user }) {
      console.log("NextAuth signIn callback:", { user });

      try {
        // Call custom backend login API to get JWT token for the user
        const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email }),
        });

        if (!res.ok) {
          console.error("Custom login failed:", await res.text());
          return false; // Deny sign in if backend login fails
        }

        const { jwtToken } = await res.json();

        // Attach the custom JWT token to the user object for later use
        (user as any).customJwt = jwtToken;

        return true; // Allow sign in
      } catch (err) {
        console.error("Error in signIn callback:", err);
        return false; // Deny sign in on error
      }
    },

    // Runs when JWT is created or updated
    async jwt({ token, user }) {
      // On first sign-in, copy the custom JWT from user object to token
      if (user) {
        token.customJwt = (user as any).customJwt || null;
      }
      return token;
    },

    // Runs when a session object is created (client side)
    async session({ session, token }) {
      // Pass the custom JWT to the session for client usage
      if (token.customJwt)
        session.customJwt = token.customJwt;
      return session;
    },
  },

  // Enable debug messages in development environment
  debug: process.env.NODE_ENV === 'development',
};

