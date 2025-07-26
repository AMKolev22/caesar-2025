"use client"

import { AppSidebar } from "@/components/app-siderbar-admin"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import Breadcrumb from '@/components/breadcrumb';
import {
  Search,
  MoreHorizontal,
  Shield,
  Crown,
  User,
} from 'lucide-react';


import { useEffect, useRef, useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useRouter } from "next/navigation";

export default function Page() {
  const [users, setUsers] = useState([]);
  // const [filteredUsers, setFilteredUsers]
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [openPopoverId, setOpenPopoverId] = useState(null);
  const [selectedRank, setSelectedRank] = useState('');
  const [confirmationData, setConfirmationData] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [rank, setRank] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/who', {
          credentials: 'include'
        });
        const data = await res.json();
        if (res.ok && data.success) {
          console.log(data);
          setRank(data.user.rank);
          if (rank != "Manager" && rank != "Admin")
            router.push("/no-permission")

        }
      }
      catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };

    fetchUser();
  }, []);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 'ADMIN':
        return <Shield className="w-4 h-4" />;
      case 'MANAGER':
        return <Crown className="w-4 h-4" />;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 'ADMIN':
        return 'text-red-500 bg-red-500/20';
      case 'MANAGER':
        return 'text-emerald-400 bg-emerald-400/20';
    }
  };

  const handleRankSelection = (userId, newRank, userName) => {
    setSelectedRank(newRank);
    setConfirmationData({ userId, newRank, userName });
    setShowConfirmation(true);
  };

  const confirmRankChange = async () => {
    if (!confirmationData) return;

    try {
      // API call to update user rank
      const response = await fetch(`/api/users/${confirmationData.userId}/rank`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rank: confirmationData.newRank }),
      });

      if (response.ok) {
        // updates local state
        setUsers(prevUsers =>
          prevUsers.map(userEntry =>
            userEntry.userId === confirmationData.userId
              ? { ...userEntry, user: { ...userEntry.user, rank: confirmationData.newRank } }
              : userEntry
          )
        );
        setOpenPopoverId(null);
        setShowConfirmation(false);
        setConfirmationData(null);
        setSelectedRank('');
      } else {
        console.error('Failed to update user rank');
      }
    } catch (error) {
      console.error('Error updating user rank:', error);
    }
  };

  const cancelRankChange = () => {
    setShowConfirmation(false);
    setConfirmationData(null);
    setSelectedRank('');
  };


  const getUsers = async () => {
    const res = await fetch('/api/config/organisationInfo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await res.json();
    setUsers(data.data[0]?.users || []);
    console.log(data.data[0]?.users);
  }

  useEffect(() => {
    getUsers();
  }, []);
  const filteredUsers = users.filter(userEntry =>
    userEntry.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    userEntry.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <h1 className="text-lg sm:text-xl font-semibold">Current Members</h1>
            </div>

            <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search a person's name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
            </div>

            <ScrollArea className="h-full w-full">
              <div className="space-y-2 pr-1 sm:pr-2">
                {filteredUsers.map((userEntry) => {
                  const user = userEntry.user;
                  const userId = userEntry.userId;
                  const requests = user.requests || [];
                  const hasRequests = requests.length > 0;

                  // count stats
                  const statusCounts = requests.reduce(
                    (acc, req) => {
                      acc[req.status] = (acc[req.status] || 0) + 1;
                      return acc;
                    },
                    {}
                  );

                  return (
                    <div
                      key={userId}
                      className="border border-zinc-700 text-white px-2 sm:px-4 py-3 rounded-md space-y-2"
                    >
                      <div
                        className="flex items-start sm:items-center justify-between cursor-pointer gap-2"
                        onClick={() =>
                          setExpandedUserId(userId === expandedUserId ? null : userId)
                        }
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1 min-w-0 justify-between">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div onClick={() => console.log(user)} className="font-medium text-sm sm:text-base truncate">
                              {user.name}
                            </div>
                            {user.rank !== 'USER' && (
                              <Badge className={`${getRankColor(user.rank)} flex items-center gap-1 text-xs shrink-0`}>
                                {user.rank}
                                {getRankIcon(user.rank)}
                                <span className="hidden xs:inline">{user.rank}</span>
                              </Badge>
                            )}
                          </div>

                          {user.rank === 'USER' && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 text-xs sm:text-sm text-zinc-300 min-w-0">
                              <div className="flex items-center gap-1 min-w-0">
                                <span className="font-semibold text-white shrink-0">Email:</span>
                                <span className="truncate">{user.email}</span>
                              </div>

                              <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 sm:gap-4 text-xs">
                                {/* Approved requests counter */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
                                  <span className="font-semibold text-white">Approved:</span>
                                  <span className={`font-semibold ${hasRequests ? "text-emerald-400" : "text-zinc-400"}`}>
                                    {hasRequests && statusCounts.APPROVED > 0 ? statusCounts.APPROVED : "None"}
                                  </span>
                                </div>

                                {/* Denied requests counter */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
                                  <span className="font-semibold text-white">Denied:</span>
                                  <span className={`font-semibold ${hasRequests ? "text-red-500" : "text-zinc-400"}`}>
                                    {hasRequests && statusCounts.DENIED > 0 ? statusCounts.DENIED : "None"}
                                  </span>
                                </div>

                                {/* Pending requests counter */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
                                  <span className="font-semibold text-white">Pending:</span>
                                  <span className={`font-semibold ${hasRequests ? "text-yellow-400" : "text-zinc-400"}`}>
                                    {hasRequests && statusCounts.PENDING > 0 ? statusCounts.PENDING : "None"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* actions popover */}
                        <Popover open={openPopoverId === userId} onOpenChange={(open) => setOpenPopoverId(open ? userId : null)}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-8 h-8 p-0 text-zinc-400 hover:text-white shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenPopoverId(openPopoverId === userId ? null : userId);
                              }}
                            >
                              {user.rank !== "MANAGER" && (
                                <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72 sm:w-80 p-3" align="end">
                            {!showConfirmation ? (
                              <div className="space-y-3">
                                <div className="font-semibold text-sm">Change User Rank</div>
                                <Select
                                  value={selectedRank || user.rank}
                                  onValueChange={(newRank) => setSelectedRank(newRank)}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="USER">
                                      <div className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        User
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="ADMIN">
                                      <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        Admin
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                {selectedRank && selectedRank !== user.rank && (
                                  <Button
                                    onClick={() => handleRankSelection(userId, selectedRank, user.name)}
                                    className="w-full"
                                    size="sm"
                                  >
                                    Change Rank
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="font-semibold text-sm">Confirm Rank Change</div>
                                <p className="text-sm text-muted-foreground">
                                  You will change <span className="font-semibold text-foreground">{confirmationData?.userName}</span> rank to{" "}
                                  <span className="font-semibold text-foreground">{confirmationData?.newRank}</span>
                                </p>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={confirmRankChange}
                                    size="sm"
                                    className="flex-1"
                                  >
                                    Confirm
                                  </Button>
                                  <Button
                                    onClick={cancelRankChange}
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                          </PopoverContent>
                        </Popover>
                      </div>

                      {expandedUserId === userId && (
                        <div className="mt-4 border-t border-zinc-600 pt-4 space-y-2">
                          <h4 className="font-semibold text-white text-sm sm:text-base">Requests</h4>
                          {hasRequests ? (
                            <div className="space-y-2">
                              {requests.map((req, idx) => {
                                const statusTextColors = {
                                  APPROVED: "text-emerald-400",
                                  DENIED: "text-red-500",
                                  PENDING: "text-yellow-400",
                                };

                                const statusText =
                                  statusTextColors[req.status] || "text-gray-400";

                                return (
                                  <div
                                    key={idx}
                                    className="text-sm text-zinc-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 sm:p-3 rounded-md border border-zinc-600"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-wrap items-center gap-1 text-xs sm:text-sm">
                                        <span className="text-white font-semibold">
                                          [{req.type}]
                                        </span>
                                        <span>item: #{req.itemId}</span>
                                      </div>
                                      <div className="text-xs text-zinc-400 mt-1">
                                        <span>created: </span>
                                        <span className="hidden sm:inline">
                                          {new Date(req.createdAt).toDateString()} at{" "}
                                          {new Date(req.createdAt).toLocaleTimeString()}
                                        </span>
                                        <span className="sm:hidden">
                                          {new Date(req.createdAt).toLocaleDateString()} {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-end sm:justify-start">
                                      <span className={`px-2 py-1 text-xs font-semibold ${statusText} rounded whitespace-nowrap`}>
                                        <span className="text-white">STATUS: </span>
                                        {req.status}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-zinc-400 text-sm">No requests found.</p>
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
};