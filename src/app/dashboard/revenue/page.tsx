"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VNPayTextIcon, VNPayInlineIcon } from "@/components/ui/vnpay-icon";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { usePagination } from "@/hooks/usePagination";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  Download,
  BarChart3,
  ArrowLeft,
  AreaChart as AreaChartIcon,
} from "lucide-react";
import { BASEURL } from "@/app/constants/url";
import { useRouter } from "next/navigation";
interface RevenueStats {
  totalRevenue: number;
  totalTransactions: number;
  averageTransaction: number;
  revenueByMethod: Record<string, number>;
  premiumUsers: number;
  totalUsers: number;
  premiumConversionRate: string;
}

interface Transaction {
  _id: string;
  userId: {
    _id: string;
    username: string;
    email: string;
  };
  amount: number;
  currency: string;
  transactionType: string;
  status: string;
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
  completedAt: string;
}

interface MonthlyRevenue {
  month: string;
  year: number;
  revenue: number;
  transactions: number;
  averageTransaction: number;
}

export default function RevenueManagement() {
  const router = useRouter();
  const [stats, setStats] = useState<RevenueStats>({
    totalRevenue: 0,
    totalTransactions: 0,
    averageTransaction: 0,
    revenueByMethod: {},
    premiumUsers: 0,
    totalUsers: 0,
    premiumConversionRate: "0",
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [revenueChartType, setRevenueChartType] = useState<"area" | "bar">(
    "area"
  );

  const handleToggleAllTransactions = () => {
    setShowAllTransactions(!showAllTransactions);
    setCurrentPage(1); // Reset to first page when toggling
  };

  // Pagination for transactions
  const {
    currentPage,
    totalPages,
    currentData: paginatedTransactions,
    totalItems,
    itemsPerPage,
    setCurrentPage,
  } = usePagination({
    data: transactions,
    itemsPerPage: 10,
  });

  const fetchRevenueData = useCallback(async () => {
    try {
      const response = await fetch(
        `${BASEURL}/api/premium/admin/revenue?period=${selectedPeriod}`
      );
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching revenue data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriod]);

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch(`${BASEURL}/api/premium/admin/transactions`);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }, []);

  useEffect(() => {
    fetchRevenueData();
    fetchTransactions();
  }, [fetchRevenueData, fetchTransactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Process monthly revenue data from transactions
  const processMonthlyRevenue = useCallback(() => {
    const currentYear = new Date().getFullYear();
    const monthNames = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ];

    // Initialize all 12 months with zero values
    const monthlyData: MonthlyRevenue[] = [];
    for (let month = 0; month < 12; month++) {
      monthlyData.push({
        month: monthNames[month],
        year: currentYear,
        revenue: 0,
        transactions: 0,
        averageTransaction: 0,
      });
    }

    // Fill in actual data from transactions
    transactions.forEach((transaction) => {
      if (transaction.status === "completed") {
        const date = new Date(transaction.createdAt);
        const transactionYear = date.getFullYear();
        const transactionMonth = date.getMonth();

        // Only include transactions from current year
        if (transactionYear === currentYear) {
          monthlyData[transactionMonth].revenue += transaction.amount;
          monthlyData[transactionMonth].transactions += 1;
        }
      }
    });

    // Calculate average transaction for each month
    monthlyData.forEach((data) => {
      data.averageTransaction =
        data.transactions > 0 ? data.revenue / data.transactions : 0;
    });

    setMonthlyRevenue(monthlyData);
  }, [transactions]);

  useEffect(() => {
    if (transactions.length > 0) {
      processMonthlyRevenue();
    }
  }, [transactions, processMonthlyRevenue]);

  const exportToCSV = async () => {
    try {
      const response = await fetch(
        `${BASEURL}/api/premium/admin/export-revenue?period=${selectedPeriod}`
      );
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `revenue-report-${selectedPeriod}-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting revenue data:", error);
      alert("Không thể xuất dữ liệu doanh thu");
    }
  };

  const getPaymentMethodIcon = (method: string, isLarge = false) => {
    switch (method) {
      case "momo":
        return "💜";
      case "zalo_pay":
        return "💙";
      case "vnpay":
      case "VNPay":
        return isLarge ? <VNPayTextIcon /> : <VNPayInlineIcon />;
      case "bank_transfer":
        return "🏦";
      case "credit_card":
        return "💳";
      default:
        return "💰";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Chart data preparation
  const conversionData = [
    { name: "Người Dùng Premium", value: stats.premiumUsers, fill: "#3B82F6" },
    {
      name: "Người Dùng Thường",
      value: stats.totalUsers - stats.premiumUsers,
      fill: "#E5E7EB",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu doanh thu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay Lại</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Quản Lý Doanh Thu
                </h1>
                <p className="text-gray-600">
                  Theo dõi thu nhập và đăng ký Premium
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="week">Tuần Này</option>
                <option value="month">Tháng Này</option>
                <option value="year">Năm Này</option>
              </select>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={exportToCSV}
              >
                <Download className="w-4 h-4 mr-2" />
                Xuất Báo Cáo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng Doanh Thu
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Từ đăng ký Premium
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng Giao Dịch
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalTransactions}
              </div>
              <p className="text-xs text-muted-foreground">
                Thanh toán thành công
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Giao Dịch Trung Bình
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.averageTransaction)}
              </div>
              <p className="text-xs text-muted-foreground">
                Mỗi gói đăng ký Premium
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Người Dùng Premium
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.premiumUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.premiumConversionRate}% tỷ lệ chuyển đổi
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
          {/* User Conversion Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Tỷ Lệ Chuyển Đổi Premium
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={conversionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {conversionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.premiumConversionRate}%
                </div>
                <p className="text-sm text-gray-600">
                  Tỷ lệ chuyển đổi Premium
                </p>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                    <span>Premium: {stats.premiumUsers}</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-gray-300 mr-2" />
                    <span>Thường: {stats.totalUsers - stats.premiumUsers}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Revenue Charts */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Doanh Thu Và Giao Dịch Theo Tháng
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyRevenue.length > 0 ? (
                <div className="space-y-8">
                  {/* Revenue Chart with Toggle - 12 months */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-700">
                        Doanh Thu 12 Tháng
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant={
                            revenueChartType === "area" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setRevenueChartType("area")}
                          className="flex items-center gap-2"
                        >
                          <AreaChartIcon className="h-4 w-4" />
                          Biểu đồ Vùng
                        </Button>
                        <Button
                          variant={
                            revenueChartType === "bar" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setRevenueChartType("bar")}
                          className="flex items-center gap-2"
                        >
                          <BarChart3 className="h-4 w-4" />
                          Biểu đồ Cột
                        </Button>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                      {revenueChartType === "area" ? (
                        <AreaChart data={monthlyRevenue}>
                          <defs>
                            <linearGradient
                              id="revenueGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#3B82F6"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="#3B82F6"
                                stopOpacity={0.1}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f0f0f0"
                          />
                          <XAxis
                            dataKey="month"
                            tick={{ fontSize: 12 }}
                            tickLine={{ stroke: "#ccc" }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis
                            tickFormatter={(value) =>
                              `₫${(value / 1000000).toFixed(1)}M`
                            }
                            tick={{ fontSize: 12 }}
                            tickLine={{ stroke: "#ccc" }}
                          />
                          <Tooltip
                            formatter={(value) => [
                              formatCurrency(Number(value)),
                              "Doanh Thu",
                            ]}
                            labelStyle={{ color: "#374151" }}
                            contentStyle={{
                              backgroundColor: "#f9fafb",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#3B82F6"
                            strokeWidth={3}
                            fill="url(#revenueGradient)"
                            dot={{ fill: "#3B82F6", strokeWidth: 2, r: 5 }}
                            activeDot={{
                              r: 8,
                              stroke: "#3B82F6",
                              strokeWidth: 2,
                            }}
                          />
                        </AreaChart>
                      ) : (
                        <BarChart data={monthlyRevenue}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f0f0f0"
                          />
                          <XAxis
                            dataKey="month"
                            tick={{ fontSize: 12 }}
                            tickLine={{ stroke: "#ccc" }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis
                            tickFormatter={(value) =>
                              `₫${(value / 1000000).toFixed(1)}M`
                            }
                            tick={{ fontSize: 12 }}
                            tickLine={{ stroke: "#ccc" }}
                          />
                          <Tooltip
                            formatter={(value) => [
                              formatCurrency(Number(value)),
                              "Doanh Thu",
                            ]}
                            labelStyle={{ color: "#374151" }}
                            contentStyle={{
                              backgroundColor: "#f9fafb",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar
                            dataKey="revenue"
                            fill="#10B981"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>

                  {/* Transactions Line Chart - 12 months */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">
                      Số Lượng Giao Dịch 12 Tháng
                    </h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={monthlyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 12 }}
                          tickLine={{ stroke: "#ccc" }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickLine={{ stroke: "#ccc" }}
                        />
                        <Tooltip
                          formatter={(value) => [value, "Giao Dịch"]}
                          labelStyle={{ color: "#374151" }}
                          contentStyle={{
                            backgroundColor: "#f9fafb",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="transactions"
                          stroke="#F59E0B"
                          strokeWidth={3}
                          dot={{ fill: "#F59E0B", strokeWidth: 2, r: 5 }}
                          activeDot={{
                            r: 8,
                            stroke: "#F59E0B",
                            strokeWidth: 2,
                          }}
                          connectNulls={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    Chưa có dữ liệu doanh thu theo tháng
                  </p>
                </div>
              )}

              {/* Monthly Revenue Summary */}
              {monthlyRevenue.length > 0 && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-sm text-gray-600 font-medium">
                      Tháng Trong Năm
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(
                        monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0)
                      )}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      Tổng Doanh Thu Năm
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {monthlyRevenue.reduce(
                        (sum, m) => sum + m.transactions,
                        0
                      )}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      Tổng Giao Dịch Năm
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {(() => {
                        const monthsWithRevenue = monthlyRevenue.filter(
                          (m) => m.revenue > 0
                        );
                        return monthsWithRevenue.length > 0
                          ? formatCurrency(
                              monthsWithRevenue.reduce(
                                (sum, m) => sum + m.averageTransaction,
                                0
                              ) / monthsWithRevenue.length
                            )
                          : formatCurrency(0);
                      })()}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      TB/Tháng Có Doanh Thu
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Giao Dịch</span>
              <div className="flex items-center space-x-2">
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  {totalItems} Tổng Cộng
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleAllTransactions}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {showAllTransactions ? "Chỉ Hiện Gần Đây" : "Hiện Tất Cả"}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">
                      Người Dùng
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Số Tiền
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Phương Thức Thanh Toán
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Trạng Thái
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">Ngày</th>
                  </tr>
                </thead>
                <tbody>
                  {(showAllTransactions
                    ? paginatedTransactions
                    : transactions.slice(0, 10)
                  ).map((transaction) => (
                    <tr
                      key={transaction._id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">
                            {transaction.userId.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.userId.email}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold">
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="mr-2">
                            {getPaymentMethodIcon(
                              transaction.paymentMethod,
                              false
                            )}
                          </span>
                          <span className="capitalize">
                            {transaction.paymentMethod.replace("_", " ")}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination - only show when showing all transactions */}
            {showAllTransactions && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                showInfo={true}
              />
            )}

            {/* Show summary when not showing all transactions */}
            {!showAllTransactions && transactions.length > 10 && (
              <div className="mt-4 text-center text-sm text-gray-600">
                Showing recent 10 transactions. Click &quot;Show All&quot; to
                view all {transactions.length} transactions.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
