"use client"

import { AppSidebar } from "@/components/app-siderbar-admin"
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { showToast } from "@/scripts/toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Page() {
  const [inventory, setInventory] = useState([]);
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [serialCodes, setSerialCodes] = useState<string[]>(['']);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [minQuantity, setMinQuantity] = useState(0);

  const fetchInventory = async () => {
    const res = await fetch('/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    if (res.ok) {
      const data = await res.json();
      setInventory(data.inventory);
      console.log(data.inventory);
    }
  }

  useEffect(() => {
    fetchInventory();
  }, []);

  const filteredInventory = inventory.filter((item) => {
    const matchesName = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesQuantity = item.totalQuantity >= minQuantity;

    const isLowStock = item.totalQuantity < 5;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'low' && isLowStock) ||
      (statusFilter === 'ok' && !isLowStock);

    return matchesName && matchesQuantity && matchesStatus;
  });

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
            <Popover>
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h1 className="text-xl font-semibold">Inventory</h1>
                <Input
                  placeholder="Search by product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="md:w-1/3"
                />
                <Select onValueChange={(val) => setStatusFilter(val)} defaultValue="all">
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Stock Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="ok">OK</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={0}
                  className="w-[120px]"
                  placeholder="Min Qty"
                  value={minQuantity}
                  onChange={(e) => setMinQuantity(Number(e.target.value))}
                />
                <PopoverTrigger asChild>
                  <Button className="ml-auto font-semibold hover:cursor-pointer duration-300 hover:-translate-y-1">
                    CREATE
                  </Button>
                </PopoverTrigger>
              </div>
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
                        className="ml-auto float-right mt-2"
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

            <ScrollArea className="h-full w-full">
              <div className="space-y-2 pr-2">
                {filteredInventory.map((item) => {
                  const isLowStock = item.totalQuantity < 5;
                  const stockClass = isLowStock ? 'text-red-500' : 'text-emerald-400';
                  const stockLabel = isLowStock ? 'Low' : 'OK';

                  return (
                    <div key={item.id} className="border border-zinc-700 text-white px-4 py-3 rounded-md space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 font-medium">{item.name}</div>
                        <div className="flex items-center gap-6 text-sm text-zinc-300">
                          <div>
                            <span className="font-semibold text-white">Item Quantity:</span> {item.totalQuantity}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-white">Total Stock <span className="p-1">(NOT BROKEN)</span>:</span>
                            <span className={stockClass}>{stockLabel}</span>
                          </div>
                        </div>
                        <MoreHorizontal
                          className="w-5 h-5 text-zinc-400 ml-4 cursor-pointer"
                          onClick={() => {
                            setExpandedProductId(item.id === expandedProductId ? null : item.id);
                            setSerialCodes(['']);
                          }}
                        />
                      </div>

                      {expandedProductId === item.id && (
                        <div className="mt-4 border-t border-zinc-600 pt-4 space-y-4">
                          <div className="space-y-2">
                            <Label className="text-white">Add New Items (Serial Codes)</Label>
                            {serialCodes.map((code, idx) => (
                              <div key={idx} className="flex gap-2">
                                <Input
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
                                      description: "success",
                                      label: err?.error || 'Unknown error',
                                    });
                                  }
                                }}
                              >
                                Add new items
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            {item.items && item.items.length > 0 ? (
                              <>
                                <h4 className="font-semibold text-white">Existing Items</h4>
                                <ul className="list-disc list-inside text-zinc-300 text-sm">
                                  {item.items.map((it) => (
                                    <li key={it.id}>{it.serialCode}</li>
                                  ))}
                                </ul>
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
  )
}
