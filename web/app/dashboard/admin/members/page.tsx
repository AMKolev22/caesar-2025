"use client"

import { AppSidebar } from "@/components/app-siderbar-admin"
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { 
  Search, 
  MoreHorizontal, 
} from 'lucide-react';


import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

export default function Page() {
 const [searchTerm, setSearchTerm] = useState("");
 const [users, setUsers] = useState([]);
 const [expandedUserId, setExpandedUserId] = useState(null);

 const getUsers = async () => {
    const res = await fetch('/api/config/organisationInfo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    const data = await res.json();
    setUsers(data.data[0]?.users || []);
    console.log(data.data[0]?.users);
 }

 useEffect(()=>{
     getUsers();
 }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-y-hidden">
          <div className="flex-1 rounded-xl bg-muted/50 p-4 md:h-auto max-h-[100vh] overflow-y-hidden">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-semibold">Current Members</h1>
            </div>

            {/* search and filter controls (topnav) */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search a person's name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div> 
            </div>


            <ScrollArea className="h-full w-full">
              <div className="space-y-2 pr-2">
            {users.map((userEntry) => {
            const user = userEntry.user;
            const userId = userEntry.userId;
            const requests = user.requests || [];
            const hasRequests = requests.length > 0;

            // Count statuses
            const statusCounts = requests.reduce(
                (acc, req) => {
                acc[req.status] = (acc[req.status] || 0) + 1;
                return acc;
                },
                {}
            );

            return (
                <div
                key={userId}
                className="border border-zinc-700 text-white px-4 py-3 rounded-md space-y-2"
                >
                <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() =>
                    setExpandedUserId(userId === expandedUserId ? null : userId)
                    }
                >
                    <div className="flex-1 font-medium">{user.name}</div>
                    <div className="flex items-center gap-6 text-sm text-zinc-300">
                    <div>
                        <span className="font-semibold text-white">Email:</span>{" "}
                        {user.email}
                    </div>
                    <div className="flex items-center gap-1">

                         {/* approved requests counter */}
                        <span className="font-semibold text-white">Approved:</span>
                        <span className={`font-semibold ${hasRequests ? "text-emerald-400" : "text-zinc-400"}`}>
                        {hasRequests && statusCounts.APPROVED > 0 ? statusCounts.APPROVED : "None"}
                        </span>

                        {/* denied requests counter */}
                        <span className="font-semibold text-white">Denied:</span>
                        <span className={`font-semibold ${hasRequests ? "text-red-500" : "text-zinc-400"}`}>
                        {hasRequests && statusCounts.DENIED > 0 ? statusCounts.DENIED : "None"}
                        </span>

                        {/* pending requests counter */}
                        <span className="font-semibold text-white">Pending:</span> 
                        <span className={`font-semibold ${hasRequests ? "text-yellow-400" : "text-zinc-400"}`} >
                        {hasRequests && statusCounts.PENDING > 0  ? statusCounts.PENDING : "None"}
                        </span>

                    </div>
                    </div>
                    <MoreHorizontal
                    className="w-5 h-5 text-zinc-400 ml-4 cursor-pointer"
                    onClick={() =>
                        setExpandedUserId(userId === expandedUserId ? null : userId)
                    }
                    />
                </div>

                {/* Request status summary */}

                {expandedUserId === userId && (
                    <div className="mt-4 border-t border-zinc-600 pt-4 space-y-2">
                    <h4 className="font-semibold text-white">Requests</h4>
                    {hasRequests ? (
                        <ul className="list-disc list-inside text-zinc-300 text-sm">
                        {requests.map((req, idx) => {
                            const statusTextColors = {
                            APPROVED: "text-emerald-400",
                            DENIED: "text-red-500",
                            PENDING: "text-yellow-400",
                            };

                            const statusText =
                            statusTextColors[req.status] || "text-gray-400";

                            return (
                            <li
                                key={idx}
                                className="text-sm text-zinc-300 flex items-center justify-between mb-2 p-2 rounded-md border border-zinc-600"
                            >
                                <div>
                                <span className="font-medium text-white font-semibold">
                                    [ {req.type} ]
                                </span>{" "}
                                item: #{req.itemId} <br />
                                <span className="font-regular">
                                    created:{" "}
                                    {new Date(req.createdAt).toDateString()} at{" "}
                                    {new Date(req.createdAt).toLocaleTimeString()}
                                </span>
                                </div>
                                <span
                                className={`px-2 py-1 text-xs font-semibold ${statusText}`}
                                >
                                <span className="text-white">STATUS: </span>
                                {req.status}
                                </span>
                            </li>
                            );
                        })}
                        </ul>
                    ) : (
                        <p className="text-zinc-400 text-sm">No requests found.</p>
                    )}
                    </div>
                )}
                </div>
            );
            })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}