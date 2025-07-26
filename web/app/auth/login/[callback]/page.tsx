"use client"

import { LoginForm } from "@/components/login-callback";
import { ModeToggle } from "@/components/toggle-mode";
import { useParams } from "next/navigation";

export default function Home() {
const params = useParams();
let callback = params?.callback as string;
callback = callback.replaceAll('-', '/');
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      {/* <ModeToggle className="absolute top-0 right-0 hover:cursor-pointer" /> */}
      <div className="w-full max-w-sm">
        <LoginForm callback={`/${callback}`} />
      </div>
    </div>
  );
}
