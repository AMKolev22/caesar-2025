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
import { signIn } from "next-auth/react"
import { createVerificationEmailTemplate } from "@/lib/emailTemplates"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();
  const googleSign = async () => {
    const res = await signIn("google", { callbackUrl: '/auth/register' });
  };
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
          router.push(`/dashboard/${data.user.rank.toLowerCase()}`)
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
              await signIn("credentials", {
                email,
                code,
                redirect: false,
                callbackUrl: "/dashboard",
              });

              showToast({
                show: `${data.message}`,
                description: "success",
                label: dataRegister.message,
              });

              router.push("/dashboard");
            }
          }}
          >
            <div className="grid gap-6">

              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Enter an email or username
                </span>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="test@gmail.com"
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
                    placeholder="John Don"
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
                  <span onClick={async () => {
                    const code = Math.floor(100000 + Math.random() * 900000);
                    showToast({
                      show: "Check your inbox.",
                      description: "success",
                      label: `A code was just sent to ${email}`,
                    });
                    const emailTemplate = createVerificationEmailTemplate({
                      code: code.toString(),
                      recipientName: name || 'User',
                      appName: 'Caesar',
                      type: 'signup'
                    });
                    await fetch('/api/smtp', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        to: email,
                        subject: emailTemplate.subject,
                        text: emailTemplate.text,
                        html: emailTemplate.html,
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
