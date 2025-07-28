"use client"

import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Breadcrumb from '@/components/breadcrumb';
import {
  Search,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Flag,
  RotateCcw
} from "lucide-react";
import Cookies from 'js-cookie';
import { showToast } from '@/scripts/toast';
import { Typewriter } from '@/components/Typewriter';
import { useRouter } from 'next/router';

export default function Page() {
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(new Set());
  const [expandedRequestId, setExpandedRequestId] = useState(null);
  const [name, setName] = useState("");
  const router = useRouter();


  useEffect(()=>{
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
  }, [])

  const fetchMyRequests = async () => {
    // const userEmail = await Cookies.get("email");
    // console.log(userEmail);

    // if (!userEmail) {
    //   showToast({
    //     show: "Error",
    //     description: "error",
    //     label: "Please log in to view your requests",
    //   });
    //   return;
    // }

    try {
      const res = await fetch('/api/core/requests/myRequests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      } else {
        const error = await res.json();
        showToast({
          show: "Error",
          description: "error",
          label: error?.error || 'Failed to fetch requests',
        });
      }
    } catch (error) {
      showToast({
        show: "Error",
        description: "error",
        label: 'Network error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReturnItem = async (requestId, itemId, itemName) => {
    // const userEmail = Cookies.get("email");

    // if (!userEmail) {
    //   showToast({
    //     show: "Error",
    //     description: "error",
    //     label: "Please log in to return items",
    //   });
    //   return;
    // }

    setActionLoading(prev => new Set([...prev, requestId]));

    try {
      const res = await fetch('/api/core/items/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          originalRequestId: requestId
        }),
        credentials: "include",
      });

      if (res.ok) {
        showToast({
          show: "Success",
          description: "success",
          label: `Successfully submitted return request for ${itemName}`,
        });
        await fetchMyRequests();
      } else {
        const error = await res.json();
        showToast({
          show: "Error",
          description: "error",
          label: error?.error || 'Failed to submit return request',
        });
      }
    } catch (error) {
      showToast({
        show: "Error",
        description: "error",
        label: 'Network error occurred',
      });
    } finally {
      setActionLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleFlagAsBroken = async (requestId, itemId, itemName) => {
    // const userEmail = Cookies.get("email");

    // if (!userEmail) {
    //   showToast({
    //     show: "Error",
    //     description: "error",
    //     label: "Please log in to flag items",
    //   });
    //   return;
    // }

    setActionLoading(prev => new Set([...prev, requestId]));

    try {
      const res = await fetch('/api/core/items/flagBroken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          originalRequestId: requestId
        }),
        credentials: "include",
      });

      if (res.ok) {
        showToast({
          show: "Success",
          description: "success",
          label: `Successfully flagged ${itemName} as broken`,
        });
        await fetchMyRequests();
      } else {
        const error = await res.json();
        showToast({
          show: "Error",
          description: "error",
          label: error?.error || 'Failed to flag item as broken',
        });
      }
    } catch (error) {
      showToast({
        show: "Error",
        description: "error",
        label: 'Network error occurred',
      });
    } finally {
      setActionLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4" />;
      case 'DENIED':
        return <XCircle className="w-4 h-4" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'APPROVED':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'DENIED':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'CANCELLED':
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
      case 'COMPLETED':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'BORROW':
        return <Package className="w-4 h-4" />;
      case 'RETURN':
        return <ArrowLeft className="w-4 h-4" />;
      case 'REPAIR':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'BORROW':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'RETURN':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'REPAIR':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = searchTerm === "" ||
      request.item?.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.item?.serialCode?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const toggleExpanded = (requestId) => {
    setExpandedRequestId(expandedRequestId === requestId ? null : requestId);
  };

  const canPerformActions = (request) => {
    return request.status === 'APPROVED' &&
      request.type === 'BORROW' &&
      request.item?.status === 'IN_USE';
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);


  useEffect(() => {

    const fetchSessionInfo = async () => {
      try {
        const sessionRes = await fetch("/api/who", {
          method: "GET",
          headers: { 'Content-Type': 'application/json' },
          credentials: "include"
        });

        const session = await sessionRes.json();
        console.log("session info: ", session);

        setName(session.user.name)
      }
      catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchSessionInfo();
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <span className="mt-4"><Breadcrumb /></span>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-2 sm:p-4 pt-0 overflow-y-hidden">
          <div className="flex-1 rounded-xl bg-muted/50 p-3 sm:p-4 md:h-auto max-h-[100vh] overflow-y-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
              <span className="text-lg sm:text-xl font-semibold ml-3 mt-3">
                <Typewriter bold={true} text={`Here are your requests, ${name}.`} speed={60} />
              </span>
              <Badge variant="outline" className="text-sm self-start sm:self-auto">
                {filteredRequests.length} {filteredRequests.length === 1 ? 'Request' : 'Requests'}
              </Badge>
            </div>

            {/* SEARCH */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by product name or serial code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 hover:cursor-pointer">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="hover:cursor-pointer" value="all">All Statuses</SelectItem>
                  <SelectItem className="hover:cursor-pointer" value="PENDING">Pending</SelectItem>
                  <SelectItem className="hover:cursor-pointer" value="APPROVED">Approved</SelectItem>
                  <SelectItem className="hover:cursor-pointer" value="DENIED">Denied</SelectItem>
                  <SelectItem className="hover:cursor-pointer" value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem className="hover:cursor-pointer" value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="max-h-screen pb-[35rem] md:pb-[25rem] lg:pb-[15rem] w-full overflow-y-auto overflow-x-hidden">
              <div className="space-y-3 sm:space-y-4 pr-1 sm:pr-2">
                {filteredRequests.length === 0 ? (
                  <Card className="border-none absolute left-1/2 mt-16 -translate-x-1/2 bg-transparent">
                    <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                      <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-3 sm:mb-4" />
                      <p className="text-gray-400 text-center text-sm sm:text-base px-4">
                        {searchTerm || statusFilter !== "all"
                          ? "No requests match your current filters"
                          : "You haven't made any requests yet"}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredRequests.map((request) => (
                    <div key={request.id} className="border border-zinc-700 text-white px-3 sm:px-4 py-3 rounded-md space-y-2">
                      <div className="flex items-start sm:items-center justify-between">
                        <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 cursor-pointer"
                          onClick={() => toggleExpanded(request.id)}
                        >
                          <div className="flex-shrink-0">
                            {request.item?.product?.imageUrl ? (
                              <img
                                src={request.item.product.imageUrl}
                                alt={request.item.product.name}
                                className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md border border-zinc-600"
                              />
                            ) : (
                              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-zinc-700 rounded-md border border-zinc-600 flex items-center justify-center">
                                <Package className="w-4 h-4 sm:w-6 sm:h-6 text-zinc-400" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm sm:text-base truncate pr-2">{request.item?.product?.name || 'Unknown Product'}</div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1 mt-1">
                              <span className="text-xs sm:text-sm text-zinc-400 truncate">{request.item?.serialCode || 'N/A'}</span>
                              <span className="text-zinc-600 hidden sm:inline">•</span>
                              <span className="text-xs sm:text-sm text-zinc-400">
                                {new Date(request.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 sm:mt-3">
                              {request.item?.product?.labels && request.item.product.labels.length > 0 ? (
                                <>
                                  <span className="mr-1 text-xs sm:text-sm text-zinc-300 font-medium">Labels:</span>
                                  {request.item.product.labels.map((label) => (
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

                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm text-zinc-300 mt-3 sm:mt-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">Type:</span>
                            <Badge
                              variant="outline"
                              className={`${getTypeColor(request.type)} border font-semibold text-xs`}
                            >
                              <div className="flex items-center gap-1">
                                {getTypeIcon(request.type)}
                                <span>{request.type}</span>
                              </div>
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">Status:</span>
                            <Badge
                              variant="outline"
                              className={`${getStatusColor(request.status)} border font-semibold text-xs`}
                            >
                              <div className="flex items-center gap-1">
                                {getStatusIcon(request.status)}
                                <span>{request.status}</span>
                              </div>
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {expandedRequestId === request.id && (
                        <div className="mt-4 border-t border-zinc-600 pt-4 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                              <p className="text-xs sm:text-sm text-gray-400 mb-1">Serial Code</p>
                              <p className="font-medium text-white text-sm sm:text-base break-all">{request.item?.serialCode || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm text-gray-400 mb-1">Item Status</p>
                              <Badge
                                variant="outline"
                                className={`${request.item?.status === 'AVAILABLE' ? 'text-emerald-400 border-emerald-400/20' :
                                  request.item?.status === 'IN_USE' ? 'text-blue-400 border-blue-400/20' :
                                    request.item?.status === 'BROKEN' ? 'text-red-400 border-red-400/20' :
                                      'text-yellow-400 border-yellow-400/20'} font-semibold text-xs`}
                              >
                                {request.item?.status || 'UNKNOWN'}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm text-gray-400 mb-1">Request Date</p>
                              <p className="font-medium text-white text-sm sm:text-base">
                                {new Date(request.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm text-gray-400 mb-1">Request ID</p>
                              <p className="font-medium text-white text-sm sm:text-base">#{request.id}</p>
                            </div>
                          </div>

                          {request.item?.product?.location && (
                            <div>
                              <p className="text-xs sm:text-sm text-gray-400 mb-1">Location</p>
                              <p className="text-xs sm:text-sm text-gray-300">{request.item.product.location}</p>
                            </div>
                          )}

                          {request.item?.product?.description && (
                            <div>
                              <p className="text-xs sm:text-sm text-gray-400 mb-1">Product Description</p>
                              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">{request.item.product.description}</p>
                            </div>
                          )}

                          {/* BUTTONS */}
                          {canPerformActions(request) && (
                            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-zinc-700">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReturnItem(request.id, request.item.id, request.item.product.name)}
                                disabled={actionLoading.has(request.id)}
                                className="flex items-center justify-center gap-2 hover:bg-green-500/10 hover:border-green-500/50 hover:text-green-400 w-full sm:w-auto"
                              >
                                <RotateCcw className="w-4 h-4" />
                                {actionLoading.has(request.id) ? 'Processing...' : 'Return Item'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleFlagAsBroken(request.id, request.item.id, request.item.product.name)}
                                disabled={actionLoading.has(request.id)}
                                className="flex items-center justify-center gap-2 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 w-full sm:w-auto"
                              >
                                <Flag className="w-4 h-4" />
                                {actionLoading.has(request.id) ? 'Processing...' : 'Flag as Broken'}
                              </Button>
                            </div>
                          )}

                          {request.statusLogs && request.statusLogs.length > 0 && (
                            <div className="pt-4 border-t border-zinc-700">
                              <p className="text-xs sm:text-sm text-gray-400 mb-2">Status History</p>
                              <div className="space-y-2">
                                {request.statusLogs.map((log, index) => (
                                  <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs gap-1 sm:gap-0">
                                    <div className="flex items-center gap-2">
                                      {getStatusIcon(log.status)}
                                      <span className="text-gray-300">{log.status}</span>
                                      <span className="text-gray-500">by {log.changedByName}</span>
                                    </div>
                                    <span className="text-gray-500 text-xs">
                                      {new Date(log.createdAt).toLocaleString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}