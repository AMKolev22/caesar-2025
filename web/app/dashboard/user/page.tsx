"use client"
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

        <div className="flex-1 rounded-xl bg-muted/50 p-4 md:h-auto ml-4 mr-4 mb-4">
          <div className="flex items-center justify-between mb-6">
            <span className="font-semibold text-xl mt-4 ml-4">
              <Typewriter bold={true} text={`Welcome back, ${user.name}.`} speed={60} />
            </span>
          </div>
          <div className="flex flex-col gap-6 mt-14">
            <Card>
              <CardHeader>
                <CardTitle>
                  Here's an overview of your borrowed items{" "}
                  <span className="text-emerald-400">
                    ({user.assignedItems.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-row gap-4">
                  {user.assignedItems.map((item) => (
                    <>
                    <div
                      key={item.id}
                      className="rounded-2xl w-fit shadow p-4 border flex justify-between flex-row items-center gap-x-6"
                    >
                      <div className="text-lg font-bold text-white">
                        {item.serialCode}
                      </div>
                      <div className="text-sm text-zinc-400 md:mt-1 sm:mt-1 lg:mt-1 xl:mt-0">
                        Borrowed:{" "}
                        <span className="font-semibold text-white">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    </>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="flex flex-col lg:flex-row gap-4 mt-6">
              <Card className="w-full lg:w-1/2">
                <CardHeader>
                  <CardTitle>Borrowed Items Per Day</CardTitle>
                </CardHeader>
                <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#4f46e5" />
                  </LineChart>
                </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="w-full lg:w-1/2">
                <CardHeader>
                  <CardTitle>Overview of your requests</CardTitle>
                </CardHeader>
                <CardContent>
                  
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
