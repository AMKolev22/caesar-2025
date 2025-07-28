"use client"

import { Package, CheckCircle } from "lucide-react";
import Breadcrumb from '@/components/breadcrumb';
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react";
import { Typewriter } from "@/components/Typewriter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from "next/navigation";

export default function Page() {
  const [user, setUser] = useState({
    assignedItems: [],
    email: "",
    id: null,
    isAdmin: false,
    name: "",
    organisations: [],
    requests: [],
  })
  const [myRequests, setMyRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const router = useRouter();

  const fetchUserRequests = async (userEmail) => {
    if (!userEmail) {
      setRequestsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/core/requests/myRequests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail })
      });

      if (res.ok) {
        const data = await res.json();
        // Filter to only show approved requests
        const approvedRequests = (data.requests || []).filter(req => req.status === 'APPROVED');
        setMyRequests(approvedRequests);
        console.log(approvedRequests)
      }
    }
    catch (error) {
      console.error('Network error:', error);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    const userObj = {
      assignedItems: [],
      email: "",
      id: null,
      isAdmin: false,
      name: "",
      organisations: [],
      requests: [],
    };

    const fetchSessionInfo = async () => {
      try {
        const sessionRes = await fetch("/api/who", {
          method: "GET",
          headers: { 'Content-Type': 'application/json' },
          credentials: "include"
        });

        const session = await sessionRes.json();
        console.log("session info: ", session);

        userObj.email = session.user.email;
        userObj.name = session.user.name;

        const resAllowed = await fetch('/api/auth/isAllowed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: session.user.email }),
        });

        const resData = await resAllowed.json();
        if (!resData.allowed)
          router.push("/not-allowed")

        const userRes = await fetch("/api/userData", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userObj.email }),
        });

        const userData = await userRes.json();
        userObj.requests = userData.user.requests;
        userObj.assignedItems = userData.user.assignedItems;
        userObj.organisations = userData.user.organisations;

        if (!userRes.ok) {
          console.error(userData.error);
          return;
        }
        setUser(userObj);
        fetchUserRequests(userObj.email);
      }
      catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchSessionInfo();
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <span className="mt-4 "><Breadcrumb /></span>
          </div>
        </header>
        <div className="flex-1 rounded-xl bg-muted/50 p-2 sm:p-4 md:h-auto mx-2 sm:mx-4 mb-2 sm:mb-4">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <span className="font-semibold text-lg sm:text-xl mt-2 sm:mt-4 ml-2 sm:ml-4">
              <Typewriter bold={true} text={`Here are your assigned items, ${user.name}.`} speed={60} />
            </span>
          </div>
          <div className="flex flex-col gap-4 sm:gap-6 mt-8 sm:mt-14">
            <div className="space-y-3 px-2 sm:px-4">
              {requestsLoading ? (
                <div className="flex items-center justify-center py-8 sm:py-12">
                  <div className="text-xs sm:text-sm text-zinc-400 font-semibold animate-pulse absolute top-1/2">Loading your items...</div>
                </div>
              ) : myRequests.length === 0 ? (
                <div className="flex items-center justify-center py-8 sm:py-12">
                  <div className="text-xs sm:text-sm text-zinc-400 font-semibold animate-pulse absolute top-1/2">No assigned items found</div>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3 overflow-y-auto mb-3">
                  {myRequests
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg border">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          {req.item?.product?.imageUrl ? (
                            <img
                              src={req.item.product.imageUrl}
                              alt={req.item.product.name}
                              className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-md border flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md border flex items-center justify-center flex-shrink-0">
                              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs sm:text-sm truncate flex flex-wrap items-center gap-1">
                              <span className="sm:inline hidden mr-1">{req.item?.serialCode || 'N/A'}</span>
                              {req.item?.product?.labels?.map((label, idx) => (
                                <Badge
                                  key={label.id}
                                  style={{
                                    backgroundColor: `${label.color}33`,
                                    color: label.color,
                                    boxShadow: `inset 0 0 0 1px ${label.color}80`,
                                  }}
                                  className="text-xs font-medium mr-1 px-2 py-0.5 rounded-md border-0"
                                >
                                  {label.name}
                                </Badge>
                              ))}
                            </div>
                            <div className="text-xs text-white">
                              <span className="">{req.item?.product?.name || 'Unknown Product'} • </span>
                              <span className="text-zinc-400 text-xs">
                                {new Date(req.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          <Badge
                            variant="outline"
                            className="text-xs px-1 sm:px-2 py-1 text-emerald-500 bg-emerald-500/10 border-emerald-500/200"
                          >
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3" />
                              <span className="hidden sm:inline">APPROVED</span>
                              <span className="sm:hidden text-xs">APP</span>
                            </div>
                          </Badge>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}