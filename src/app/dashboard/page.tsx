"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BASEURL } from "@/app/constants/url";
import {
  Users,
  DollarSign,
  FileText,
  TrendingUp,
  Shield,
  Activity,
  CreditCard,
  Settings,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalUsers: number;
  premiumUsers: number;
  totalRevenue: number;
  totalPosts: number;
  premiumConversionRate: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    premiumUsers: 0,
    totalRevenue: 0,
    totalPosts: 0,
    premiumConversionRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(
        `${BASEURL}/api/premium/admin/revenue`
      );
      const data = await response.json();

      if (data.success) {
        setStats({
          totalUsers: data.stats.totalUsers,
          premiumUsers: data.stats.premiumUsers,
          totalRevenue: data.stats.totalRevenue,
          totalPosts: 0, // Will be fetched separately
          premiumConversionRate: parseFloat(data.stats.premiumConversionRate),
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F1F1E6] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#0694FA]/30 border-t-[#0694FA] mx-auto"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-[#0694FA]/20 opacity-20"></div>
          </div>
          <p className="mt-6 text-[#1E293B] font-medium">
            Loading admin dashboard...
          </p>
          <p className="mt-2 text-sm text-[#1E293B]/70">
            Please wait while we fetch your data
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F1F1E6] relative overflow-x-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#0694FA]/10 rounded-full blur-3xl opacity-40 -z-10" />
      <div className="absolute top-20 right-0 w-72 h-72 bg-[#1E293B]/10 rounded-full blur-3xl opacity-30 -z-10" />
      <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-[#0694FA]/10 rounded-full blur-3xl opacity-25 -z-10" />

      {/* Top bar */}
      <div className="w-full h-1 bg-[#0694FA] shadow-sm" />

      {/* Enhanced Header with better spacing and visual hierarchy */}
      <div className="bg-white/95 backdrop-blur-md shadow-lg border-b border-[#1E293B]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-8 space-y-4 sm:space-y-0">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-[#0694FA]">
                Admin Dashboard
              </h1>
              <p className="text-lg text-[#1E293B]/70 font-medium">
                Manage your platform and monitor performance
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge
                variant="secondary"
                className="bg-[#F5F5FF] text-[#0694FA] border-[#0694FA]/30 px-4 py-2 text-sm font-semibold"
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin Access
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with improved spacing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Enhanced Stats Cards with better visual design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="group hover:shadow-xl transition-all duration-300 border border-[#1E293B]/10 bg-white/70 backdrop-blur-sm hover:bg-white/90 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-[#1E293B]/70 uppercase tracking-wide">
                Total Users
              </CardTitle>
              <div className="p-2 bg-[#F5F5FF] rounded-lg group-hover:bg-[#0694FA]/20 transition-colors duration-300">
                <Users className="h-5 w-5 text-[#0694FA]" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-[#1E293B] mb-1">
                {stats.totalUsers.toLocaleString()}
              </div>
              <p className="text-sm text-[#1E293B]/60 font-medium">
                Active platform users
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border border-[#1E293B]/10 bg-white/70 backdrop-blur-sm hover:bg-white/90 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-[#1E293B]/70 uppercase tracking-wide">
                Premium Users
              </CardTitle>
              <div className="p-2 bg-[#F5F5FF] rounded-lg group-hover:bg-[#0694FA]/20 transition-colors duration-300">
                <Shield className="h-5 w-5 text-[#0694FA]" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-[#1E293B] mb-1">
                {stats.premiumUsers.toLocaleString()}
              </div>
              <p className="text-sm text-[#1E293B]/60 font-medium">
                {stats.premiumConversionRate}% conversion rate
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border border-[#1E293B]/10 bg-white/70 backdrop-blur-sm hover:bg-white/90 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-[#1E293B]/70 uppercase tracking-wide">
                Total Revenue
              </CardTitle>
              <div className="p-2 bg-[#F5F5FF] rounded-lg group-hover:bg-[#0694FA]/20 transition-colors duration-300">
                <DollarSign className="h-5 w-5 text-[#0694FA]" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-[#1E293B] mb-1">
                ₫{stats.totalRevenue.toLocaleString()}
              </div>
              <p className="text-sm text-[#1E293B]/60 font-medium">
                From premium subscriptions
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border border-[#1E293B]/10 bg-white/70 backdrop-blur-sm hover:bg-white/90 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-[#1E293B]/70 uppercase tracking-wide">
                Total Posts
              </CardTitle>
              <div className="p-2 bg-[#F5F5FF] rounded-lg group-hover:bg-[#0694FA]/20 transition-colors duration-300">
                <FileText className="h-5 w-5 text-[#0694FA]" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-[#1E293B] mb-1">
                {stats.totalPosts.toLocaleString()}
              </div>
              <p className="text-sm text-[#1E293B]/60 font-medium">
                User-generated content
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Navigation Tabs with better styling */}
        <Tabs defaultValue="overview" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-white/70 backdrop-blur-sm border border-[#1E293B]/10 shadow-lg p-1 rounded-2xl">
              <TabsTrigger
                value="overview"
                className="rounded-xl font-semibold text-sm data-[state=active]:bg-[#0694FA] data-[state=active]:text-white transition-all duration-300"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="rounded-xl font-semibold text-sm data-[state=active]:bg-[#0694FA] data-[state=active]:text-white transition-all duration-300"
              >
                Users
              </TabsTrigger>
              <TabsTrigger
                value="revenue"
                className="rounded-xl font-semibold text-sm data-[state=active]:bg-[#0694FA] data-[state=active]:text-white transition-all duration-300"
              >
                Revenue
              </TabsTrigger>
              <TabsTrigger
                value="posts"
                className="rounded-xl font-semibold text-sm data-[state=active]:bg-[#0694FA] data-[state=active]:text-white transition-all duration-300"
              >
                Posts
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-[10px]">
              <Card className="border border-[#1E293B]/10 bg-white/70 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-xl font-bold text-[#1E293B]">
                    <div className="p-2 bg-[#F5F5FF] rounded-xl mr-3">
                      <Activity className="w-6 h-6 text-[#0694FA]" />
                    </div>
                    Platform Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-[#F5F5FF] rounded-xl">
                      <div>
                        <span className="text-sm font-semibold text-[#1E293B]/70 uppercase tracking-wide">
                          Premium Conversion
                        </span>
                        <p className="text-xs text-[#1E293B]/60">
                          User upgrade rate
                        </p>
                      </div>
                      <span className="text-2xl font-bold text-[#0694FA]">
                        {stats.premiumConversionRate}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-[#F5F5FF] rounded-xl">
                      <div>
                        <span className="text-sm font-semibold text-[#1E293B]/70 uppercase tracking-wide">
                          Avg Revenue per User
                        </span>
                        <p className="text-xs text-[#1E293B]/60">
                          Premium subscriber
                        </p>
                      </div>
                      <span className="text-2xl font-bold text-[#0694FA]">
                        ₫
                        {(
                          stats.totalRevenue / Math.max(stats.premiumUsers, 1)
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-[#F5F5FF] rounded-xl">
                      <div>
                        <span className="text-sm font-semibold text-[#1E293B]/70 uppercase tracking-wide">
                          Active Premium Users
                        </span>
                        <p className="text-xs text-[#1E293B]/60">
                          Currently subscribed
                        </p>
                      </div>
                      <span className="text-2xl font-bold text-[#0694FA]">
                        {stats.premiumUsers}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-[#1E293B]/10 bg-white/70 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-xl font-bold text-[#1E293B]">
                    <div className="p-2 bg-[#F5F5FF] rounded-xl mr-3">
                      <TrendingUp className="w-6 h-6 text-[#0694FA]" />
                    </div>
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 pt-2">
                    <Link href="/dashboard/users" className="block">
                      <Button className="w-full justify-between p-3 h-auto bg-[#0694FA] hover:bg-[#1E293B] text-white border-0 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          <div className="text-left">
                            <div className="font-medium text-sm">Manage Users</div>
                            <div className="text-xs opacity-80">
                              View and edit user profiles
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href="/dashboard/revenue" className="block">
                      <Button className="w-full justify-between p-3 h-auto bg-[#0694FA] hover:bg-[#1E293B] text-white border-0 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-2" />
                          <div className="text-left">
                            <div className="font-medium text-sm">View Revenue</div>
                            <div className="text-xs opacity-80">
                              Track earnings and transactions
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href="/dashboard/posts" className="block">
                      <Button className="w-full justify-between p-3 h-auto bg-[#0694FA] hover:bg-[#1E293B] text-white border-0 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          <div className="text-left">
                            <div className="font-medium text-sm">Moderate Posts</div>
                            <div className="text-xs opacity-80">
                              Review user content
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button className="w-full justify-between p-3 h-auto bg-[#1E293B] hover:bg-[#0694FA] text-white border-0 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                      <div className="flex items-center">
                        <Settings className="w-4 h-4 mr-2" />
                        <div className="text-left">
                          <div className="font-medium text-sm">Platform Settings</div>
                          <div className="text-xs opacity-80">
                            Configure system preferences
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="border border-[#1E293B]/10 bg-white/70 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center text-2xl font-bold text-[#1E293B]">
                  <div className="p-3 bg-[#F5F5FF] rounded-xl mr-4">
                    <Users className="w-7 h-7 text-[#0694FA]" />
                  </div>
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-[#1E293B]/70 text-lg leading-relaxed">
                  Manage platform users, roles, and premium subscriptions with
                  comprehensive tools and analytics.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-[#F5F5FF] rounded-2xl">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#0694FA]">
                      {stats.totalUsers}
                    </div>
                    <div className="text-sm text-[#1E293B]/60">Total Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#0694FA]">
                      {stats.premiumUsers}
                    </div>
                    <div className="text-sm text-[#1E293B]/60">Premium Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#0694FA]">
                      {stats.premiumConversionRate}%
                    </div>
                    <div className="text-sm text-[#1E293B]/60">Conversion Rate</div>
                  </div>
                </div>
                <Link href="/dashboard/users">
                  <Button className="w-full sm:w-auto bg-[#0694FA] hover:bg-[#1E293B] text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <Users className="w-5 h-5 mr-3" />
                    Go to User Management
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <Card className="border border-[#1E293B]/10 bg-white/70 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center text-2xl font-bold text-[#1E293B]">
                  <div className="p-3 bg-[#F5F5FF] rounded-xl mr-4">
                    <DollarSign className="w-7 h-7 text-[#0694FA]" />
                  </div>
                  Revenue Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-[#1E293B]/70 text-lg leading-relaxed">
                  Track earnings, transactions, and premium subscription
                  analytics with detailed reporting tools.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-[#F5F5FF] rounded-2xl">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#0694FA]">
                      ₫{stats.totalRevenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-[#1E293B]/60">Total Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#0694FA]">
                      ₫
                      {(
                        stats.totalRevenue / Math.max(stats.premiumUsers, 1)
                      ).toLocaleString()}
                    </div>
                    <div className="text-sm text-[#1E293B]/60">
                      Avg per Premium User
                    </div>
                  </div>
                </div>
                <Link href="/dashboard/revenue">
                  <Button className="w-full sm:w-auto bg-[#0694FA] hover:bg-[#1E293B] text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <DollarSign className="w-5 h-5 mr-3" />
                    Go to Revenue Management
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            <Card className="border border-[#1E293B]/10 bg-white/70 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center text-2xl font-bold text-[#1E293B]">
                  <div className="p-3 bg-[#F5F5FF] rounded-xl mr-4">
                    <FileText className="w-7 h-7 text-[#0694FA]" />
                  </div>
                  Post Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-[#1E293B]/70 text-lg leading-relaxed">
                  Moderate user-generated content, manage posts, and ensure
                  community guidelines compliance.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 p-6 bg-[#F5F5FF] rounded-2xl">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#0694FA]">
                      {stats.totalPosts.toLocaleString()}
                    </div>
                    <div className="text-sm text-[#1E293B]/60">
                      Total Posts Created
                    </div>
                  </div>
                </div>
                <Link href="/dashboard/posts">
                  <Button className="w-full sm:w-auto bg-[#0694FA] hover:bg-[#1E293B] text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <FileText className="w-5 h-5 mr-3" />
                    Go to Post Management
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}