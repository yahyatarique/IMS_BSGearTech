'use client'

import { StatCard } from "@/components/pages/dashboard/components/dashboard-cards";
import { RecentOrders } from "@/components/pages/dashboard/components/recent-orders";
import { RecentBuyers } from "@/components/pages/dashboard/components/recent-buyers";
import { MaterialsAndProfiles } from "@/components/pages/dashboard/components/materials-and-profiles";
import { ShoppingCart, Users, Package } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-2">
            Welcome back, Admin
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your inventory today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <StatCard
            title="Total Orders"
            value="1,284"
            icon={ShoppingCart}
            gradient="from-blue-500 to-cyan-500"
            trend={{ value: "12.5%", isPositive: true }}
            description="From all time"
          />
          <StatCard
            title="Active Buyers"
            value="342"
            icon={Users}
            gradient="from-indigo-500 to-blue-500"
            trend={{ value: "8.2%", isPositive: true }}
            description="Registered customers"
          />
          <StatCard
            title="Total Products"
            value="856"
            icon={Package}
            gradient="from-green-500 to-emerald-500"
            trend={{ value: "3.1%", isPositive: false }}
            description="In inventory"
          />
        </div>

        {/* Recent Orders Section */}
        <div className="mb-8">
          <RecentOrders />
        </div>

        {/* Recent Buyers Section */}
        <div className="mb-8">
          <RecentBuyers />
        </div>

        {/* Materials and Profiles Section */}
        <MaterialsAndProfiles />
      </main>
    </div>
  );
}
