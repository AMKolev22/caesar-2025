"use client"
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from 'next/navigation';

export default function Home() {
  const [rank, setRank] = useState("");
  const router = useRouter();

  useEffect(() => {
    const email = Cookies.get('email');
    if (!email) return;

    const getUser = async () => {
      try {
        const res = await fetch('/api/userData', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();
        console.log(data);
        
        if (!res.ok) {
          console.log(res.err);
          console.log(res.error);
          router.push("/auth/login")
          return;
        }
        setRank(data.user.rank);
      } 
      catch (err) {
        console.error(err);
      }
    };

    getUser();
  }, []);
  useEffect(()=>{
    if (rank == "") return;
    if (rank == "USER") router.push("/dashboard/user");
    if (rank == "ADMIN") router.push("/dashboard/admin");
    if (rank == "MANAGER") router.push("/dashboard/manager");
  });

  return <h1>Redirecting...</h1>;
}
