"use client"
import { AppSidebar } from "@/components/app-siderbar-admin"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { showToast } from "@/scripts/toast"
// import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

export default function Page() {

  const [recentRequests, setRecentRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [lowItems, setLowItems] = useState([]);

  // const [currentSelectedRequest, setCurrentSelectedRequest] = useState(0);
  const fetchRecent = async ()=> {
    const res = await fetch('/api/core/items/getRecentRequests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }) 
    if (res.ok){
      const data = await res.json();
      setRecentRequests(data.recent);
      console.log(data.recent);
    }
  }
  const fetchPending = async ()=> {
    const res = await fetch('/api/core/items/getPendingRequests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }) 
    if (res.ok){
      const data = await res.json();
      setPendingRequests(data.pending);
      console.log(data.pending);
    }
  }

  const fetchLowStock = async () => {
     const res = await fetch('/api/test/getLow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }) 
    if (res.ok){
      const data = await res.json();
      setLowItems(data.inventory);
      console.log(data.inventory);
    }
  }

  useEffect(() => {
  fetchRecent();
  fetchPending();
  fetchLowStock();
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
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl">
            <div className="flex">
              <h1 className="ml-4 mt-4 text-xl font-semibold">Needs restocking</h1>
              <div className="items-center justify-end mt-4 flex ml-auto mr-6 gap-4">
                <span className=" w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-glow"></span>
                <h1 className="text-xl font-semibold -mt-1">
                  {lowItems?.length ?? 0 }
                </h1>
              </div>
            </div>
            {(lowItems?.slice(0, 3) ?? []).length > 0 ? (
              lowItems.slice(0, 3).map(item => (
                <div className="flex gap-6 ml-6 mt-6 border-b-1 pb-2 max-w-[90%]" key={item.id}>
                  <h1 className="text-zinc-300">{item.name}</h1>
                  <h1 className="text-red-400 font-regular ml-auto mr-2 font-semibold">
                    AVAILABLE LEFT: <span className="underline font-bold">{item.totalQuantity}</span>
                  </h1>
                </div>
              ))
            ) : (<div className="text-center mt-24 text-zinc-400 font-medium">No low-stock items found.</div>)}
            </div>
            <div className="bg-muted/50 aspect-video rounded-xl">
            <div className="flex">
              <h1 className="ml-4 mt-4 text-xl font-semibold">Items for repair</h1>
              <div className="items-center justify-end mt-4 flex ml-auto mr-6 gap-4">
                <span className=" w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-glow"></span>
                <h1 className="text-xl font-semibold -mt-1 mb-0">
                  0
                </h1>
              </div>
            </div>
            <div className="text-center mt-24 text-zinc-400 font-medium">No items are currently under repair.</div>
            </div>
            <div className="bg-muted/50 aspect-video rounded-xl">
            <div className="flex">
              <h1 className="ml-4 mt-4 text-xl font-semibold">Pending Requests</h1>
              <div className="items-center justify-end mt-4 flex ml-auto mr-6 gap-4">
                <span className=" w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse shadow-glow"></span>
                <h1 className="text-xl font-semibold -mt-1 mb-0">
                  {pendingRequests?.length ?? 0}
                </h1>
              </div>
            </div>
            {(pendingRequests?.slice(0, 3) ?? []).length > 0 ? (
              pendingRequests.slice(0, 3).map(req => (
                <div className="flex gap-6 ml-6 mt-6 border-b-1 pb-2 max-w-[90%]" key={req.id}>
                  <h1 className="text-zinc-300">{req.user.email}</h1>
                  <h1>{req.item.serialCode}</h1>
                  <h1>{req.type}</h1>
                  <div className="flex ml-auto mr-2 gap-4">
                    <h1
                      className="text-emerald-400 font-semibold hover:underline hover:cursor-pointer hover:-translate-y-1 duration-300"
                      onClick={async () => {
                        const res = await fetch('/api/core/items/approve', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ requestId: req.id }),
                        });
                        if (res.ok) {
                          console.log('successful');
                          fetchRecent();
                          fetchPending();
                          showToast({
                            show: 'Approved a request.',
                            description: 'success',
                            label: `You successfully approved ${req.user.name}'s request for ${req.item.serialCode}.`,
                          });
                        }
                      }}
                    >
                      A
                    </h1>
                    <h1
                      className="text-red-500 font-semibold hover:underline hover:cursor-pointer hover:-translate-y-1 duration-300"
                      onClick={async () => {
                        const res = await fetch('/api/core/items/reject', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ requestId: req.id }),
                        });
                        if (res.ok) {
                          console.log('successful');
                          fetchRecent();
                          fetchPending();
                          showToast({
                            show: 'Rejected a request.',
                            description: 'success',
                            label: `You successfully rejected ${req.user.name}'s request for ${req.item.serialCode}.`,
                          });
                        }
                      }}
                    >
                      R
                    </h1>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center mt-24 text-zinc-400 font-medium">No recent requests found.</div>
            )}
            </div>
          </div>
          <div className="flex-1 rounded-xl bg-muted/50 p-4 md:h-auto max-h-[600px]">
              <ScrollArea className="h-full w-full">
            <h1 className="text-xl font-semibold mb-6">Latest requests</h1>
                <div className="space-y-4 pr-2">
                  {recentRequests.map(req =>(
                    <DropdownMenu key = {req.id}>
                      <div key = {req.id} className="flex items-center justify-between border-1 text-white px-4 py-3 rounded-md">
                        
                        <div className="flex-1 font-medium">{req.item.product.name}</div>
                        <div className="flex items-center gap-6 text-sm text-zinc-300">
                          <div><span className="font-semibold text-white">FROM:</span> {req.user.email}</div>
                          <div><span className="font-semibold text-white">FOR:</span> {req.item.serialCode}</div>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-white font-semibold">ITEM STATUS:</span>
                            <span className="text-emerald-400">{req.item.status}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-white">REQUEST STATUS:</span>
                            <span
                              className={`px-2 py-1 rounded font-semibold ${
                                req.status.toUpperCase() === 'APPROVED'
                                  ? 'text-emerald-400'
                                  : req.status.toUpperCase() === 'DENIED'
                                  ? 'text-red-500'
                                  : req.status.toUpperCase() === 'PENDING'
                                  ? 'text-yellow-400'
                                  : 'text-black'
                              }`}
                            >
                              {req.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-white">REQUEST TYPE:</span>
                            <span>
                              {req.type}
                            </span>
                          </div>
                        </div>
                        {/* po nqkva prichina ne raboti setcurrentselectedrequest i e prosto 1 */}
                        <DropdownMenuTrigger asChild>
                          <MoreHorizontal className="w-5 h-5 text-zinc-400 ml-4 cursor-pointer" />
                        </DropdownMenuTrigger>
                      </div>
                      <DropdownMenuContent className="w-36 cursor-pointer" align="start">
                        <DropdownMenuGroup>
                          <DropdownMenuItem className="cursor-pointer" onClick={async ()=>{
                             const res = await fetch('/api/core/items/reject', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ requestId: req.id }),
                            })
                            if (res.ok){
                              console.log("successful");
                              fetchRecent();
                              fetchPending();
                              showToast({
                                show: "Rejected a request.",
                                description: "success",
                                label: `You successfully rejected ${req.user.name}'s request for ${req.item.serialCode}.`,
                              });
                            }
                          }}>Reject</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer" onClick={async ()=>{
                            const res = await fetch('/api/core/items/approve', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ requestId: req.id }),
                            })
                            if (res.ok){
                              console.log("successful");
                              fetchRecent();
                              fetchPending();
                              showToast({
                                show: "Approved a request.",
                                description: "success",
                                label: `You successfully approved ${req.user.name}'s request for ${req.item.serialCode}.`,
                              });
                            }
                          }}>Approve</DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ))}
                </div>
              </ScrollArea>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
