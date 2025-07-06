"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const email = Cookies.get("email");
    if (email)
      router.push("/dashboard");
    else
        router.push("/auth/login");
  }, [router]);

  return (
    <h1>
      nate hegros
    </h1>
  );
}