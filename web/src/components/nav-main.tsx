"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Button } from "./ui/button"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { useRouter } from "next/navigation"
import { Input } from "./ui/input"
import { createInvitationTemplate, createVerificationEmailTemplate } from "@/lib/emailTemplates"
import { toast } from "sonner"
import { showToast } from "@/scripts/toast"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [data, setData] = useState([{}]);
  const [email, setEmail] = useState('');
  const isEmailValid = /\S+@\S+\.\S+/.test(email);
  const fetchData = async () => {
    try {
      const res = await fetch("/api/config/organisationInfo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result = await res.json();
      const rawUsers = result?.data?.[0]?.users || [];

      const filtered = rawUsers
        .map((item) => item.user)
        .filter((user) => user.allowed === false);

      setData(filtered);
      console.log(filtered);
    }
    catch (error) {
      console.error("Failed to fetch approval data:", error);
    }
  };
  useEffect(() => {
    if (!setOpenApproveDialog) return;


    fetchData();
  }, [setOpenApproveDialog]);

  const handleConfirm = async () => {
    const loadingToast = toast.loading("Sending invite...");

    try {
      const emailTemplate = createInvitationTemplate({
        recipientName: email || "User",
        appName: "Caesar",
        type: "login",
      });

      const response = await fetch("/api/smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject: emailTemplate.subject,
          text: emailTemplate.text,
          html: emailTemplate.html,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send invite");
      }

      showToast({
        show: "Success",
        description: "success",
        label: `Invitation sent to ${email}`,
      });

      setEmail("");
      setOpenInviteDialog(false);
    }
    catch (error) {
      console.error("Invite error:", error);
      showToast({
        show: "Error",
        description: "error",
        label: "Failed to send invitation",
      });
    } finally {
      toast.dismiss(loadingToast);
    }
  };



  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={item.title}>
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          {subItem.title === "Approve People" ? (
                            <SidebarMenuSubButton className="cursor-pointer" onClick={() => setOpenApproveDialog(true)}>
                              <span>{subItem.title}</span>
                            </SidebarMenuSubButton>
                          ) : subItem.title === "Invite members" ? (
                            <SidebarMenuSubButton className="cursor-pointer" onClick={() => setOpenInviteDialog(true)}>
                              <span>{subItem.title}</span>
                            </SidebarMenuSubButton>
                          ) : (
                            <SidebarMenuSubButton asChild>
                              <a href={subItem.url}>
                                <span>{subItem.title}</span>
                              </a>
                            </SidebarMenuSubButton>
                          )}

                        </SidebarMenuSubItem>
                      ))}


                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
        <Dialog open={openApproveDialog} onOpenChange={setOpenApproveDialog}>
          <DialogContent className="max-w-md bg-[#171717] border border-zinc-800">
            <DialogHeader>
              <DialogTitle>Approve People</DialogTitle>
              <DialogDescription className="text-sm text-zinc-400">
                There are currently <span className="text-emerald-400 font-semibold">{data.length}</span> people awaiting <span className="text-emerald-400 font-semibold">approval</span>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 max-h-[300px] overflow-auto" style={{ scrollbarWidth: "thin" }}>
              {data?.length > 0 ? (
                data?.map((user, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center border border-zinc-800 p-2 rounded"
                  >
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-zinc-400">{user.email}</p>
                    </div>
                    <Button size="sm" className="bg-emerald-400/20 text-emerald-400 hover:bg-emerald-500/20 hover:-translate-y-1 duration-300 cursor-pointer" onClick={() => { window.open(`/approve/${user.email}`, '_blank'); setData(prevUsers => prevUsers.filter(u => u.email !== user.email)); }}
                    >
                      Approve
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No users pending approval.</p>
              )}
            </div>

            <DialogFooter>
              <Button className="hover:-translate-y-1 duration-300 cursor-pointer" onClick={() => { setOpenApproveDialog(false) }} variant="secondary">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={openInviteDialog} onOpenChange={setOpenInviteDialog}>
          <DialogContent className="max-w-md bg-[#171717] border border-zinc-800">
            <DialogHeader>
              <DialogTitle>Invite Members</DialogTitle>
              <DialogDescription className="text-sm text-zinc-400">
                Enter the email address of the person you'd like to invite.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Input
                type="email"
                placeholder="john@john.doe"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500"
              />
            </div>

            <DialogFooter className="mt-4">
              <Button
                disabled={!isEmailValid}
                onClick={handleConfirm}
                className="bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 cursor-pointer hover:-translate-y-1 duration-300"
              >
                Confirm
              </Button>
              <Button
                variant="secondary"
                onClick={() => setOpenInviteDialog(false)}
                className="hover:-translate-y-1 duration-300 cursor-pointer"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarMenu>
    </SidebarGroup>
  )
}
