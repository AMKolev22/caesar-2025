import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from "next-auth/providers/credentials";

import { AuthOptions, NextAuthOptions } from "next-auth";
import jwt from 'jsonwebtoken';


export const authConfig: AuthOptions | NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/auth/login',
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID as string,
            clientSecret: process.env.GOOGLE_SECRET as string,
        }),
        CredentialsProvider({
            name: "Code Login",
            credentials: {
                email: { label: "Email", type: "text" },
                code: { label: "Code", type: "text" },
            },
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

                if (res.ok && data.success) {
                    return {
                        id: credentials?.email,
                        email: credentials?.email,
                        name: data.name || "User",
                    };
                }

                return null;
            },
        })
    ],
    callbacks: {
        async redirect({ url, baseUrl }) {
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            else if (new URL(url).origin === baseUrl) return url;
            return baseUrl;
        },

        async signIn({ user }) {
            console.log("NextAuth signIn callback:", { user });

            try {
                const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: user.email }),
                });

                if (!res.ok) {
                    console.error("Custom login failed:", await res.text());
                    return false;
                }

                const { jwtToken } = await res.json();
                (user as any).customJwt = jwtToken;

                return true;
            } catch (err) {
                console.error("Error in signIn callback:", err);
                return false;
            }
        },

        async jwt({ token, user }) {
            // Runs on sign-in
            if (user) {
                token.customJwt = (user as any).customJwt || null;
            }
            return token;
        },

        async session({ session, token }) {
            if (token.customJwt) {
                session.customJwt = token.customJwt;
            }
            return session;
        },
    },
    debug: process.env.NODE_ENV === 'development',
};
