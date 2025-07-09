"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react"
import Cookies from "js-cookie";
import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
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
          url: "#",
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
          url: "#",
        },
        {
          title: "View inventory",
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
          title: "Join organisation",
          url: "#",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

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
        <NavUser user={{name: name, email: Cookies.get('email') || '', avatar: "/"}}/>
      </SidebarFooter>
    </Sidebar>
  )
}
