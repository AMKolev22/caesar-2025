"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Typewriter } from "@/components/Typewriter";
import { ScrollArea } from "@/components/ui/scroll-area";
export default function Page() {

  const [name, setName] = useState("");

  useEffect(() => {
    let email = Cookies.get('email');
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
          console.error(data.error);
          return;
        }

        setName(data.user.name);
      } 
      catch (err) {
        console.error(err);
      }
    };

    getUser();
  }, []);


  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>

        <div className="flex-1 rounded-xl bg-muted/50 p-4 md:h-auto ml-4 mr-4 mb-4">
            <div className="flex items-center justify-between mb-6">
              <span className="font-semibold text-xl mt-4 ml-4">
                <Typewriter bold={true} text={`Welcome back, ${name}.`} speed={60} />
              </span>
            </div>
            <div className="flex font-semibold justify-between mt-16">
              <h1 className="ml-4">Here's an overview of your borrowed items</h1>
              <h1 className="mr-4">Here's the status of your 3 most recent requests</h1>
            </div>
          {/* <h1>You have X pending, Y, acceppted, Z denied requests.</h1> */}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
