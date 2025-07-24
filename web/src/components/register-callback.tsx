"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { showToast } from "@/scripts/toast"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SendIcon } from "lucide-react"
import Cookies from 'js-cookie';
import { useEffect, useState } from "react"

type RegisterFormProps = React.ComponentProps<'div'> & {
  callback?: string;
}
export function RegisterForm({ className, callback, ...props }: RegisterFormProps){

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
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
          
          if (res.ok) {
            router.push(callback)
            return;
          }
        } 
        catch (err) {
          console.error(err);
        }
      };

      getUser();
    }, []);
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome here</CardTitle>
          <CardDescription>
            Login with your Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={async (e) => {
              e.preventDefault(); // prevents page reload

              const res = await fetch('/api/smtp/verifyCode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, enteredCode: code }),
              });

              const data = await res.json();
              const resRegister = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name: name, isAdmin: false }),
              })
              const resAdd = await fetch('/api/config/addUserDev', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name: name, isAdmin: false }),
              })
              
              const dataRegister = await resRegister.json();
              const dataAdd = await resAdd.json();
              if (res.ok && data.success && resRegister.ok) {
                showToast({
                  show: `${data.message}`,
                  description: "success",
                  label: dataRegister.message,
                });
                console.log(dataAdd.data);
                router.push(callback);
              } else {
                showToast({
                  show: "Register error",
                  description: "error",
                  label: dataRegister.message || "An error occurred.",
                });
              }
            }}
          >
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Login with Google
                </Button>
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  OR ENTER AN EMAIL
                </span>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="lolololo@negros.com"
                    required
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="text">Name</Label>
                  <Input
                    id="text"
                    type="text"
                    placeholder="John the Doe the Don"
                    required
                    autoComplete="off"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    type="text"
                    placeholder="XXXXXX"
                    required
                    autoComplete="off"
                    className="w-[50%]"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                <span onClick={async () =>{
                  const code = Math.floor(100000 + Math.random() * 900000);
                  showToast({
                    show: "Check your inbox.",
                    description: "success",
                    label: `A code was just sent to ${email}`,
                  });
                  await fetch('/api/smtp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      to: email,
                      subject: 'Verification code',
                      text: `Your code is: ${code}`,
                      html: `<p><b>Your code is: ${code}</b></p>`,
                    }),
                  });
                  await fetch('/api/smtp/queryCode', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email,
                      code,
                    }),
                  });
                  
                }}>
                  <Button variant="ghost" size="icon" className="rounded-md border">
                    <SendIcon className="w-4 h-4" />
                  </Button>
                </span>
                </div>
                    <Button className="w-full" type="submit">
                      Register
                    </Button>
              </div>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <a href="/auth/login" className="underline underline-offset-4">
                  Sign in
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
