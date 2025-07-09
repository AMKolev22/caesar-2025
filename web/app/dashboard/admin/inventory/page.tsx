import { AppSidebar } from "@/components/app-siderbar-admin"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { MoreHorizontal } from "lucide-react";

export default function Page() {
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
            <h1 className="text-xl font-semibold mb-6">Inventory</h1>
              <ScrollArea className="h-full w-full">
                <div className="space-y-2 pr-2">
                  <div className="flex items-center justify-between border-1 text-white px-4 py-3 rounded-md">
                    <div className="flex-1 font-medium">Refill Concession Stand</div>
                    <div className="flex items-center gap-6 text-sm text-zinc-300">
                      <div><span className="font-semibold text-white">Quantity:</span> number</div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-white">Stock:</span>
                        <span className="text-emerald-400">Low</span>
                      </div>
                    </div>
                    <MoreHorizontal className="w-5 h-5 text-zinc-400 ml-4 cursor-pointer" />
                  </div>
                </div>
              </ScrollArea>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
