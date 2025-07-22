"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { usePagination } from "@/hooks/usePagination";
import { BASEURL } from "@/app/constants/url";
import { Users, Shield, Crown, Search, Edit, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  username: string;
  email: string;
  Faculty: string;
  Major: string;
  Year: string;
  role: string;
  isPremium: boolean;
  premiumExpiry: string | null;
  createtime: string;
  avatar_link: string;
}

export default function UserManagement() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterPremium, setFilterPremium] = useState("all");

  // Dialog state for role confirmation
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [targetRole, setTargetRole] = useState<string>("");

  // Pagination for filtered users
  const {
    currentPage,
    totalPages,
    currentData: paginatedUsers,
    totalItems,
    itemsPerPage,
    setCurrentPage,
  } = usePagination({
    data: filteredUsers,
    itemsPerPage: 12, // Show 12 users per page (3 rows of 4 columns)
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${BASEURL}/api/premium/admin/users`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = useCallback(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.Faculty.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.Major.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (filterRole !== "all") {
      filtered = filtered.filter((user) => user.role === filterRole);
    }

    // Premium filter
    if (filterPremium !== "all") {
      filtered = filtered.filter((user) =>
        filterPremium === "premium" ? user.isPremium : !user.isPremium
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterRole, filterPremium]);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  // Function to open role change confirmation dialog
  const handleRoleChangeRequest = (user: User, newRole: string) => {
    setSelectedUser(user);
    setTargetRole(newRole);
    setShowRoleDialog(true);
  };

  // Function to confirm role change
  const confirmRoleChange = async () => {
    if (!selectedUser || !targetRole) return;

    try {
      const response = await fetch(
        `${BASEURL}/api/premium/admin/users/${selectedUser._id}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: targetRole }),
        }
      );

      const data = await response.json();

      if (data.success) {
        fetchUsers(); // Refresh the list
        setShowRoleDialog(false);
        setSelectedUser(null);
        setTargetRole("");
        // Success notification can be added here if needed
      } else {
        alert("Không thể cập nhật vai trò người dùng: " + data.message);
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Không thể cập nhật vai trò người dùng");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPremiumStatus = (user: User) => {
    if (!user.isPremium)
      return { text: "Miễn Phí", color: "bg-gray-100 text-gray-800" };

    if (user.premiumExpiry && new Date(user.premiumExpiry) < new Date()) {
      return { text: "Hết Hạn", color: "bg-red-100 text-red-800" };
    }

    return { text: "Premium", color: "bg-green-100 text-green-800" };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải người dùng...</p>
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
                  Quản Lý Người Dùng
                </h1>
                <p className="text-gray-600">
                  Quản lý người dùng nền tảng và vai trò của họ
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Users className="w-4 h-4 mr-2" />
                {totalItems} Người Dùng
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm người dùng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Role Filter */}
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất Cả Vai Trò</option>
                <option value="user">Người Dùng</option>
                <option value="admin">Quản Trị Viên</option>
              </select>

              {/* Premium Filter */}
              <select
                value={filterPremium}
                onChange={(e) => setFilterPremium(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất Cả Người Dùng</option>
                <option value="premium">Chỉ Premium</option>
                <option value="free">Chỉ Miễn Phí</option>
              </select>

              {/* Export Button */}
              <Button className="bg-blue-600 hover:bg-blue-700">
                Xuất Dữ Liệu
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({totalItems})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">User</th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Faculty
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">Role</th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Premium
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Joined
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => {
                    const premiumStatus = getPremiumStatus(user);
                    return (
                      <tr key={user._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                              {user.avatar_link ? (
                                <Image
                                  src={user.avatar_link}
                                  alt={user.username}
                                  width={40}
                                  height={40}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-gray-600 font-semibold">
                                  {user.username.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{user.username}</div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{user.Faculty}</div>
                            <div className="text-sm text-gray-500">
                              {user.Major} - {user.Year}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              user.role === "admin"
                                ? "destructive"
                                : "secondary"
                            }
                            className={
                              user.role === "admin"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {user.role === "admin" ? (
                              <Shield className="w-3 h-3 mr-1" />
                            ) : (
                              <Users className="w-3 h-3 mr-1" />
                            )}
                            {user.role === "admin"
                              ? "Quản Trị Viên"
                              : "Người Dùng"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={premiumStatus.color}>
                            {premiumStatus.text === "Premium" && (
                              <Crown className="w-3 h-3 mr-1" />
                            )}
                            {premiumStatus.text}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {formatDate(user.createtime)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleRoleChangeRequest(
                                  user,
                                  user.role === "admin" ? "user" : "admin"
                                )
                              }
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              {user.role === "admin"
                                ? "Xóa Quyền Admin"
                                : "Cấp Quyền Admin"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              showInfo={true}
            />
          </CardContent>
        </Card>
      </div>

      {/* Role Change Confirmation Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác Nhận Thay Đổi Quyền</DialogTitle>
            <DialogDescription>
              {selectedUser && targetRole && (
                <>
                  Bạn có chắc chắn muốn{" "}
                  {targetRole === "admin"
                    ? "cấp quyền Quản trị viên"
                    : "xóa quyền Quản trị viên"}{" "}
                  cho người dùng <strong>{selectedUser.username}</strong>?
                  <br />
                  <br />
                  {targetRole === "admin" ? (
                    <span className="text-orange-600">
                      ⚠️ Người dùng sẽ có quyền quản lý toàn bộ hệ thống sau khi
                      được cấp quyền.
                    </span>
                  ) : (
                    <span className="text-blue-600">
                      ℹ️ Người dùng sẽ chỉ còn quyền truy cập cơ bản sau khi bị
                      xóa quyền admin.
                    </span>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Hủy
            </Button>
            <Button
              onClick={confirmRoleChange}
              className={
                targetRole === "admin"
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }
            >
              {targetRole === "admin" ? "Cấp Quyền" : "Xóa Quyền"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
