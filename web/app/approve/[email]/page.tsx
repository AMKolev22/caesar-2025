"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function Page() {
    const params = useParams();
    const email = decodeURIComponent(params.email);
    const router = useRouter();
    const [status, setStatus] = useState<"pending" | "success" | "error">("pending");

    useEffect(() => {
        console.log(email);
        const approveUser = async () => {
            try {
                const res = await fetch("/api/auth/approve", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                });

                const result = await res.json();

                if (res.ok && result.success) {
                    setStatus("success");
                    console.log(result);
                    router.push("/dashboard");
                } 
                else {
                    setStatus("error");
                    console.error("Approval error:", result.error);
                }
            } 
            catch (err) {
                console.error("error:", err);
                setStatus("error");
            }
        };

        if (email) 
            approveUser();
    }, [email]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white px-6">
            <div className="text-center space-y-4">
                {status === "pending" && <p className="text-lg">Approving user <span className="pulse">{email}</span>...</p>}
                {status === "success" && <p className="text-lg text-green-400">User approved successfully</p>}
                {status === "error" && <p className="text-lg text-red-400">Failed to approve user.</p>}
            </div>
        </div>
    );
}
