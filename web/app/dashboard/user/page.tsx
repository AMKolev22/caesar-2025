"use client"

import { Package, Clock, CheckCircle, XCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Typewriter } from "@/components/Typewriter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Page() {

  const [user, setUser] = useState({
    assignedItems: [],
    email: "",
    id: null,
    isAdmin: false,
    name: "",
    organisations: [],
    requests: [],
  })
  const [myRequests, setMyRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);

  const fetchUserRequests = async () => {
    const userEmail = Cookies.get("email");

    if (!userEmail) {
      setRequestsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/core/requests/myRequests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail })
      });

      if (res.ok) {
        const data = await res.json();
        setMyRequests(data.requests || []);
        console.log(data.requests)
      }
    }
    catch (error) {
      console.error('Network error:', error);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    let email = Cookies.get('email');
    if (!email) return;

    const getUser = async () => {
      try {
        const res = await fetch('/api/userData', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();
        console.log(data);

        if (!res.ok) {
          console.error(data.error);
          return;
        }

        setUser(data.user);
      }
      catch (err) {
        console.error(err);
      }
    };

    getUser();
    fetchUserRequests();
  }, []);


  const borrowedPerDay = Array(7).fill(0);

  user.assignedItems.forEach(item => {
    const day = new Date(item.createdAt).getDay();
    borrowedPerDay[day]++;
  });

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const chartData = dayLabels.map((day, index) => ({
    day,
    count: borrowedPerDay[index],
  }));


  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>
        <div className="flex-1 rounded-xl bg-muted/50 p-2 sm:p-4 md:h-auto mx-2 sm:mx-4 mb-2 sm:mb-4">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <span className="font-semibold text-lg sm:text-xl mt-2 sm:mt-4 ml-2 sm:ml-4">
              <Typewriter bold={true} text={`Welcome back, ${user.name}.`} speed={60} />
            </span>
          </div>
          <div className="flex flex-col gap-4 sm:gap-6 mt-8 sm:mt-14">
            {/* Borrowed Items Card */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg">
                  Here's an overview of your borrowed items{" "}
                  <span className="text-emerald-400">
                    ({user.assignedItems.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-h-40 sm:max-h-none overflow-y-auto sm:overflow-visible">
                  {user.assignedItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl w-full sm:w-fit shadow p-3 sm:p-4 border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-x-6"
                    >
                      <div className="text-base sm:text-lg font-bold text-white">
                        {item.serialCode}
                      </div>
                      <div className="text-xs sm:text-sm text-zinc-400">
                        Borrowed:{" "}
                        <span className="font-semibold text-white">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Charts and Requests Section */}
            <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 mt-4 sm:mt-6">
              {/* Chart Card */}
              <Card className="w-full xl:w-1/2">
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="text-base sm:text-lg">Borrowed Items Per Day</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200} className="sm:h-[250px]">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="day"
                        fontSize={12}
                        className="sm:text-sm"
                      />
                      <YAxis
                        allowDecimals={false}
                        fontSize={12}
                        className="sm:text-sm"
                      />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="w-full xl:w-1/2">
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="text-base sm:text-lg">Overview of your requests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {requestsLoading ? (
                    <div className="flex items-center justify-center py-8 sm:py-12">
                      <div className="text-xs sm:text-sm text-gray-500">Loading your requests...</div>
                    </div>
                  ) : myRequests.length === 0 ? (
                    <div className="flex items-center justify-center py-8 sm:py-12">
                      <div className="text-xs sm:text-sm text-gray-500">No requests found</div>
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3 -mt-6 max-h-60 sm:max-h-80 overflow-y-auto mb-3">
                      {myRequests
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .slice(0, 2)
                        .map((req) => (
                          <div key={req.id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg border">
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                              {req.item?.product?.imageUrl ? (
                                <img
                                  src={req.item.product.imageUrl}
                                  alt={req.item.product.name}
                                  className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-md border flex-shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md border flex items-center justify-center flex-shrink-0">
                                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </div>
                              )}

                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-xs sm:text-sm truncate flex flex-wrap items-center gap-1">
                                  <span className="mr-2">{req.item?.product?.name || 'Unknown Product'}</span>
                                  {req.item?.product?.labels?.map((label, idx) => (
                                    <Badge
                                      key={label.id}
                                      style={{
                                        backgroundColor: `${label.color}33`,
                                        color: label.color,
                                        boxShadow: `inset 0 0 0 1px ${label.color}80`,
                                      }}
                                      className="text-xs font-medium mr-1 px-2 py-0.5 rounded-md border-0"
                                    >
                                      {label.name}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="text-xs text-white">
                                  <span className="sm:inline hidden">{req.item?.serialCode || 'N/A'} • </span>
                                  <span className="text-zinc-400 text-xs">
                                    {new Date(req.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                              <Badge
                                variant="outline"
                                className={`text-xs px-1 sm:px-2 py-1 ${req.status === 'PENDING' ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' :
                                    req.status === 'APPROVED' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/200' :
                                      req.status === 'DENIED' ? 'text-red-500 bg-red-500/10 border-red-500/20' :
                                        req.status === 'COMPLETED' ? 'text-blue-500 bg-blue-500/10 border-blue-500/20' :
                                          'text-gray-600 bg-gray-50 border-gray-200'
                                  }`}
                              >
                                <div className="flex items-center gap-1">
                                  {req.status === 'PENDING' && <Clock className="w-2 h-2 sm:w-3 sm:h-3" />}
                                  {req.status === 'APPROVED' && <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3" />}
                                  {req.status === 'DENIED' && <XCircle className="w-2 h-2 sm:w-3 sm:h-3" />}
                                  {req.status === 'COMPLETED' && <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3" />}
                                  <span className="hidden sm:inline">{req.status}</span>
                                  <span className="sm:hidden text-xs">
                                    {req.status.substring(0, 3)}
                                  </span>
                                </div>
                              </Badge>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  )}

                  {!requestsLoading && myRequests.length > 0 && (
                    <div className="pt-2 sm:pt-3 hover:-translate-y-1 duration-300 mt-4 ">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs sm:text-sm py-2 cursor-pointer"
                        onClick={() => window.location.href = '/dashboard/user/myRequests'}
                      >
                        See All Requests <span className="inline text-emerald-400">({myRequests.length})</span>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
