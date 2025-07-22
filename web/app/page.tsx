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

  // useEffect(()=>{
  //   const setup = async () => {
  //     try {
  //       const res = await fetch('/api/config/setupOrg', {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({ "":"" }),
  //       });

  //       const data = await res.json();
  //       console.log(data);

  //       if (!res.ok) {
  //         console.error(data.error);
  //         return;
  //       }
  //     } 
  //     catch (err) {
  //       console.error(err);
  //     }
  //   };
  //   setup();
  // })

  return (
    <h1>
      nate hegros
    </h1>
  );
}