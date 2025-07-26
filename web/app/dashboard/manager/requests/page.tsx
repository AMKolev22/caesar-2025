"use client"

import { useState, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { AppSidebar } from "@/components/app-sidebar-manager"
import Breadcrumb from '@/components/breadcrumb';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { showToast } from '@/scripts/toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Page() {
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/core/items/getRecentRequests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (res.ok) {
                const data = await res.json();
                setRequests(data.recent);
            }
        } 
        catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let filtered = requests;

        if (typeFilter !== 'all')
            filtered = filtered.filter(req => req.type.toLowerCase() === typeFilter.toLowerCase());

        if (statusFilter !== 'all')
            filtered = filtered.filter(req => req.status.toLowerCase() === statusFilter.toLowerCase());

        setFilteredRequests(filtered);
    }, [requests, typeFilter, statusFilter]);

    useEffect(() => {
        fetchRequests();
    }, []);

    const getTypeColor = (type) => {
        switch (type.toUpperCase()) {
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

    const handleApprove = async (requestId, userEmail, itemSerial) => {
        const res = await fetch('/api/core/items/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId }),
        });
        if (res.ok) {
            console.log('successful');
            fetchRequests();
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
            fetchRequests();
            showToast({
                show: 'Rejected a request.',
                description: 'success',
                label: `You successfully rejected ${userEmail}'s request for ${itemSerial}.`,
            });
        }
    };

    if (loading) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2">
                        <div className="flex items-center gap-2 px-4">
                            <SidebarTrigger className="-ml-1" />
                            <span className="mt-4 "><Breadcrumb /></span>
                        </div>
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-2 sm:p-4 pt-0 overflow-y-hidden">
                        <div className="flex-1 rounded-xl bg-muted/50 p-2 sm:p-4 md:h-auto max-h-[100vh] overflow-y-hidden">
                            <div className="animate-pulse">
                                <div className="h-6 bg-zinc-400/30 rounded w-1/4 mb-6"></div>
                                <div className="flex gap-4 mb-6">
                                    <div className="h-10 bg-zinc-400/30 rounded w-32"></div>
                                    <div className="h-10 bg-zinc-400/30 rounded w-32"></div>
                                </div>
                                <div className="space-y-4">
                                    {[...Array(8)].map((_, i) => (
                                        <div key={i} className="h-20 bg-zinc-400/30 rounded"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <span className="mt-4 "><Breadcrumb /></span>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-2 sm:p-4 pt-0 overflow-y-hidden">
                    <div className="flex-1 rounded-xl bg-muted/50 p-2 sm:p-4 md:h-auto max-h-[100vh] overflow-y-hidden">
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <h1 className="text-lg sm:text-xl font-semibold">All Requests</h1>

                            {/* filter controls on the right */}
                            <div className="flex items-center gap-2 sm:gap-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing <span className='text-emerald-400 font-semibold'>{filteredRequests.length}</span> of <span className='text-emerald-400 font-semibold'> {requests.length}</span> requests
                                </div>

                                <div className="flex items-center gap-2">
                                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="borrow" className={`hover:${getTypeColor("BORROW")}`}>Borrow</SelectItem>
                                            <SelectItem value="return" className={`hover:${getTypeColor("RETURN")}`}>Return</SelectItem>
                                            <SelectItem value="repair" className={`hover:${getTypeColor("REPAIR")}`}>Repair</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue placeholder="Select a product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="denied">Denied</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="h-full w-full overflow-y-auto">
                            <div className="space-y-2 pr-1 sm:pr-2 mt-6">
                                {filteredRequests.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                        <div className="text-lg mb-2">No requests found</div>
                                        <div className="text-sm">
                                            {requests.length === 0
                                                ? "No requests available."
                                                : "Try changing the filter."
                                            }
                                        </div>
                                    </div>
                                ) : (
                                    filteredRequests.map(req => (
                                        <DropdownMenu key={req.id}>
                                            <div className="border border-zinc-700 text-white px-2 sm:px-4 py-3 rounded-md">
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
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};
