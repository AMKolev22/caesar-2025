"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { MoreHorizontal, Search, MapPin, Camera } from "lucide-react";
import Cookies from "js-cookie";
import { showToast } from "@/scripts/toast";

export default function Page() {
  const [inventory, setInventory] = useState([]);
  const [labels, setLabels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("all");
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [requestingItems, setRequestingItems] = useState(new Set());

  const fetchInventory = async () => {
    const res = await fetch('/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      setInventory(data.inventory);
      console.log(data.inventory);
    }
  };

  const fetchLabels = async () => {
    const res = await fetch('/api/labels', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      setLabels(data.labels);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'text-emerald-400';
      case 'IN_USE':
        return 'text-red-400';
      case 'BROKEN':
        return 'text-red-500';
      case 'UNDER_REPAIR':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Available';
      case 'IN_USE':
        return 'In Use';
      case 'BROKEN':
        return 'Broken';
      case 'UNDER_REPAIR':
        return 'Under Repair';
      default:
        return status;
    }
  };

  // filters inventory 
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = searchTerm === "" || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.items?.some(it => it.serialCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLabel = selectedLabel === "all" || 
      item.labels?.some(label => label.id === parseInt(selectedLabel));
    
    return matchesSearch && matchesLabel;
  });

  const handleBorrowRequest = async (serialCode, itemName) => {
    const userEmail = Cookies.get("email");
    
    if (!userEmail) {
      showToast({
        show: "Error",
        description: "error",
        label: "Please log in to make a request",
      });
      return;
    }

    // add item to requesting set to show loading state
    setRequestingItems(prev => new Set([...prev, serialCode]));

    try {
      const res = await fetch('/api/core/items/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: userEmail,
          serialCode: serialCode
        }),
      });

      if (res.ok) {
        showToast({
          show: "Success",
          description: "success",
          label: `Successfully requested ${itemName} (${serialCode})`,
        });
        // refresh inventory
        await fetchInventory();
      } 
      else {
        const error = await res.json();
        showToast({
          show: "Error",
          description: "error",
          label: error?.error || 'Failed to make request',
        });
      }
    } catch (error) {
      showToast({
        show: "Error",
        description: "error",
        label: 'Network error occurred',
      });
    } finally {
      // removes item from requesting set
      setRequestingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(serialCode);
        return newSet;
      });
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchLabels();
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
              <h1 className="text-xl font-semibold">Request Items</h1>
            </div>

            {/* search and filter controls */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search products, serial codes, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div> 
              <Select value={selectedLabel} onValueChange={setSelectedLabel}>
                <SelectTrigger className="w-48 hover:cursor-pointer">
                  <SelectValue placeholder="Filter by label" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="hover:cursor-pointer" value="all">All Labels</SelectItem>
                  {labels.map((label) => (
                    <SelectItem className="hover:cursor-pointer" key={label.id} value={label.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: label.color }}
                        />
                        <span className="-mt-1">{label.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="h-full w-full">
              <div className="space-y-2 pr-2">
                {filteredInventory.map((item) => {
                  const isLowStock = item.totalQuantity < 5;
                  const stockClass = isLowStock ? 'text-red-500' : 'text-emerald-400';
                  const stockLabel = isLowStock ? 'Low' : 'OK';

                  return (
                    <div key={item.id} className="border border-zinc-700 text-white px-4 py-3 rounded-md space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 cursor-pointer"
                          onClick={() => {
                            setExpandedProductId(item.id === expandedProductId ? null : item.id);
                          }}>
                          {/* Display product Image */}
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
                            
                            {/* ;ocation display */}
                            {item.location && (
                              <div className="flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3 text-zinc-400" />
                                <span className="text-sm text-zinc-400">{item.location}</span>
                              </div>
                            )}
                            
                            <div className="flex flex-wrap gap-2 mt-3">
                              {item.labels && item.labels.length > 0 ? (
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
                            <span className={`${stockClass} font-semibold`}>{stockLabel}</span>
                          </div>
                        </div>
                        <MoreHorizontal
                          className="w-5 h-5 text-zinc-400 ml-4 cursor-pointer"
                          onClick={() => {
                            setExpandedProductId(item.id === expandedProductId ? null : item.id);
                          }}
                        />
                      </div>

                      {/* available items for borrowing */}
                      {expandedProductId === item.id && (
                        <div className="mt-4 border-t border-zinc-600 pt-4 space-y-4">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-white">Available Items</h4>
                            {item.items && item.items.length > 0 ? (
                              <div className="space-y-2">
                                {item.items.map((it) => (
                                  <div key={it.id} className="flex items-center justify-between p-3 border border-zinc-600 rounded-md">
                                    <div className="flex-1">
                                      <div className="font-medium text-white">{it.serialCode}</div>
                                      <div className="flex items-center gap-4 mt-1">
                                        <div className="text-sm text-zinc-400">
                                          Serial: {it.serialCode}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <span className="text-sm font-semibold">STATUS:</span>
                                          <Badge variant="outline" className={`${getStatusColor(it.status)} bg-none uppercase border-none font-semibold text-xs -ml-1 mt-[0.05rem]`}>
                                            {getStatusText(it.status)}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                    <Button
                                      size="sm"
                                      className="ml-4 font-semibold hover:cursor-pointer duration-300 hover:-translate-y-1"
                                      onClick={() => handleBorrowRequest(it.serialCode, item.name)}
                                      disabled={requestingItems.has(it.serialCode) || it.status !== 'AVAILABLE'}
                                    >
                                      {requestingItems.has(it.serialCode) ? 'Requesting...' : 
                                       it.status === 'AVAILABLE' ? 'Request' : 'Unavailable'}
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-zinc-400 text-sm">No items available for borrowing.</p>
                            )}
                          </div>

                          {/* product description */}
                          {item.description && (
                            <div className="space-y-2">
                              <h4 className="font-semibold text-white">Product Description</h4>
                              <p className="text-zinc-300 text-sm">{item.description}</p>
                            </div>
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