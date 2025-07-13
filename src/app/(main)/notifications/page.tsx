'use client'
import React, { useState, useEffect, useCallback } from "react";
import { Bell, Users, Heart, MessageCircle, UserPlus } from "lucide-react";
import NavigationBar from "@/app/(main)/layouts/navbar";
import Image from "next/image";
import axios from "axios";
import { BASEURL } from "@/app/constants/url";
import { useWebSocket } from "@/app/context/websocket.contex";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useRouter } from "next/navigation";

interface NotificationAPI {
  _id: string;
  senderId: {
    _id: string;
    username: string;
    avatar_link?: string;
  };
  receiverId: string;
  post?: string;
  createAt: string;
  status: "read" | "unread";
  type: string;
  context?: string;
}

interface WebSocketMessage {
  type: 'init' |'file_to' |'friend_request' | 'message' | 'accept_request' |'deny_request'| 'likes_post'| 'unlike_post' | 'Comment'|'online_friend' | 'text_to'| 'create_group' | 'leave_group'| 'add_to_group';
  from?: string;
  to?: string;
  message?: string;
  fromName?: string;
  reqid?: string;
  postid?: string;
  context?: string;
  friends?: OnlineFriend[];
  chatid?: string;
  file?: FileData[];
  userIds?: Friends[];
  groupName?: string;
  isGroupChat?: boolean;
}

interface FileData {
  name: string;
  type: string;
  size: number;
  url: string;
}

interface OnlineFriend {
  _id: string;
  username: string;
  avatar_link: string;
  online?: boolean;
}

interface Friends {
  _id: string;
  username: string;
  avatar_link?: string;
}

// Enhanced icon mapping with more notification types
const getIconByType = (type: string) => {
  switch (type) {
    case "likes_post":
      return <Heart className="text-pink-500" size={20} />;
    case "friend_request":
      return <UserPlus className="text-blue-500" size={20} />;
    case "accept_request":
      return <Users className="text-green-500" size={20} />;
    case "Comment":
      return <MessageCircle className="text-purple-500" size={20} />;
    case "mention":
      return <Bell className="text-orange-500" size={20} />;
    default:
      return <Bell className="text-blue-500" size={20} />;
  }
};

// Enhanced time formatting with more precise relative times
function formatTime(isoString: string) {
  const date = new Date(isoString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diff < 60) return `${diff} giây trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)} tuần trước`;
  return `${Math.floor(diff / 2592000)} tháng trước`;
}


const NotificationItem = React.memo(({ 
  notification, 
  markAsRead 
}: { 
  notification: NotificationAPI; 
  markAsRead: (id: string) => void;
}) => {
  const router = useRouter();

  const handleClick = useCallback(() => {
    if (notification.status === "unread") {
      markAsRead(notification._id);
    }
    if (notification.post) {
      router.push(`/post/${notification.post}`);
    }
  }, [notification._id, notification.status, notification.post, markAsRead, router]);

  return (
    <div
      className={`flex items-start gap-4 py-4 px-6 border-b border-gray-100 last:border-b-0 relative group cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
        notification.status === "unread" 
          ? "bg-[#F5F9FF] hover:bg-[#F5F9FF]/80 border-l-4 border-l-[#0694FA]" 
          : "hover:bg-gray-50"
      }`}
      onClick={handleClick}
      title={notification.status === "unread" ? "Đánh dấu đã đọc" : ""}
    >
      <div className="relative group-hover:scale-105 transition-transform duration-300">
        <div className="relative">
          <Image
            src={notification.senderId.avatar_link || "/schoolimg.jpg"}
            alt={notification.senderId.username}
            width={56}
            height={56}
            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-lg"
          />
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg">
            {getIconByType(notification.type)}
          </div>
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="mb-2">
              <span className="font-semibold text-[#1E293B] text-sm">
                {notification.senderId.username}
              </span>
              <p className="text-[#1E293B] text-sm leading-5 mt-1">
                {notification.context}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="bg-gray-100 px-2 py-1 rounded-full">
                {formatTime(notification.createAt)}
              </span>
              {notification.post && (
                <span className="text-[#0694FA] font-medium">• Xem bài viết</span>
              )}
            </div>
          </div>
          
          {notification.status === "unread" && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#0694FA] rounded-full animate-pulse shadow-lg"></span>
              <span className="text-xs font-semibold text-[#0694FA] bg-[#F5F9FF] px-2 py-1 rounded-full">
                Mới
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

NotificationItem.displayName = 'NotificationItem';

const PAGE_SIZE = 5;

const NotificationList = ({
  notifications,
  tab,
  markAsRead,
  loading,
  page,
  
}: {
  notifications: NotificationAPI[];
  tab: "all" | "unread";
  markAsRead: (notificationId: string) => void;
  loading: boolean;
  page: number;
  setPage: (page: number) => void;
}) => {
  const filteredNotifications = notifications.filter((n) =>
    tab === "all" || n.status === "unread"
  );

 
  const paginatedNotifications = filteredNotifications.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  if (loading && notifications.length === 0) {
    return (
      <div className="px-6 py-8">
        <div className="animate-pulse space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-3">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded-lg w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded-lg w-1/2"></div>
                </div>
                <div className="h-2 bg-gray-200 rounded-lg w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Nếu không có thông báo nào (kể cả khi tab là "unread" hay "all"), luôn hiện "Chưa có thông báo nào"
  if (notifications.length === 0) {
    return (
      <div className="text-center py-16 px-6">
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-[#F5F9FF] rounded-full flex items-center justify-center mb-4">
            <Bell className="text-[#0694FA]" size={48} />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-[#1E293B] mb-2">
          Chưa có thông báo nào
        </h3>
        <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
          Khi có hoạt động mới, thông báo sẽ xuất hiện ở đây.
        </p>
      </div>
    );
  }

  return (
    <div className="text-[#1E293B]">
      <div className="sticky top-0 bg-[#F5F9FF] text-[#1E293B] text-sm font-medium px-6 py-3 border-b border-gray-100 z-10">
        <div className="flex items-center justify-between">
          <span>
            {tab === "unread" ? "Thông báo chưa đọc" : "Tất cả thông báo"}
          </span>
          <span className="bg-white px-3 py-1 rounded-full text-xs font-semibold">
            {filteredNotifications.length} thông báo
          </span>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {paginatedNotifications.map((notification, index) => (
          <div
            key={notification._id}
            className="transform transition-all duration-300"
            style={{
              animationDelay: `${index * 100}ms`,
              animation: 'slideInUp 0.5s ease-out forwards'
            }}
          >
            <NotificationItem
              notification={notification}
              markAsRead={markAsRead}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const Notifications = () => {
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<NotificationAPI[]>([]);
  const [skip, setSkip] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const LIMIT = 10; // Increased limit for better UX

  const { addMessageHandler } = useWebSocket();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState<null | "success" | "error">(null);

  const getUserNotifications = useCallback(async (reset = false) => {
    if (loading) return; // Prevent multiple simultaneous requests

    setLoading(true);
    setError(null);

    try {
      const id = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (!id || !token) {
        throw new Error("Authentication required");
      }

      const response = await axios.get(
        `${BASEURL}/api/get/noti/${id}?skip=${reset ? 0 : skip}&limit=${LIMIT}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          validateStatus: (status) => status === 200 || status === 404,
        }
      );

      if (response.status === 404) {
        setNotifications([]);
        setSkip(0);
        setError(null);
        return;
      }

      const data = response.data;
      // Nếu data không phải là mảng, coi như không có thông báo nào
      if (!Array.isArray(data)) {
        setNotifications([]);
        setSkip(0);
        setError(null);
        return;
      }
      if (reset) {
        setNotifications(data);
        setSkip(LIMIT);
      } else {
        setNotifications((prev) => [...prev, ...data]);
        setSkip((prev) => prev + LIMIT);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // Không setError nếu là lỗi 404
    } finally {
      setLoading(false);
    }
  }, [skip, loading, LIMIT]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.put(`${BASEURL}/api/mark-as-read/${notificationId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, status: "read" as const } : n
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, []);

  const deleteAllReadNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      if (!token || !userId) return;

      await axios.delete(`${BASEURL}/api/delte-read/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications((prev) => prev.filter((n) => n.status !== "read"));
    } catch (error) {
      console.error("Error deleting read notifications:", error);
      setError("Không thể xóa thông báo đã đọc. Vui lòng thử lại.");
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const unreadNotifications = notifications.filter(n => n.status === "unread");
      if (unreadNotifications.length === 0) return;

      await Promise.all(
        unreadNotifications.map(notification =>
          axios.put(`${BASEURL}/api/mark-as-read/${notification._id}`, {}, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, status: "read" as const }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }, [notifications]);

    useEffect(() => {
     const token = localStorage.getItem("token");
     if (!token) {
       window.location.href = "/login";
     }
    }, []);

    const handleTabChange = useCallback((newTab: "all" | "unread") => {
        setTab(newTab);
        setSkip(0);

        setNotifications([]);
    }, []);


  useEffect(() => {
    const handler = (message: WebSocketMessage) => {
      if (
        message?.type === "likes_post" ||
        message?.type === "friend_request" ||
        message?.type === "accept_request" ||
        message?.type === "Comment"
      ) {
        getUserNotifications(true);
      }
    };

    const removeHandler = addMessageHandler(handler);
    return removeHandler;
  }, [addMessageHandler, getUserNotifications]);

  // Initial load
  useEffect(() => {
    getUserNotifications(true);
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const unreadCount = notifications.filter(n => n.status === "unread").length;

  // Reset page when tab changes or notifications change
  useEffect(() => {
    setPage(1);
  }, [tab, notifications.length]);

  // Tính toán totalPages ở đây để truyền cho paginate bar
  const filteredNotifications = notifications.filter((n) =>
    tab === "all" || n.status === "unread"
  );
  const totalPages = Math.ceil(filteredNotifications.length / PAGE_SIZE);

  const handleDeleteAllRead = useCallback(() => {
    setShowConfirmDialog(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    setShowConfirmDialog(false);
    try {
      await deleteAllReadNotifications();
      setShowResultDialog("success");
    } catch (e) {
      setShowResultDialog("error");
    }
  }, [deleteAllReadNotifications]);

  return (
    <div className="min-h-screen bg-[#F1F1E6]">
      <NavigationBar />
      
      <div className="max-w-4xl mx-auto px-4 py-8 pt-[8vh]">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-[#0694FA] rounded-2xl shadow-lg">
              <Bell className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#1E293B] mb-2">
            Thông Báo
          </h1>
          <p className="text-[#1E293B] text-lg">Cập nhật các hoạt động và tương tác mới nhất</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow border border-[#F5F9FF]">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#F5F9FF] rounded-lg">
                <Bell className="w-6 h-6 text-[#0694FA]" />
              </div>
              <div>
                <p className="text-sm text-[#1E293B]">Tổng thông báo</p>
                <p className="text-2xl font-bold text-[#1E293B]">{notifications.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow border border-[#F5F9FF]">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#F5F9FF] rounded-lg">
                <Bell className="w-6 h-6 text-[#0694FA]" />
              </div>
              <div>
                <p className="text-sm text-[#1E293B]">Chưa đọc</p>
                <p className="text-2xl font-bold text-[#1E293B]">{unreadCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow border border-[#F5F9FF]">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#F5F9FF] rounded-lg">
                <Bell className="w-6 h-6 text-[#0694FA]" />
              </div>
              <div>
                <p className="text-sm text-[#1E293B]">Đã đọc</p>
                <p className="text-2xl font-bold text-[#1E293B]">{notifications.length - unreadCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Notification Panel */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#F5F9FF]">
          {/* Header with Actions */}
          <div className="bg-[#F5F9FF] px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-2">
                  <button
                    className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                      tab === "all"
                        ? "bg-[#0694FA] text-white shadow transform scale-105"
                        : "bg-white text-[#1E293B] hover:bg-white/90 border border-gray-200"
                    }`}
                    onClick={() => handleTabChange("all")}
                  >
                    <span className="flex items-center gap-2">
                      Tất cả
                      <span className="bg-[#F5F9FF] text-[#1E293B] text-xs px-2 py-1 rounded-full">
                        {notifications.length}
                      </span>
                    </span>
                  </button>
                  <button
                    className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 relative ${
                      tab === "unread"
                        ? "bg-[#1E293B] text-white shadow transform scale-105"
                        : "bg-white text-[#1E293B] hover:bg-white/90 border border-gray-200"
                    }`}
                    onClick={() => handleTabChange("unread")}
                  >
                    <span className="flex items-center gap-2">
                      Chưa đọc
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        tab === "unread" ? "bg-[#F5F9FF] text-[#1E293B]" : "bg-[#F5F9FF] text-[#1E293B]"
                      }`}>
                        {unreadCount}
                      </span>
                    </span>
                  </button>
                </div>
              </div>
              
              <div className="flex gap-2">
                {tab === "all" && (
                  <button
                    className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-[#1E293B] text-white hover:bg-[#F5F9FF] hover:text-[#1E293B] border border-[#1E293B] transition-all duration-300 shadow hover:shadow-lg transform hover:scale-105"
                    onClick={handleDeleteAllRead}
                  >
                    <span className="flex items-center gap-2">
                      Xóa các tin đã đọc
                    </span>
                  </button>
                )}
                {unreadCount > 0 && (
                  <button
                    className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-[#0694FA] text-white hover:bg-[#1E293B] transition-all duration-300 shadow hover:shadow-lg transform hover:scale-105"
                    onClick={markAllAsRead}
                  >
                    <span className="flex items-center gap-2">
                      <Bell size={16} />
                      Đánh dấu tất cả đã đọc
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-[#F5F9FF] border-l-4 border-[#0694FA] px-6 py-4">
              <div className="flex items-center">
                <div className="p-1 bg-[#F5F9FF] rounded-full mr-3">
                  <Bell className="w-4 h-4 text-[#0694FA]" />
                </div>
                <p className="text-[#1E293B] font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-[60vh] overflow-y-auto">
            <NotificationList
              notifications={notifications}
              tab={tab}
              markAsRead={markAsRead}
              loading={loading}
              page={page}
              setPage={setPage}
            />
          </div>

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="border-t border-gray-100 py-4 flex justify-center bg-[#F5F9FF]">
              <div className="bg-white rounded-xl shadow p-2 border border-[#F5F9FF]">
                <Pagination>
                  <PaginationContent className="gap-1">
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage(page > 1 ? page - 1 : 1)}
                        className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                          page === 1 
                            ? "text-gray-400 cursor-not-allowed" 
                            : "text-[#0694FA] hover:bg-[#F5F9FF] hover:text-[#1E293B]"
                        }`}
                      />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, idx) => (
                      <PaginationItem key={idx}>
                        <PaginationLink
                          isActive={page === idx + 1}
                          onClick={() => setPage(idx + 1)}
                          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                            page === idx + 1
                              ? "bg-[#0694FA] text-white shadow"
                              : "text-[#1E293B] hover:bg-[#F5F9FF] hover:text-[#0694FA]"
                          }`}
                        >
                          {idx + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
                        className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                          page === totalPages 
                            ? "text-gray-400 cursor-not-allowed" 
                            : "text-[#0694FA] hover:bg-[#F5F9FF] hover:text-[#1E293B]"
                        }`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Confirm Delete Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-xs w-full border border-[#F5F9FF]">
            <div className="mb-4 text-center">
              <div className="flex justify-center mb-2">
                <Bell className="text-[#0694FA]" size={32} />
              </div>
              <h2 className="text-lg font-bold text-[#1E293B] mb-2">Xác nhận xóa</h2>
              <p className="text-[#1E293B] text-sm">Bạn có chắc chắn muốn xóa tất cả thông báo đã đọc?</p>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                className="flex-1 px-4 py-2 rounded-lg bg-[#F5F9FF] text-[#1E293B] font-semibold hover:bg-[#0694FA] hover:text-white transition"
                onClick={() => setShowConfirmDialog(false)}
              >
                Hủy
              </button>
              <button
                className="flex-1 px-4 py-2 rounded-lg bg-[#1E293B] text-white font-semibold hover:bg-[#0694FA] transition"
                onClick={handleConfirmDelete}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Dialog */}
      {showResultDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-xs w-full border border-[#F5F9FF] text-center">
            <div className="flex justify-center mb-2">
              <Bell className={showResultDialog === "success" ? "text-[#0694FA]" : "text-red-500"} size={32} />
            </div>
            <h2 className="text-lg font-bold text-[#1E293B] mb-2">
              {showResultDialog === "success" ? "Xóa thành công" : "Xóa không thành công"}
            </h2>
            <p className="text-[#1E293B] text-sm mb-4">
              {showResultDialog === "success"
                ? "Tất cả thông báo đã đọc đã được xóa."
                : "Đã xảy ra lỗi khi xóa thông báo. Vui lòng thử lại."}
            </p>
            <button
              className="px-4 py-2 rounded-lg bg-[#0694FA] text-white font-semibold hover:bg-[#1E293B] transition"
              onClick={() => setShowResultDialog(null)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Notifications;