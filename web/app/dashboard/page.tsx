"use client"
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from 'next/navigation';

export default function Home() {
  const [admin, setAdmin] = useState<boolean | null>(null); // null for uninitialized
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

        if (!res.ok) {
          console.error('Error fetching user:', data.error);
          return;
        }

        setAdmin(data.user?.isAdmin ?? false); 
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };

    getUser();
  }, []);

  useEffect(() => {
    if (admin === null) return; // skip on first render

    if (admin)
      router.push('/dashboard/admin');
    else 
      router.push('/dashboard/user');
  }, [admin]);

  return <h1>Redirecting...</h1>;
}
