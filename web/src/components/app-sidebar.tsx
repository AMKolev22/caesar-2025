"use client"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import * as React from "react"
import {
  Bot,
  SquareTerminal,
} from "lucide-react"
import Cookies from "js-cookie";
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
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
import { useRouter } from "next/navigation";

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
          url: "/dashboard/user",
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
          title: "View inventory",
          url: "/dashboard/user/request",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
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

  const handleLogout = () => {
    Cookies.remove("email");
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
          <DropdownMenuTrigger>
            <NavUser user={{ name: name, email: Cookies.get('email') || '', avatar: "/" }} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 inline">
            <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
