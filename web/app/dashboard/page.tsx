"use client"
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession(); 

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated" || !session) {
      router.push("/auth/login");
      return;
    }

    const getUser = async () => {
      try {
        const res = await fetch("/api/who", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          router.push("/auth/login");
          return;
        }

        const resAllowed = await fetch("/api/auth/isAllowed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.user.email }),
        });

        const resData = await resAllowed.json();

        if (!resData.allowed) {
          router.push("/not-allowed");
        } 
        else {
          router.push(`/dashboard/${data.user.rank.toLowerCase()}`);
        }
      } catch (err) {
        console.error("Error in getUser:", err);
        router.push("/auth/login");
      }
    };

    getUser();
  }, [status, session]); // depends on session status

  return <h1>Redirecting...</h1>;
}