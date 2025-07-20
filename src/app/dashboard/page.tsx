"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/premium/admin/revenue`
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-blue-300 opacity-20"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">
            Loading admin dashboard...
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Please wait while we fetch your data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Enhanced Header with better spacing and visual hierarchy */}
      <div className="bg-white shadow-lg border-b border-gray-100 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-8 space-y-4 sm:space-y-0">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-lg text-gray-600 font-medium">
                Manage your platform and monitor performance
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge
                variant="secondary"
                className="bg-green-50 text-green-700 border-green-200 px-4 py-2 text-sm font-semibold"
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
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm hover:bg-white/90 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Total Users
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-300">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.totalUsers.toLocaleString()}
              </div>
              <p className="text-sm text-gray-500 font-medium">
                Active platform users
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm hover:bg-white/90 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Premium Users
              </CardTitle>
              <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors duration-300">
                <Shield className="h-5 w-5 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.premiumUsers.toLocaleString()}
              </div>
              <p className="text-sm text-gray-500 font-medium">
                {stats.premiumConversionRate}% conversion rate
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm hover:bg-white/90 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Total Revenue
              </CardTitle>
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-300">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                ₫{stats.totalRevenue.toLocaleString()}
              </div>
              <p className="text-sm text-gray-500 font-medium">
                From premium subscriptions
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm hover:bg-white/90 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Total Posts
              </CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors duration-300">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.totalPosts.toLocaleString()}
              </div>
              <p className="text-sm text-gray-500 font-medium">
                User-generated content
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Navigation Tabs with better styling */}
        <Tabs defaultValue="overview" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-white/70 backdrop-blur-sm border-0 shadow-lg p-1 rounded-2xl">
              <TabsTrigger
                value="overview"
                className="rounded-xl font-semibold text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="rounded-xl font-semibold text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300"
              >
                Users
              </TabsTrigger>
              <TabsTrigger
                value="revenue"
                className="rounded-xl font-semibold text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300"
              >
                Revenue
              </TabsTrigger>
              <TabsTrigger
                value="posts"
                className="rounded-xl font-semibold text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300"
              >
                Posts
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                    <div className="p-2 bg-blue-100 rounded-xl mr-3">
                      <Activity className="w-6 h-6 text-blue-600" />
                    </div>
                    Platform Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                      <div>
                        <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                          Premium Conversion
                        </span>
                        <p className="text-xs text-gray-500">
                          User upgrade rate
                        </p>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">
                        {stats.premiumConversionRate}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                      <div>
                        <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                          Avg Revenue per User
                        </span>
                        <p className="text-xs text-gray-500">
                          Premium subscriber
                        </p>
                      </div>
                      <span className="text-2xl font-bold text-green-600">
                        ₫
                        {(
                          stats.totalRevenue / Math.max(stats.premiumUsers, 1)
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                      <div>
                        <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                          Active Premium Users
                        </span>
                        <p className="text-xs text-gray-500">
                          Currently subscribed
                        </p>
                      </div>
                      <span className="text-2xl font-bold text-purple-600">
                        {stats.premiumUsers}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                    <div className="p-2 bg-purple-100 rounded-xl mr-3">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href="/dashboard/users">
                    <Button className="w-full justify-between p-4 h-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <div className="flex items-center">
                        <Users className="w-5 h-5 mr-3" />
                        <div className="text-left">
                          <div className="font-semibold">Manage Users</div>
                          <div className="text-xs opacity-90">
                            View and edit user profiles
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/dashboard/revenue">
                    <Button className="w-full justify-between p-4 h-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <div className="flex items-center">
                        <CreditCard className="w-5 h-5 mr-3" />
                        <div className="text-left">
                          <div className="font-semibold">View Revenue</div>
                          <div className="text-xs opacity-90">
                            Track earnings and transactions
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/dashboard/posts">
                    <Button className="w-full justify-between p-4 h-auto bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 mr-3" />
                        <div className="text-left">
                          <div className="font-semibold">Moderate Posts</div>
                          <div className="text-xs opacity-90">
                            Review user content
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Button className="w-full justify-between p-4 h-auto bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white border-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center">
                      <Settings className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <div className="font-semibold">Platform Settings</div>
                        <div className="text-xs opacity-90">
                          Configure system preferences
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center text-2xl font-bold text-gray-800">
                  <div className="p-3 bg-blue-100 rounded-xl mr-4">
                    <Users className="w-7 h-7 text-blue-600" />
                  </div>
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-600 text-lg leading-relaxed">
                  Manage platform users, roles, and premium subscriptions with
                  comprehensive tools and analytics.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.totalUsers}
                    </div>
                    <div className="text-sm text-gray-600">Total Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {stats.premiumUsers}
                    </div>
                    <div className="text-sm text-gray-600">Premium Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.premiumConversionRate}%
                    </div>
                    <div className="text-sm text-gray-600">Conversion Rate</div>
                  </div>
                </div>
                <Link href="/dashboard/users">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <Users className="w-5 h-5 mr-3" />
                    Go to User Management
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center text-2xl font-bold text-gray-800">
                  <div className="p-3 bg-green-100 rounded-xl mr-4">
                    <DollarSign className="w-7 h-7 text-green-600" />
                  </div>
                  Revenue Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-600 text-lg leading-relaxed">
                  Track earnings, transactions, and premium subscription
                  analytics with detailed reporting tools.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ₫{stats.totalRevenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      ₫
                      {(
                        stats.totalRevenue / Math.max(stats.premiumUsers, 1)
                      ).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      Avg per Premium User
                    </div>
                  </div>
                </div>
                <Link href="/dashboard/revenue">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <DollarSign className="w-5 h-5 mr-3" />
                    Go to Revenue Management
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center text-2xl font-bold text-gray-800">
                  <div className="p-3 bg-purple-100 rounded-xl mr-4">
                    <FileText className="w-7 h-7 text-purple-600" />
                  </div>
                  Post Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-600 text-lg leading-relaxed">
                  Moderate user-generated content, manage posts, and ensure
                  community guidelines compliance.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {stats.totalPosts.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      Total Posts Created
                    </div>
                  </div>
                </div>
                <Link href="/dashboard/posts">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
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
