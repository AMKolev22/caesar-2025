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
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl">
            <div className="flex">
              <h1 className="ml-4 mt-4 text-xl font-semibold">Needs restocking</h1>
              <div className="items-center justify-end mt-4 flex ml-auto mr-6 gap-4">
                <span className=" w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-glow"></span>
                <h1 className="text-xl font-semibold -mt-1">
                  150
                </h1>
              </div>
            </div>
            </div>
            <div className="bg-muted/50 aspect-video rounded-xl">
            <div className="flex">
              <h1 className="ml-4 mt-4 text-xl font-semibold">Items assigned</h1>
              <div className="items-center justify-end mt-4 flex ml-auto mr-6 gap-4">
                <span className=" w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-glow"></span>
                <h1 className="text-xl font-semibold -mt-1">
                  150
                </h1>
              </div>
            </div>
            </div>
            <div className="bg-muted/50 aspect-video rounded-xl">
            <div className="flex">
              <h1 className="ml-4 mt-4 text-xl font-semibold">Pending Requests</h1>
              <div className="items-center justify-end mt-4 flex ml-auto mr-6 gap-4">
                <span className=" w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse shadow-glow"></span>
                <h1 className="text-xl font-semibold -mt-1">
                  150
                </h1>
              </div>
            </div>
            </div>
          </div>
          <div className="flex-1 rounded-xl bg-muted/50 p-4 md:h-auto max-h-[500px]">
            <h1 className="text-xl font-semibold mb-6">Latest requests</h1>
              <ScrollArea className="h-full w-full">
                <div className="space-y-2 pr-2">
                  <div className="flex items-center justify-between border-1 text-white px-4 py-3 rounded-md">
                    <div className="flex-1 font-medium">Refill Concession Stand</div>
                    <div className="flex items-center gap-6 text-sm text-zinc-300">
                      <div><span className="font-semibold text-white">From:</span> John Doe</div>
                      <div><span className="font-semibold text-white">Requires:</span> Theater 4</div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-white">Status:</span>
                        <span className="text-emerald-400">Approved</span>
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
