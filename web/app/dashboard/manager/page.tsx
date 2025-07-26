"use client"
import { AppSidebar } from "@/components/app-sidebar-manager"
import Breadcrumb from '@/components/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { showToast } from "@/scripts/toast"
// import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area";
import TestArea from "../admin/test/test"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { MoreHorizontal, Check, X, Router } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const [recentRequests, setRecentRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [lowItems, setLowItems] = useState([]);
  const [repairItems, setRepairItems] = useState([]);
  const [rank, setRank] = useState("");
  const router = useRouter();

useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await fetch('/api/who', {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        console.log("кяеи", data);
        setRank(data.user.rank);
        
        if (data.user.rank !== "MANAGER")
          router.push("/no-permission");
      }
    } 
    catch (err) {
      console.error('Failed to fetch user:', err);
    }
  };

  fetchUser();
}, [router, rank]);
  const fetchRecent = async () => {
    const res = await fetch('/api/core/items/getRecentRequests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      setRecentRequests(data.recent);
      console.log(data.recent);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'BORROW':
        return 'text-blue-500';
      case 'RETURN':
        return 'text-green-500';
      case 'REPAIR':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  const fetchPending = async () => {
    const res = await fetch('/api/core/items/getPendingRequests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      setPendingRequests(data.pending);
      console.log(data.pending);
    }
  };

  const fetchRepair = async () => {
    const res = await fetch('/api/core/items/getRepair', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      setRepairItems(data.pending);
      console.log(data.pending);
    }
  }

  const fetchLowStock = async () => {
    const res = await fetch('/api/test/getLow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      setLowItems(data.inventory);
      console.log(data.inventory);
    }
  };

  useEffect(() => {
    fetchRecent();
    fetchPending();
    fetchLowStock();
    fetchRepair();
  }, []);

  const handleApprove = async (requestId, userEmail, itemSerial) => {
    const res = await fetch('/api/core/items/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId }),
    });
    if (res.ok) {
      console.log('successful');
      fetchRecent();
      fetchPending();
      showToast({
        show: 'Approved a request.',
        description: 'success',
        label: `You successfully approved ${userEmail}'s request for ${itemSerial}.`,
      });
    }
  };

  const handleReject = async (requestId, userEmail, itemSerial) => {
    const res = await fetch('/api/core/items/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId }),
    });
    if (res.ok) {
      console.log('successful');
      fetchRecent();
      fetchPending();
      showToast({
        show: 'Rejected a request.',
        description: 'success',
        label: `You successfully rejected ${userEmail}'s request for ${itemSerial}.`,
      });
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
          <span className="mt-4 "><Breadcrumb /></span>
          <div className="flex items-center gap-2 ml-auto mr-2 sm:mr-4">
            <TestArea />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-3 sm:gap-4 p-2 sm:p-4 pt-0">
          <div className="grid auto-rows-min gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-muted/50 rounded-xl p-4">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-base sm:text-lg lg:text-xl font-semibold">Needs restocking</h1>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500 animate-pulse shadow-glow"></span>
                  <h1 className="text-lg sm:text-xl font-semibold">
                    {lowItems?.length ?? 0}
                  </h1>
                </div>
              </div>
              <div className="space-y-3 max-h-32 sm:max-h-40 overflow-y-auto">
                {(lowItems?.slice(0, 3) ?? []).length > 0 ? (
                  lowItems.slice(0, 3).map(item => (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pb-2 border-b border-zinc-700" key={item.id}>
                      <h1 className="text-zinc-300 text-sm sm:text-base flex-1 min-w-0 truncate">{item.name}</h1>
                      <div className="text-red-400 text-xs sm:text-sm font-semibold whitespace-nowrap">
                        AVAILABLE: <span className="underline font-bold">{item.totalQuantity}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 sm:py-12 text-zinc-400 text-sm">No low-stock items found.</div>
                )}
              </div>
            </div>

            <div className="bg-muted/50 rounded-xl p-4">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-base sm:text-lg lg:text-xl font-semibold">Items for repair</h1>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-orange-400 animate-pulse shadow-glow"></span>
                  <h1 className="text-lg sm:text-xl font-semibold">
                    {repairItems?.length ?? 0}
                  </h1>
                </div>
              </div>
              <div className="space-y-3 max-h-32 sm:max-h-40 overflow-y-auto">
                {(repairItems?.slice(0, 3) ?? []).length > 0 ? (
                  repairItems.slice(0, 3).map(item => (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pb-2 border-b border-zinc-700" key={item.id}>
                      <h1 className="text-zinc-300 text-sm sm:text-base flex-1 min-w-0 truncate">{item.user.email}</h1>
                      <div className="text-orange-400 text-xs sm:text-sm font-semibold whitespace-nowrap">
                        ITEM: <span className="underline font-bold">{item.item.serialCode}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 sm:py-12 text-zinc-400 text-sm">No items for repair found.</div>
                )}
              </div>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 md:col-span-2 lg:col-span-1">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-base sm:text-lg lg:text-xl font-semibold">Pending Requests</h1>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-yellow-400 animate-pulse shadow-glow"></span>
                  <h1 className="text-lg sm:text-xl font-semibold">
                    {pendingRequests?.length ?? 0}
                  </h1>
                </div>
              </div>
              <div className="space-y-3 max-h-32 sm:max-h-40 overflow-y-auto">
                {(pendingRequests?.slice(0, 3) ?? []).length > 0 ? (
                  pendingRequests.slice(0, 3).map(req => (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 pb-2 border-b border-zinc-700" key={req.id}>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="text-zinc-300 text-sm truncate">{req.user.email}</div>
                        <div className="flex gap-2 text-xs">
                          <span className="text-white font-semibold">{req.item.serialCode}</span>
                          <span className={`font-semibold ${getTypeColor(req.type)}`}>
                            {req.type}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 sm:gap-3 justify-start sm:justify-end">
                        <button
                          className="text-emerald-400 hover:bg-emerald-400/10 p-1.5 rounded-md transition-all duration-300 hover:-translate-y-0.5"
                          onClick={() => handleApprove(req.id, req.user.email, req.item.serialCode)}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-md transition-all duration-300 hover:-translate-y-0.5"
                          onClick={() => handleReject(req.id, req.user.email, req.item.serialCode)}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 sm:py-12 text-zinc-400 text-sm">No recent requests found.</div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 rounded-xl bg-muted/50 p-3 sm:p-4 md:h-auto max-h-[700px] sm:max-h-[600px] flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
              <h1 className="text-lg sm:text-xl font-semibold">Latest requests</h1>
              <div className="text-xs sm:text-sm text-zinc-400 mr-3">
                <span className="mr-3">Showing <span className="text-emerald-400 font-semibold">{Math.min(recentRequests.length, 6)}</span> of <span className="text-emerald-400 font-semibold">{recentRequests.length}</span> requests</span>
                <a href="/dashboard/manager/requests" className="text-white hover:-translate-y-1 duration-300 inline-block">VIEW ALL</a>
              </div>
            </div>
            <div
              className="flex-1 overflow-y-auto pr-1 sm:pr-2"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgb(113 113 122) transparent'
              }}
            >
              <div className="space-y-3 sm:space-y-4">
                {recentRequests.slice(0, 6).map(req => (
                  <DropdownMenu key={req.id}>
                    <div className="border border-zinc-700 text-white p-3 sm:p-4 rounded-md">
                      <div className="block lg:hidden space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="font-medium text-sm sm:text-base flex-1 pr-2">
                            {req.item.product.name}
                          </div>
                          <DropdownMenuTrigger asChild>
                            <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 cursor-pointer flex-shrink-0" />
                          </DropdownMenuTrigger>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                          <div className="text-zinc-300">
                            <span className="font-semibold text-white">FROM:</span> {req.user.email}
                          </div>
                          <div className="text-zinc-300">
                            <span className="font-semibold text-white">ITEM:</span> {req.item.serialCode}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-white">TYPE:</span>
                            <span className={`font-semibold ${getTypeColor(req.type)}`}>
                              {req.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-white">STATUS:</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-xs font-semibold ${req.status.toUpperCase() === 'APPROVED'
                                ? 'text-emerald-400 bg-emerald-400/10'
                                : req.status.toUpperCase() === 'DENIED'
                                  ? 'text-red-500 bg-red-500/10'
                                  : req.status.toUpperCase() === 'PENDING'
                                    ? 'text-yellow-400 bg-yellow-400/10'
                                    : 'text-gray-400 bg-gray-400/10'
                                }`}
                            >
                              {req.status}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-zinc-400">
                          <span className="font-semibold text-white">ITEM STATUS:</span>
                          <span className="text-emerald-400 ml-1">{req.item.status}</span>
                        </div>
                      </div>
                      <div className="hidden lg:flex items-center justify-between">
                        <div className="flex-1 font-medium text-base">{req.item.product.name}</div>
                        <div className="flex items-center gap-4 xl:gap-6 text-sm text-zinc-300">
                          <div className="min-w-0">
                            <span className="font-semibold text-white">FROM:</span>
                            <span className="ml-1 truncate">{req.user.email}</span>
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-white">FOR:</span>
                            <span className="ml-1">{req.item.serialCode}</span>
                          </div>
                          <div className="flex items-center gap-1 min-w-0">
                            <span className="font-semibold text-white">ITEM STATUS:</span>
                            <span className="text-emerald-400">{req.item.status}</span>
                          </div>
                          <div className="flex items-center gap-1 min-w-0">
                            <span className="font-semibold text-white">REQUEST:</span>
                            <span
                              className={`px-2 py-1 rounded font-semibold text-xs ${req.status.toUpperCase() === 'APPROVED'
                                ? 'text-emerald-400'
                                : req.status.toUpperCase() === 'DENIED'
                                  ? 'text-red-500'
                                  : req.status.toUpperCase() === 'PENDING'
                                    ? 'text-yellow-400'
                                    : 'text-gray-400 bg-gray-400/10'
                                }`}
                            >
                              {req.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 min-w-0">
                            <span className="font-semibold text-white">TYPE:</span>
                            <span className={`font-semibold ${getTypeColor(req.type)}`}>
                              {req.type}
                            </span>
                          </div>
                        </div>
                        <DropdownMenuTrigger asChild>
                          <MoreHorizontal className="w-5 h-5 text-zinc-400 ml-4 cursor-pointer flex-shrink-0" />
                        </DropdownMenuTrigger>
                      </div>
                    </div>
                    <DropdownMenuContent className="w-36 cursor-pointer" align="start">
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => handleReject(req.id, req.user.email, req.item.serialCode)}
                        >
                          Reject
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => handleApprove(req.id, req.user.email, req.item.serialCode)}
                        >
                          Approve
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}