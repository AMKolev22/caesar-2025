"use client"

import * as React from "react"
import {
    Bot,
    SquareTerminal,
    Shield,
    Crown,
    User,
} from "lucide-react"
import Cookies from "js-cookie";
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { useRouter } from "next/navigation";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { signOut } from "next-auth/react";

const data = {
    navMain: [
        {
            title: "Essentials",
            url: "#",
            icon: SquareTerminal,
            isActive: true,
            items: [
                {
                    title: "Overview",
                    url: "/dashboard/manager",
                },
                {
                    title: "My items",
                    url: "/dashboard/user/items",
                },
                {
                    title: "My requests",
                    url: "/dashboard/user/myRequests",
                },
            ],
        },
        {
            title: "Organisation",
            url: "#",
            icon: Bot,
            items: [
                {
                    title: "View members",
                    url: "/dashboard/manager/members",
                },
                {
                    title: "View inventory",
                    url: "/dashboard/manager/inventory",
                },
                {
                    title: "View Requests",
                    url: "/dashboard/manager/requests",
                },
            ],
        },
        {
            title: "Helpful",
            url: "#",
            icon: Bot,
            items: [
                {
                    title: "Approve People",
                    url: "#",
                },
                {
                    title: "Invite members",
                    url: "#",
                },
            ],
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

    const getRankIcon = (rank) => {
        switch (rank) {
            case 'ADMIN':
                return <Shield className="w-4 h-4" />;
            case 'MANAGER':
                return <Crown className="w-4 h-4" />;
        }
    };



    const router = useRouter();
    const [rank, setRank] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/who', {
                    credentials: 'include'
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    console.log(data);
                    setRank(data.user.rank);
                    setEmail(data.user.email);
                    setName(data.user.name);
                }
            }
            catch (err) {
                console.error('Failed to fetch user:', err);
            }
        };

        fetchUser();
    }, []);




    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-900 rounded transition">
                                <img
                                    src="/caesar-logo.png"
                                    alt="Caesar Solutions Logo"
                                    className="h-10 w-auto"
                                />
                                <div className="flex flex-col">
                                    <span className="font-bold text-md mt-1 leading-tight">Caesar</span>
                                    <span className="text-xs text-zinc-500 font-medium tracking-wide">Solutions</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center gap-2 cursor-pointer">
                            <NavUser user={{ name: name, email: email || '', avatar: "/" }} />
                            {rank && (
                                <Badge
                                    className={
                                        rank === "USER" ? "text-blue-500 bg-blue-500/20" :
                                            rank === "ADMIN" ? "text-red-500 bg-red-500/20" :
                                                "text-emerald-400 bg-emerald-400/20"
                                    }
                                >
                                    {getRankIcon(rank)}
                                    {rank}
                                </Badge>
                            )}
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-8 hover:-translate-y-1 duration-300">
                        <DropdownMenuItem className="cursor-pointer hover:-translate-y-0 duration-300" onClick={() => signOut({ callbackUrl: "/api/auth/signin" })}>Log out</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
