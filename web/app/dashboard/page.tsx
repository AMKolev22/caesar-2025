"use client"
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {

    const getUser = async () => {
      console.log("test");
      try {
        const res = await fetch('/api/who', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });


        const data = await res.json();
        console.log(data);

        const resAllowed = await fetch('/api/auth/isAllowed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.user.email }),
        });

        const resData = await resAllowed.json();
        console.log(resData);

        if (!res.ok) {
          console.log(res.err);
          console.log(res.error);
          router.push("/auth/login")
          return;
        }
        else if (!resData.allowed)
          router.push("/not-allowed")

        else if (resData.allowed)
          router.push(`/dashboard/${data.user.rank.toLowerCase()}`)
      }
      catch (err) {
        console.error(err);
      }
    };

    getUser();
  }, []);

  return <h1>Redirecting...</h1>;
}
