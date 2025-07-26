"use client"
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner"
import { SessionProvider } from "next-auth/react";
 
import "./globals.css";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning style={{ colorScheme: "dark" }}>
      <head />
      <body className="overflow-y-hidden">
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <main>{children}</main>
            <Toaster richColors />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
