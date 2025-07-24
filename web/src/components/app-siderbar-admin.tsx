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
          url: "/dashboard/admin",
        },
        {
          title: "My items",
          url: "#",
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
          url: "/dashboard/admin/members",
        },
        {
          title: "View inventory",
          url: "/dashboard/admin/inventory",
        },
        {
          title: "View Requests",
          url: "#",
        },
      ],
    },
    {
      title: "Helpful",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Create new organisation",
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
          method: "GET",
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

  const handleLogout = async () => {
    const res = await fetch("/api/logout", {
      method: "PUT",
      credentials: "include",
    })
    const data = await res.json();
    if (res.ok && data.success)
      router.push("/auth/login");
  };



  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Caesar</span>
                  <span className="truncate text-xs">Solutions</span>
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
            <DropdownMenuItem className="cursor-pointer hover:-translate-y-0 duration-300" onClick={() => handleLogout()}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
