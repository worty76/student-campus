"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { BASEURL } from "@/app/constants/url";
import {
  Users,
  DollarSign,
  FileText,
  TrendingUp,
  Shield,
  Activity,
  CreditCard,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DashboardStats {
  totalUsers: number;
  premiumUsers: number;
  totalRevenue: number;
  totalPosts: number;
  premiumConversionRate: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
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
      const response = await fetch(`${BASEURL}/api/premium/admin/revenue`);
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
  }

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
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-[#0694FA] border-[#0694FA]/30 hover:bg-[#0694FA]/5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay Lại</span>
              </Button>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-[#0694FA]">
                  Bảng Điều Khiển Quản Trị
                </h1>
                <p className="text-lg text-[#1E293B]/70 font-medium">
                  Quản lý nền tảng và theo dõi hiệu suất
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge
                variant="secondary"
                className="bg-[#F5F5FF] text-[#0694FA] border-[#0694FA]/30 px-4 py-2 text-sm font-semibold"
              >
                <Shield className="w-4 h-4 mr-2" />
                Quyền Quản Trị
              </Badge>
              {user && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>
                    Chào mừng, <strong>{user.username}</strong>
                  </span>
                </div>
              )}
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
                Tổng Người Dùng
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
                Người dùng hoạt động
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border border-[#1E293B]/10 bg-white/70 backdrop-blur-sm hover:bg-white/90 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-[#1E293B]/70 uppercase tracking-wide">
                Người Dùng Premium
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
                Tỷ lệ chuyển đổi {stats.premiumConversionRate}%
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border border-[#1E293B]/10 bg-white/70 backdrop-blur-sm hover:bg-white/90 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-[#1E293B]/70 uppercase tracking-wide">
                Tổng Doanh Thu
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
                Từ gói Premium
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border border-[#1E293B]/10 bg-white/70 backdrop-blur-sm hover:bg-white/90 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-[#1E293B]/70 uppercase tracking-wide">
                Tổng Bài Viết
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
                Nội dung người dùng tạo
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
                Tổng Quan
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="rounded-xl font-semibold text-sm data-[state=active]:bg-[#0694FA] data-[state=active]:text-white transition-all duration-300"
              >
                Người Dùng
              </TabsTrigger>
              <TabsTrigger
                value="revenue"
                className="rounded-xl font-semibold text-sm data-[state=active]:bg-[#0694FA] data-[state=active]:text-white transition-all duration-300"
              >
                Doanh Thu
              </TabsTrigger>
              <TabsTrigger
                value="posts"
                className="rounded-xl font-semibold text-sm data-[state=active]:bg-[#0694FA] data-[state=active]:text-white transition-all duration-300"
              >
                Bài Viết
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
                    Phân Tích Nền Tảng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-[#F5F5FF] rounded-xl">
                      <div>
                        <span className="text-sm font-semibold text-[#1E293B]/70 uppercase tracking-wide">
                          Tỷ Lệ Chuyển Đổi Premium
                        </span>
                        <p className="text-xs text-[#1E293B]/60">
                          Tỷ lệ nâng cấp người dùng
                        </p>
                      </div>
                      <span className="text-2xl font-bold text-[#0694FA]">
                        {stats.premiumConversionRate}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-[#F5F5FF] rounded-xl">
                      <div>
                        <span className="text-sm font-semibold text-[#1E293B]/70 uppercase tracking-wide">
                          Doanh Thu TB/Người Dùng
                        </span>
                        <p className="text-xs text-[#1E293B]/60">
                          Người đăng ký Premium
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
                          Người Dùng Premium Hoạt Động
                        </span>
                        <p className="text-xs text-[#1E293B]/60">
                          Hiện đang đăng ký
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
                    Thao Tác Nhanh
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 pt-2">
                    <Link href="/dashboard/users" className="block">
                      <Button className="w-full justify-between p-3 h-auto bg-[#0694FA] hover:bg-[#1E293B] text-white border-0 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          <div className="text-left">
                            <div className="font-medium text-sm">
                              Quản Lý Người Dùng
                            </div>
                            <div className="text-xs opacity-80">
                              Xem và chỉnh sửa hồ sơ người dùng
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
                            <div className="font-medium text-sm">
                              Xem Doanh Thu
                            </div>
                            <div className="text-xs opacity-80">
                              Theo dõi thu nhập và giao dịch
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
                            <div className="font-medium text-sm">
                              Kiểm Duyệt Bài Viết
                            </div>
                            <div className="text-xs opacity-80">
                              Xem xét nội dung người dùng
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
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
                  Quản Lý Người Dùng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-[#1E293B]/70 text-lg leading-relaxed">
                  Quản lý người dùng nền tảng, vai trò, và gói Premium với các
                  công cụ và phân tích toàn diện.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-[#F5F5FF] rounded-2xl">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#0694FA]">
                      {stats.totalUsers}
                    </div>
                    <div className="text-sm text-[#1E293B]/60">
                      Tổng Người Dùng
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#0694FA]">
                      {stats.premiumUsers}
                    </div>
                    <div className="text-sm text-[#1E293B]/60">
                      Người Dùng Premium
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#0694FA]">
                      {stats.premiumConversionRate}%
                    </div>
                    <div className="text-sm text-[#1E293B]/60">
                      Tỷ Lệ Chuyển Đổi
                    </div>
                  </div>
                </div>
                <Link href="/dashboard/users">
                  <Button className="w-full sm:w-auto bg-[#0694FA] hover:bg-[#1E293B] text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <Users className="w-5 h-5 mr-3" />
                    Đi Tới Quản Lý Người Dùng
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
                  Quản Lý Doanh Thu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-[#1E293B]/70 text-lg leading-relaxed">
                  Theo dõi thu nhập, giao dịch và phân tích đăng ký Premium với
                  các công cụ báo cáo chi tiết.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-[#F5F5FF] rounded-2xl">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#0694FA]">
                      ₫{stats.totalRevenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-[#1E293B]/60">
                      Tổng Doanh Thu
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#0694FA]">
                      ₫
                      {(
                        stats.totalRevenue / Math.max(stats.premiumUsers, 1)
                      ).toLocaleString()}
                    </div>
                    <div className="text-sm text-[#1E293B]/60">
                      TB/Người Dùng Premium
                    </div>
                  </div>
                </div>
                <Link href="/dashboard/revenue">
                  <Button className="w-full sm:w-auto bg-[#0694FA] hover:bg-[#1E293B] text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <DollarSign className="w-5 h-5 mr-3" />
                    Đi Tới Quản Lý Doanh Thu
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
                  Quản Lý Bài Viết
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-[#1E293B]/70 text-lg leading-relaxed">
                  Kiểm duyệt nội dung người dùng tạo, quản lý bài viết, và đảm
                  bảo tuân thủ quy tắc cộng đồng.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 p-6 bg-[#F5F5FF] rounded-2xl">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#0694FA]">
                      {stats.totalPosts.toLocaleString()}
                    </div>
                    <div className="text-sm text-[#1E293B]/60">
                      Tổng Bài Viết Đã Tạo
                    </div>
                  </div>
                </div>
                <Link href="/dashboard/posts">
                  <Button className="w-full sm:w-auto bg-[#0694FA] hover:bg-[#1E293B] text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <FileText className="w-5 h-5 mr-3" />
                    Đi Tới Quản Lý Bài Viết
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
