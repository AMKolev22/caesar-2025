'use client';

import { useParams } from 'next/navigation';
import { showToast } from '@/scripts/toast';
import "@/styles/typing.css"
import { Typewriter } from '@/components/Typewriter';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
export default function Page() {
    const params = useParams();
    const serialCode = params.serialCode;
    const router = useRouter();
    const [email, setEmail] = useState("");

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

                if (!res.ok) {
                    router.push(`/auth/login/dynamic-${serialCode}`);
                    return;
                }
                setEmail(data.user.email);
            }
            catch (err) {
                console.error(err);
            }
        };

        getUser();
    }, []);

    const borrow = async () => {
        try {
            const res = await fetch("/api/core/items/borrow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ serialCode }),
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
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-none flex flex-col items-center gap-y-4 py-10 rounded-xl max-w-md w-full px-6">
            <h1 className="text-center text-white text-lg font-semibold break-words">
                <Typewriter bold={true} text={`Confirm borrow for ${serialCode}`} speed={60} />
                ?
            </h1>
            <button
                onClick={() => borrow()}
                className="w-44 bg-emerald-400 text-white text-sm font-semibold px-4 py-2 rounded-md hover:-translate-y-1 transition-transform hover:bg-emerald-600"
            >
                CONFIRM BORROW
            </button>
        </div>
    );
}