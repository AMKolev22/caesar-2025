'use client';

import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { showToast } from '@/scripts/toast';
import Cookies from "js-cookie";

export default function Page() {
  const params = useParams();
  const serialCode = params.serialCode;

  const borrow = async () => {
        const userEmail = Cookies.get("email");
        if (!userEmail) {
        showToast({
            show: "Error",
            description: "error",
            label: "Please log in to make a request",
        });
        return;
        }


        try {
        const res = await fetch("/api/core/items/borrow", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userEmail, serialCode }),
        });

        if (res.ok) {
            showToast({
            show: "Success",
            description: "success",
            label: `Successfully requested (${serialCode})`,
            });
        } 
        else {
            const error = await res.json();
            showToast({
            show: "Error",
            description: "error",
            label: error?.error || "Failed to make request",
            });
        }
        } 
        catch {
        showToast({
            show: "Error",
            description: "error",
            label: "Network error occurred",
        });
        }
    }
  return (
    <div className='border w-fit flex flex-col gap-y-4 absolute top-1/2 left-1/2 translate-[-50%] center px-4 py-4 rounded-xl'>
      <h1 className='text-xl'>Confirm borrowing for <span className='font-bold'>{serialCode}</span>? </h1>
      <Button className='bg-emerald-400 text-white hover:-translate-y-1 duration-300 hover:bg-emerald-600 cursor-pointer' onClick={()=> borrow()}>CONFIRM BORROW</Button>
    </div>
  );
}