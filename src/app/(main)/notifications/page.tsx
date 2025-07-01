'use client'
import React, { useState, useEffect, useCallback } from "react";
import { Bell, Users, Heart, MessageCircle, UserPlus } from "lucide-react";
import NavigationBar from "@/app/(main)/layouts/navbar";
import Image from "next/image";
import axios from "axios";
import { BASEURL } from "@/app/constants/url";
import { useWebSocket } from "@/app/constants/websocket.contex";
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
      className={`flex items-start gap-3 py-3 px-4 border-b border-blue-100 last:border-b-0 relative group cursor-pointer transition-colors duration-200 ${
        notification.status === "unread" ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-50"
      }`}
      onClick={handleClick}
      title={notification.status === "unread" ? "Đánh dấu đã đọc" : ""}
    >
      <div className="relative">
        <Image
          src={notification.senderId.avatar_link || "/schoolimg.jpg"}
          alt={notification.senderId.username}
          width={48}
          height={48}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
          {getIconByType(notification.type)}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-blue-900 text-sm leading-5">
              {/* <span className="font-semibold">{notification.senderId.username}</span>
              {<span className="text-blue-700">{notification.context}</span>} */}
              <span className="text-blue-700">
                {notification.context}
              </span>
            </p>
            <div className="text-xs text-blue-500 mt-1 flex items-center gap-2">
              {formatTime(notification.createAt)}
            </div>
          </div>
          
          {notification.status === "unread" && (
            <span className="w-3 h-3 bg-blue-600 rounded-full ml-2 mt-1 flex-shrink-0"></span>
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
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (filteredNotifications.length === 0) {
    return (
      <div className="text-center text-blue-400 py-12">
        <Bell className="mx-auto mb-4 text-blue-300" size={48} />
        <p className="text-lg">Không có thông báo</p>
        <p className="text-sm mt-1">
          {tab === "unread" ? "Tất cả thông báo đã được đọc" : "Chưa có thông báo nào"}
        </p>
      </div>
    );
  }

  return (
    <div className="text-blue-900">
      <div className="text-blue-500 text-sm mb-2 px-4 py-2 bg-blue-25 border-b border-blue-100">
        {tab === "unread" ? "Chưa đọc" : "Tất cả thông báo"}
      </div>
      {paginatedNotifications.map((notification) => (
        <NotificationItem
          key={notification._id}
          notification={notification}
          markAsRead={markAsRead}
        />
      ))}
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
        }
      );
      
      const data = response.data;
      console.log(data)
      if (reset) {
        setNotifications(data);
        setSkip(LIMIT);
      } else {
        setNotifications((prev) => [...prev, ...data]);
        setSkip((prev) => prev + LIMIT);
      }
      

    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Không thể tải thông báo. Vui lòng thử lại.");
  
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

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col"
      style={{
        width: "60vw",
        margin: "0 auto",
        marginTop: "10vh",
        minHeight: "60vh",
        maxHeight: "80vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <NavigationBar />
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-blue-100">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-blue-900">Thông báo</h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
        <Bell className="text-blue-500" size={28} />
      </div>

      {/* Tabs and Actions */}
      <div className="flex gap-2 px-6 py-3 items-center border-b border-blue-100 bg-blue-25">
        <button
          className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
            tab === "all"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-transparent text-blue-600 hover:bg-blue-100"
          }`}
          onClick={() => handleTabChange("all")}
        >
          Tất cả
        </button>
        <button
          className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors relative ${
            tab === "unread"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-transparent text-blue-600 hover:bg-blue-100"
          }`}
          onClick={() => handleTabChange("unread")}
        >
          Chưa đọc
          {unreadCount > 0 && tab !== "unread" && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          )}
        </button>
        
        {unreadCount > 0 && (
          <button
            className="ml-auto px-4 py-2 rounded-full font-semibold text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
            onClick={markAllAsRead}
          >
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-6 py-3 bg-red-50 border-b border-red-100">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        <NotificationList
          notifications={notifications}
          tab={tab}
          markAsRead={markAsRead}
          loading={loading}
          page={page}
          setPage={setPage}
        />
      </div>

      {/* Pagination Bar luôn ở đáy */}
      {totalPages > 1 && (
        <div className="border-t border-blue-100 py-3 flex justify-center bg-white">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage(page > 1 ? page - 1 : 1)}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, idx) => (
                <PaginationItem key={idx}>
                  <PaginationLink
                    isActive={page === idx + 1}
                    onClick={() => setPage(idx + 1)}
                  >
                    {idx + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
                  className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default Notifications;