"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Breadcrumb from '@/components/breadcrumb';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { MoreHorizontal, Search, MapPin, Camera } from "lucide-react";
import Cookies from "js-cookie";
import { showToast } from "@/scripts/toast";
import { useRouter } from "next/navigation";

export default function BorrowRequestPage() {
  const [inventory, setInventory] = useState([]);
  const [labels, setLabels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("all");
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [requestingItems, setRequestingItems] = useState(new Set());
  const router = useRouter();

  useEffect(() => {
    fetchInventory();
    fetchLabels();
  }, []);

useEffect(()=>{

  const fetchSessionInfo = async () => {
    try {
      const sessionRes = await fetch("/api/who", {
        method: "GET",
        headers: { 'Content-Type': 'application/json' },
        credentials: "include"
      });

      const session = await sessionRes.json();
      console.log("session info: ", session);

      const resAllowed = await fetch('/api/auth/isAllowed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email }),
      });

      const resData = await resAllowed.json();
      if (!resData.allowed)
        router.push("/not-allowed")
    }
    catch (err) {
      console.error("Fetch error:", err);
    }
  };

  fetchSessionInfo();
}, []);


const fetchInventory = async () => {
  const res = await fetch("/api/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (res.ok) {
    const data = await res.json();
    setInventory(data.inventory);
  }
};

const fetchLabels = async () => {
  const res = await fetch("/api/labels", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (res.ok) {
    const data = await res.json();
    setLabels(data.labels);
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "AVAILABLE":
      return "text-emerald-400";
    case "IN_USE":
      return "text-red-400";
    case "BROKEN":
      return "text-red-500";
    case "UNDER_REPAIR":
      return "text-yellow-500";
    default:
      return "text-gray-500";
  }
};

const getStatusText = (status) => {
  switch (status) {
    case "AVAILABLE":
      return "Available";
    case "IN_USE":
      return "In Use";
    case "BROKEN":
      return "Broken";
    case "UNDER_REPAIR":
      return "Under Repair";
    default:
      return status;
  }
};

const filteredInventory = inventory.filter((item) => {
  const search = searchTerm.toLowerCase();
  const matchesSearch =
    !search ||
    item.name.toLowerCase().includes(search) ||
    item.items?.some((i) => i.serialCode.toLowerCase().includes(search)) ||
    (item.location && item.location.toLowerCase().includes(search));

  const matchesLabel =
    selectedLabel === "all" ||
    item.labels?.some((label) => label.id === parseInt(selectedLabel));

  return matchesSearch && matchesLabel;
});

const handleBorrowRequest = async (serialCode) => {
  // const userEmail = Cookies.get("email");
  // if (!userEmail) {
  //   showToast({
  //     show: "Error",
  //     description: "error",
  //     label: "Please log in to make a request",
  //   });
  //   return;
  // }

  setRequestingItems((prev) => new Set([...prev, serialCode]));

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
        label: `Successfully requested ${serialCode}`,
      });
      fetchInventory();
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
  finally {
    setRequestingItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(serialCode);
      return newSet;
    });
  }
};

return (
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header className="flex h-16 items-center gap-2 px-2 sm:px-4">
        <SidebarTrigger className="-ml-1" />
        <span className="mt-4"><Breadcrumb /></span>
      </header>
      <div className="flex flex-col h-[calc(100vh-64px)] gap-4 p-2 sm:p-4 pt-0 overflow-hidden">
        <div className="flex-1 rounded-xl bg-muted/50 p-3 sm:p-4 overflow-hidden flex flex-col">
          <div className="flex justify-between mb-4 sm:mb-6">
            <h1 className="text-lg sm:text-xl font-semibold">Request Items</h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search products, serial codes, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedLabel} onValueChange={setSelectedLabel}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by label" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Labels</SelectItem>
                {labels.map((label) => (
                  <SelectItem key={label.id} value={label.id.toString()}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: label.color }}
                      />
                      <span>{label.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div
            className="h-full w-full overflow-y-auto"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgb(113 113 122) transparent'
            }}
          >
            <div className="space-y-3 sm:space-y-4 pr-1 sm:pr-2 pb-4">
              {filteredInventory.map((item) => (
                <div
                  key={item.id}
                  className="border border-zinc-700 text-white px-3 sm:px-4 py-3 rounded-md space-y-2"
                >
                  <div className="flex flex-col lg:flex-row lg:justify-between gap-3 lg:gap-0">
                    <div
                      className="flex gap-3 sm:gap-4 flex-1 cursor-pointer"
                      onClick={() =>
                        setExpandedProductId(
                          item.id === expandedProductId ? null : item.id
                        )
                      }
                    >
                      <div className="flex-shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md border border-zinc-600"
                          />
                        ) : (
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-zinc-700 rounded-md border border-zinc-600 flex items-center justify-center">
                            <Camera className="w-4 h-4 sm:w-6 sm:h-6 text-zinc-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm sm:text-base truncate pr-2">{item.name}</div>
                        {item.location && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-zinc-400 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-zinc-400 truncate">{item.location}</span>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 sm:mt-3">
                          {item.labels?.length > 0 ? (
                            <>
                              <span className="mr-1 text-xs sm:text-sm text-zinc-300 font-medium">Labels:</span>
                              {item.labels.map((label) => (
                                <Badge
                                  key={label.id}
                                  style={{
                                    backgroundColor: `${label.color}33`,
                                    color: label.color,
                                    boxShadow: `inset 0 0 0 1px ${label.color}80`,
                                  }}
                                  className="text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-md border-0"
                                >
                                  {label.name}
                                </Badge>
                              ))}
                            </>
                          ) : (
                            <span className="text-zinc-400 italic text-xs sm:text-sm ml-1">No labels yet.</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row lg:items-end xl:items-center gap-2 sm:gap-6 text-xs sm:text-sm text-zinc-300">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-white">Available:</span>
                        <span className="font-medium">{item.totalQuantity}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-white">Status:</span>
                        <span
                          className={`${item.totalQuantity < 5 ? "text-red-500" : "text-emerald-400"
                            } font-semibold`}
                        >
                          {item.totalQuantity < 5 ? "Low" : "OK"}
                        </span>
                      </div>
                    </div>

                    <MoreHorizontal
                      className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 cursor-pointer self-start lg:self-center lg:ml-4"
                      onClick={() =>
                        setExpandedProductId(
                          item.id === expandedProductId ? null : item.id
                        )
                      }
                    />
                  </div>

                  {expandedProductId === item.id && (
                    <div className="mt-4 border-t border-zinc-600 pt-4 space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-white text-sm sm:text-base">Available Items</h4>
                        {item.items?.length > 0 ? (
                          <div className="space-y-2 max-h-48 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                            {item.items.map((it) => (
                              <div
                                key={it.id}
                                className="flex flex-col sm:flex-row sm:justify-between gap-3 p-3 border border-zinc-600 rounded-md"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-white text-sm sm:text-base break-all">{it.serialCode}</div>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
                                    <div className="text-xs sm:text-sm text-zinc-400">
                                      Serial: <span className="break-all">{it.serialCode}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs sm:text-sm font-semibold">STATUS:</span>
                                      <Badge
                                        variant="outline"
                                        className={`${getStatusColor(it.status)} bg-none uppercase border-none font-semibold text-xs`}
                                      >
                                        {getStatusText(it.status)}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  className="font-semibold hover:cursor-pointer w-full sm:w-auto sm:ml-4 self-start sm:self-center"
                                  onClick={() => handleBorrowRequest(it.serialCode, item.name)}
                                  disabled={
                                    requestingItems.has(it.serialCode) || it.status !== "AVAILABLE"
                                  }
                                >
                                  {requestingItems.has(it.serialCode)
                                    ? "Requesting..."
                                    : it.status === "AVAILABLE"
                                      ? "Request"
                                      : "Unavailable"}
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-zinc-400 text-xs sm:text-sm">
                            No items available for borrowing.
                          </p>
                        )}
                      </div>
                      {item.description && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-white text-sm sm:text-base">Product Description</h4>
                          <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">{item.description}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
);
}
