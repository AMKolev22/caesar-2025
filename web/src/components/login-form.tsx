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

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const router = useRouter();

  useEffect(()=>{
    let cookie = Cookies.get("email")
      if (cookie)
          router.push("/dashboard")
  })
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
        <form
          onSubmit={async (e) => {
            e.preventDefault();

            const verifyRes = await fetch('/api/smtp/verifyCode', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, enteredCode: code }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              const loginRes = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
                credentials: 'include',
              });

              const loginData = await loginRes.json();

              if (loginRes.ok && loginData.success) {
                showToast({
                  show: 'Logged in!',
                  description: 'success',
                  label: verifyData.message,
                });
                // Cookies.set('email', email, { expires: 2 }); 
                router.push('/dashboard');
              } else {
                showToast({
                  show: 'Login failed',
                  description: 'error',
                  label: loginData.error || 'Problem logging in.',
                });
              }
            } else {
              showToast({
                show: 'Verification failed',
                description: 'error',
                label: verifyData.error || 'Invalid code.',
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
                      Login
                    </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="/auth/register" className="underline underline-offset-4">
                  Register now
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
