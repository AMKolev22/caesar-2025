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
        
        if (!res.ok) {
          console.log(res.err);
          console.log(res.error);
          router.push("/auth/login")
          return;
        }
        else
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
