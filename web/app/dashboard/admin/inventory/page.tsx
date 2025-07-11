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
export default function Page() {

  const [inventory, setInventory] = useState([]);
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");

  const fetchInventory = async ()=> {
    const res = await fetch('/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }) 
    if (res.ok){
      const data = await res.json();
      setInventory(data.inventory);
      console.log(data.inventory);
    }
  }
  useEffect(() => {
  fetchInventory();
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
           <Popover>
            <div className="flex">
              <h1 className="text-xl font-semibold mb-6">Inventory</h1>
              <PopoverTrigger asChild>
                <Button className="ml-auto mr-4 font-semibold hover:cursor-pointer duration-300 hover:-translate-y-1">CREATE</Button>
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
                onChange={(e)=>setTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="description">Product Info</Label>
              <Input
                id="description"
                className="col-span-2 h-8"
                placeholder="Enter description."
                value={description}
                onChange={(e)=>setDescription(e.target.value)}
              />
            </div>
            <span>
              <Button size="sm" className="ml-auto mr-4 font-semibold hover:cursor-pointer duration-300 hover:-translate-y-1 ml-auto mr-0 float-right mt-2" onClick={async ()=>{
                console.log(description);
                console.log(title);
                const res = await fetch('/api/core/products', {
                  method: "POST",
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({productName: title, description}),
                })
                fetchInventory();
                showToast({
                  show: "Successfully added a product",
                  description: "success",
                  label: `Successfully added ${title} to inventory!`,
                });
              }}>CREATE</Button>
            </span>
          </div>
        </div>
      </PopoverContent>
          </Popover>
              <ScrollArea className="h-full w-full">
                <div className="space-y-2 pr-2">
                    {inventory.map(item => {
                      const isLowStock = item.totalQuantity < 5;
                      const stockClass = isLowStock ? 'text-red-500' : 'text-emerald-400';
                      const stockLabel = isLowStock ? 'Low' : 'OK';

                      return (
                        <div key={item.id} className="flex items-center justify-between border border-zinc-700 text-white px-4 py-3 rounded-md">
                          <div className="flex-1 font-medium">{item.name}</div>
                          <div className="flex items-center gap-6 text-sm text-zinc-300">
                            <div>
                              <span className="font-semibold text-white">Item Quantity:</span> {item.totalQuantity}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-white">Total Stock <span className="underline p-1">(NOT BROKEN)</span>:</span>
                              <span className={stockClass}>{stockLabel}</span>
                            </div>
                          </div>
                          <MoreHorizontal className="w-5 h-5 text-zinc-400 ml-4 cursor-pointer" />
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
