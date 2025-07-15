"use client"

import { AppSidebar } from "@/components/app-siderbar-admin"
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { MoreHorizontal, Search, Tag, Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { showToast } from "@/scripts/toast";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Page() {
  const [inventory, setInventory] = useState([]);
  const [labels, setLabels] = useState([]);
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("all");
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [serialCodes, setSerialCodes] = useState(['']);
  
  // Label management states
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#3b82f6");
  const [selectedProductLabels, setSelectedProductLabels] = useState<number[]>([]);
  const [openDropdownProductId, setOpenDropdownProductId] = useState(null);

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

  const createLabel = async () => {
    if (!newLabelName.trim()) return;
    
    const res = await fetch('/api/labels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newLabelName,
        color: newLabelColor,
      }),
    });
    
    if (res.ok) {
      await fetchLabels();
      setNewLabelName("");
      setNewLabelColor("#3b82f6");
      showToast({
        show: "Success",
        description: "success",
        label: `Label "${newLabelName}" created successfully!`,
      });
    }
  };

  const updateProductLabels = async (productId, labelIds) => {
    const res = await fetch('/api/core/products/labels', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        labelIds,
      }),
    });
    
    if (res.ok) {
      await fetchInventory();
      showToast({
        show: "Success",
        description: "success",
        label: "Product labels updated successfully!",
      });
    }
  };

  const toggleProductLabel = async (productId, labelId) => {
    const product = inventory.find(p => p.id === productId);
    const currentLabels = product?.labels?.map(l => l.id) || [];
    
    let newLabels;
    if (currentLabels.includes(labelId)) {
      newLabels = currentLabels.filter(id => id !== labelId);
    } else {
      newLabels = [...currentLabels, labelId];
    }
    
    await updateProductLabels(productId, newLabels);
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

  // Filter inventory based on search term and selected label
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = searchTerm === "" || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.items?.some(it => it.serialCode.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLabel = selectedLabel === "all" || 
      item.labels?.some(label => label.id === parseInt(selectedLabel));
    
    return matchesSearch && matchesLabel;
  });

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
              <h1 className="text-xl font-semibold">Inventory</h1>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="font-semibold cursor-pointer hover:-translate-y-1 duration-300">
                      <Tag className="w-4 h-4 mr-2" />
                      Manage Labels
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Create New Label</h4>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Label name"
                            value={newLabelName}
                            onChange={(e) => setNewLabelName(e.target.value)}
                          />
                          <input
                            type="color"
                            value={newLabelColor}
                            onChange={(e) => setNewLabelColor(e.target.value)}
                            className="w-12 h-9 rounded border"
                          />
                          <Button onClick={createLabel} size="sm">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Existing Labels</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {labels.map((label) => (
                            <Badge
                              key={label.id}
                              style={{ 
                                backgroundColor: label.color,
                                boxShadow: `0 0 0 1px ${label.color}40`
                              }}
                              className="text-white text-xs font-medium px-2 py-1 rounded-full border-0 shadow-sm"
                            >
                              {label.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button className="font-semibold hover:cursor-pointer duration-300 hover:-translate-y-1">
                      CREATE
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="leading-none font-medium">Create a new product.</h4>
                        <p className="text-muted-foreground text-sm">
                          Enter the details down below. You can add your own items later.
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="title">Product Title</Label>
                          <Input
                            id="title"
                            autoComplete="off"
                            autoCapitalize="on"
                            placeholder="Enter the product's title."
                            className="col-span-2 h-8"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="description">Product Info</Label>
                          <Input
                            id="description"
                            className="col-span-2 h-8"
                            placeholder="Enter description."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </div>
                        <span>
                          <Button
                            size="sm"
                            className="ml-auto mr-4 font-semibold hover:cursor-pointer duration-300 hover:-translate-y-1 ml-auto mr-0 float-right mt-2"
                            onClick={async () => {
                              const res = await fetch('/api/core/products', {
                                method: "POST",
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ productName: title, description }),
                              });
                              fetchInventory();
                              showToast({
                                show: "Successfully added a product",
                                description: "success",
                                label: `Successfully added ${title} to inventory!`,
                              });
                            }}
                          >
                            CREATE
                          </Button>
                        </span>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search products or serial codes..."
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
                        <div className="flex-1 cursor-pointer"
                        onClick={() => {
                              setExpandedProductId(item.id === expandedProductId ? null : item.id);
                              setSerialCodes(['']);
                        }}>
                          <div className="font-medium">{item.name}</div>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {item.labels && item.labels.length > 0 ? (
                                <>
                                  <span className="mr-1 text-sm text-zinc-300 font-medium">Labels:</span>
                                  {item.labels.map((label) => (
                                    <div
                                      key={label.id}
                                      style={{ 
                                        backgroundColor: label.color,
                                        boxShadow: `0 0 0 1px ${label.color}40`
                                      }}
                                      className="inline-flex items-center justify-center px-3 rounded-full text-white text-xs font-medium shadow-sm hover:shadow-md transition-shadow duration-200"
                                    >
                                      {label.name}
                                    </div>
                                  ))}
                                </>
                              ) : (
                                <span className="text-zinc-400 italic text-sm ml-1">No labels yet.</span>
                              )}
                            </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-zinc-300">
                          <div>
                            <span className="font-semibold text-white">Item Quantity:</span> {item.totalQuantity}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-white">Total Stock <span className="p-1">(NOT BROKEN)</span>:</span>
                            <span className={stockClass}>{stockLabel}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mr-2 ml-2">
                          <DropdownMenu 
                            open={openDropdownProductId === item.id}
                            onOpenChange={(open) => setOpenDropdownProductId(open ? item.id : null)}
                          >
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="hover:bg-zinc-700 border-zinc-600 text-zinc-300 hover:text-white transition-all duration-200 hover:border-zinc-500"
                              >
                                <Tag className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-64 bg-zinc-900 border-zinc-700" align="end">
                              <div className="px-3 py-2 text-sm font-semibold text-white border-b border-zinc-700">
                                Available Labels
                              </div>
                              {labels.length > 0 ? (
                                <div className="py-1">
                                  {labels.map((label) => {
                                    const isSelected = item.labels?.some(l => l.id === label.id);
                                    return (
                                      <DropdownMenuItem
                                        key={label.id}
                                        className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-zinc-800 transition-colors duration-150"
                                        onClick={() => toggleProductLabel(item.id, label.id)}
                                      >
                                        <div className="flex items-center gap-3 flex-1">
                                          <div
                                            className="w-4 h-4 rounded-full border-2 border-white/20 shadow-sm"
                                            style={{ backgroundColor: label.color }}
                                          />
                                          <span className="text-zinc-100 font-medium">{label.name}</span>
                                        </div>
                                        {isSelected && (
                                          <Check className="w-4 h-4 text-emerald-400 font-bold" />
                                        )}
                                      </DropdownMenuItem>
                                    );
                                  })}
                                </div>
                              ) : (
                                <DropdownMenuItem disabled className="text-zinc-400 italic py-3">
                                  No labels available
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <MoreHorizontal
                            className="w-5 h-5 text-zinc-400 cursor-pointer"
                            onClick={() => {
                              setExpandedProductId(item.id === expandedProductId ? null : item.id);
                              setSerialCodes(['']);
                            }}
                          />
                        </div>
                      </div>

                      {/* add item + show items logic */}
                      {expandedProductId === item.id && (
                        <div className="mt-4 border-t border-zinc-600 pt-4 space-y-4">
                          {/* new items frontend */}
                          <div className="space-y-2">
                            <Label className="text-white">Add New Items</Label>
                            {serialCodes.map((code, idx) => (
                              <div key={idx} className="flex gap-2">
                                <Input
                                className="mb-2 max-w-[15%] mt-2"
                                  placeholder="Serial Code"
                                  value={code}
                                  onChange={(e) => {
                                    const updated = [...serialCodes];
                                    updated[idx] = e.target.value;
                                    setSerialCodes(updated);
                                  }}
                                />
                                {serialCodes.length > 1 && (
                                  <Button
                                    variant="destructive"
                                    onClick={() => {
                                      setSerialCodes(serialCodes.filter((_, i) => i !== idx));
                                    }}
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>
                            ))}
                            <div className="flex gap-2">
                              <Button variant="outline" onClick={() => setSerialCodes([...serialCodes, ''])}>
                                + Another
                              </Button>
                              <Button
                                onClick={async () => {
                                  const body = {
                                    productName: item.name,
                                    items: serialCodes.filter((code) => code.trim() !== '').map((code) => ({ serialCode: code })),
                                  };

                                  const res = await fetch('/api/core/items', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(body),
                                  });

                                  if (res.ok) {
                                    await fetchInventory();
                                    setExpandedProductId(null);
                                    showToast({
                                      show: "Success",
                                      description: "success",
                                      label: `Added ${serialCodes.length} items to ${item.name}`,
                                    });
                                  } else {
                                    const err = await res.json();
                                    showToast({
                                      show: "Error",
                                      description: "error",
                                      label: err?.error || 'Unknown error',
                                    });
                                  }
                                }}
                              >
                                Add new items
                              </Button>
                            </div>
                          </div>

                          {/* existing Items with Status */}
                          <div className="space-y-1">
                            {item.items && item.items.length > 0 ? (
                              <>
                                <h4 className="font-semibold text-white mb-2">Existing Items</h4>
                                <div className="space-y-2">
                                  {item.items.map((it) => (
                                    <div key={it.id} className="flex items-center p-2 justify-between rounded border border-zinc-600">
                                      <span className="text-zinc-300">{it.serialCode}</span>
                                      <div>
                                        <span className="mr-1 font-semibold">STATUS: </span>
                                      <Badge  variant="outline" className={`${getStatusColor(it.status)} bg-none uppercase border-none font-semibold`}>
                                        {getStatusText(it.status)}
                                      </Badge>

                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </>
                            ) : (
                              <p className="text-zinc-400 text-sm">No items added yet.</p>
                            )}
                          </div>
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