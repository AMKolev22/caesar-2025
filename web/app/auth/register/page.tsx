"use client"

import { RegisterForm } from "@/components/register-form";
import { ModeToggle } from "@/components/toggle-mode";

export default function Home() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <ModeToggle className="absolute top-0 right-0 hover:cursor-pointer" />
      <div className="w-full max-w-sm">
        <RegisterForm />
      </div>
    </div>
  );
}
