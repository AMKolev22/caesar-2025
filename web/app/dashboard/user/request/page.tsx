"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

export default function BorrowRequestPage() {
  const [inventory, setInventory] = useState([]);
  const [labels, setLabels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("all");
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [requestingItems, setRequestingItems] = useState(new Set());

  useEffect(() => {
    fetchInventory();
    fetchLabels();
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
    const userEmail = Cookies.get("email");
    if (!userEmail) {
      showToast({
        show: "Error",
        description: "error",
        label: "Please log in to make a request",
      });
      return;
    }

    setRequestingItems((prev) => new Set([...prev, serialCode]));

    try {
      const res = await fetch("/api/core/items/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, serialCode }),
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
        <header className="flex h-16 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex flex-col gap-4 p-4 pt-0 overflow-y-hidden">
          <div className="rounded-xl bg-muted/50 p-4 max-h-[100vh] overflow-y-hidden">
            <div className="flex justify-between mb-6">
              <h1 className="text-xl font-semibold">Request Items</h1>
            </div>

            <div className="flex gap-4 mb-6">
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
                <SelectTrigger className="w-48">
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

            <ScrollArea className="h-full w-full">
              <div className="space-y-2 pr-2">
                {filteredInventory.map((item) => (
                  <div
                    key={item.id}
                    className="border border-zinc-700 text-white px-4 py-3 rounded-md space-y-2"
                  >
                    <div className="flex justify-between">
                      <div
                        className="flex gap-4 flex-1 cursor-pointer"
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
                              className="w-16 h-16 object-cover rounded-md border border-zinc-600"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-zinc-700 rounded-md border border-zinc-600 flex items-center justify-center">
                              <Camera className="w-6 h-6 text-zinc-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          {item.location && (
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3 text-zinc-400" />
                              <span className="text-sm text-zinc-400">{item.location}</span>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {item.labels?.length > 0 ? (
                              <>
                                <span className="mr-1 text-sm text-zinc-300 font-medium">Labels:</span>
                                {item.labels.map((label) => (
                                  <Badge
                                    key={label.id}
                                    style={{
                                      backgroundColor: `${label.color}33`,
                                      color: label.color,
                                      boxShadow: `inset 0 0 0 1px ${label.color}80`,
                                    }}
                                    className="text-xs font-medium px-2 py-0.5 rounded-md border-0"
                                  >
                                    {label.name}
                                  </Badge>
                                ))}
                              </>
                            ) : (
                              <span className="text-zinc-400 italic text-sm ml-1">No labels yet.</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-zinc-300">
                        <div>
                          <span className="font-semibold text-white">Available Items:</span> {item.totalQuantity}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-white">Stock Status:</span>
                          <span
                            className={`${
                              item.totalQuantity < 5 ? "text-red-500" : "text-emerald-400"
                            } font-semibold`}
                          >
                            {item.totalQuantity < 5 ? "Low" : "OK"}
                          </span>
                        </div>
                      </div>
                      <MoreHorizontal
                        className="w-5 h-5 mt-8 text-zinc-400 ml-4 cursor-pointer"
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
                          <h4 className="font-semibold text-white">Available Items</h4>
                          {item.items?.length > 0 ? (
                            <div className="space-y-2">
                              {item.items.map((it) => (
                                <div
                                  key={it.id}
                                  className="flex justify-between p-3 border border-zinc-600 rounded-md"
                                >
                                  <div className="flex-1">
                                    <div className="font-medium text-white">{it.serialCode}</div>
                                    <div className="flex items-center gap-4 mt-1">
                                      <div className="text-sm text-zinc-400">
                                        Serial: {it.serialCode}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span className="text-sm font-semibold">STATUS:</span>
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
                                    className="ml-4 mt-2 font-semibold hover:cursor-pointer"
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
                            <p className="text-zinc-400 text-sm">
                              No items available for borrowing.
                            </p>
                          )}
                        </div>
                        {item.description && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-white">Product Description</h4>
                            <p className="text-zinc-300 text-sm">{item.description}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
