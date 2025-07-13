import React, { useState, useEffect, useCallback } from "react";
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    
} from "@/components/ui/navigation-menu";
import axios from "axios";
import { BASEURL } from "@/app/constants/url";
import { useWebSocket } from "@/app/context/websocket.contex";
import { useRouter } from "next/navigation";


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

export default function NavigationBar() {
    const [userId, setUserId] = useState('');
    const [noticounts, setNoticounts] = useState(0);
    const [activePage, setActivePage] = useState<string>("/home");
   
    const { addMessageHandler } = useWebSocket();
    const router = useRouter();

    // Wrap getNotificationCounts in useCallback
    const getNotificationCounts = useCallback(async () => {
        try {
            const id = localStorage.getItem("userId");
            const token = localStorage.getItem("token");

            if (!id || !token) {
                throw new Error("Authentication required");
            }

            const response = await axios.get(
                `${BASEURL}/api/count-unread/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log('Notification counts response:', response.data);
            const unreadCount = response.data.unreadCount;
            setNoticounts(typeof unreadCount === 'number' ? unreadCount : 0);
        } catch (error) {
            console.error('Error fetching notification counts:', error);
            setNoticounts(0);
        }
    }, []); // No dependencies, or add BASEURL if it can change

    useEffect(() => {
        const handler = (message: WebSocketMessage) => {
            console.log("WebSocket message:", message);
          if (
            message?.type === "likes_post" ||
            message?.type === "friend_request" ||
            message?.type === "accept_request" ||
            message?.type === "Comment"
          ) {
            getNotificationCounts();
            
          }
        };

        const removeHandler = addMessageHandler(handler);
        return removeHandler;
      }, [addMessageHandler, getNotificationCounts]);

    useEffect(() => {
        // Check if we're in a browser environment and token exists
        if (typeof window !== 'undefined') {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    // Simple token parsing - in production, use a proper JWT library
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    setUserId(payload.userId || '');
                }
            } catch (error) {
                console.error('Error decoding token:', error);
                setUserId('');
            }
        }
        getNotificationCounts();
    }, [getNotificationCounts]);

    // Set active page on mount or when path changes
    useEffect(() => {
        if (typeof window !== "undefined") {
            setActivePage(window.location.pathname);
        }
    }, []);

    // Helper to check active
    const isActive = (href: string) => activePage === href;

    // Handler for navigation
    const handleNav = (href: string) => {
        setActivePage(href);
        router.push(href);
    };

    return (
        <div className="fixed left-0 top-0 w-full bg-[#1E293B] z-50 shadow-lg flex justify-center px-2 sm:px-4 h-16">
            <NavigationMenu className="w-full max-w-7xl h-full">
                <NavigationMenuList className="flex justify-between sm:justify-center gap-1 sm:gap-4 md:gap-6 py-3 w-full h-full items-center">
                    <NavigationMenuItem>
                        <button
                            onClick={() => handleNav("/home")}
                            className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-2 font-medium transition-colors hover:opacity-80 text-xs sm:text-sm md:text-base bg-transparent focus:bg-transparent active:bg-transparent"
                        >
                            <div className="sm:hidden">
                                <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                                    <path d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4h-4v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10.5Z"
                                        stroke={isActive("/home") ? "#0694FA" : "#fff"}
                                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                </svg>
                            </div>
                            <span className={`hidden sm:block ${isActive("/home") ? "text-[#0694FA]" : "text-white"}`}>Trang chủ</span>
                        </button>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <button
                            onClick={() => handleNav("/messages")}
                            className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-2 font-medium transition-colors hover:opacity-80 text-xs sm:text-sm md:text-base bg-transparent focus:bg-transparent active:bg-transparent"
                        >
                            <div className="sm:hidden">
                                <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z"
                                        stroke={isActive("/messages") ? "#0694FA" : "#fff"}
                                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                </svg>
                            </div>
                            <span className={`hidden sm:block ${isActive("/messages") ? "text-[#0694FA]" : "text-white"}`}>Tin nhắn</span>
                        </button>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <button
                            onClick={() => handleNav("/documents")}
                            className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-2 font-medium transition-colors hover:opacity-80 text-xs sm:text-sm md:text-base bg-transparent focus:bg-transparent active:bg-transparent"
                        >
                            <div className="sm:hidden">
                                <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                                    <rect x="4" y="2" width="16" height="20" rx="2"
                                        stroke={isActive("/documents") ? "#0694FA" : "#fff"}
                                        strokeWidth="2" fill="none" />
                                    <path d="M9 10h6M9 14h6" stroke={isActive("/documents") ? "#0694FA" : "#fff"} strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                            <span className={`hidden sm:block ${isActive("/documents") ? "text-[#0694FA]" : "text-white"}`}>Tài liệu</span>
                        </button>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <button
                            onClick={() => handleNav("/community")}
                            className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-2 font-medium transition-colors hover:opacity-80 text-xs sm:text-sm md:text-base bg-transparent focus:bg-transparent active:bg-transparent"
                        >
                            <div className="sm:hidden">
                                <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                                    <circle cx="12" cy="7" r="4"
                                        stroke={isActive("/community") ? "#0694FA" : "#fff"}
                                        strokeWidth="2" fill="none" />
                                    <path d="M5.5 21a6.5 6.5 0 0 1 13 0"
                                        stroke={isActive("/community") ? "#0694FA" : "#fff"}
                                        strokeWidth="2" fill="none" />
                                </svg>
                            </div>
                            <span className={`hidden sm:block ${isActive("/community") ? "text-[#0694FA]" : "text-white"}`}>Cộng đồng</span>
                        </button>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <button
                            onClick={() => handleNav("/friends")}
                            className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-2 font-medium transition-colors hover:opacity-80 text-xs sm:text-sm md:text-base bg-transparent focus:bg-transparent active:bg-transparent"
                        >
                            <div className="sm:hidden">
                                <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                                    <circle cx="8" cy="8" r="4"
                                        stroke={isActive("/friends") ? "#0694FA" : "#fff"}
                                        strokeWidth="2" fill="none" />
                                    <circle cx="16" cy="17" r="4"
                                        stroke={isActive("/friends") ? "#0694FA" : "#fff"}
                                        strokeWidth="2" fill="none" />
                                </svg>
                            </div>
                            <span className={`hidden sm:block ${isActive("/friends") ? "text-[#0694FA]" : "text-white"}`}>Bạn bè</span>
                        </button>
                    </NavigationMenuItem>
                    {/* Notification */}
                    <NavigationMenuItem className="relative">
                        <button
                            onClick={() => handleNav("/notifications")}
                            className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-2 font-medium transition-colors hover:opacity-80 text-xs sm:text-sm md:text-base bg-transparent focus:bg-transparent active:bg-transparent"
                        >
                            <div className="sm:hidden relative">
                                <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                                    <path d="M18 17v-5a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2Z"
                                        stroke={isActive("/notifications") ? "#0694FA" : "#fff"}
                                        strokeWidth="2" fill="none" />
                                </svg>
                                {noticounts > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] flex items-center justify-center border border-white shadow">
                                        {noticounts}
                                    </span>
                                )}
                            </div>
                            <span className={`hidden sm:block ${isActive("/notifications") ? "text-[#0694FA]" : "text-white"}`}>
                                Thông báo
                                {noticounts > 0 && (
                                    <span className="ml-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] inline-flex items-center justify-center">
                                        {noticounts}
                                    </span>
                                )}
                            </span>
                        </button>
                    </NavigationMenuItem>
                    {/* Profile */}
                    <NavigationMenuItem>
                        <button
                            onClick={() => handleNav(`/user/profile?userid=${userId}`)}
                            className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-2 font-medium transition-colors hover:opacity-80 text-xs sm:text-sm md:text-base bg-transparent focus:bg-transparent active:bg-transparent"
                        >
                            <div className="sm:hidden">
                                <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                                    <circle cx="12" cy="8" r="4"
                                        stroke={isActive(`/user/profile?userid=${userId}`) ? "#0694FA" : "#fff"}
                                        strokeWidth="2" fill="none" />
                                    <path d="M4 20a8 8 0 0 1 16 0"
                                        stroke={isActive(`/user/profile?userid=${userId}`) ? "#0694FA" : "#fff"}
                                        strokeWidth="2" fill="none" />
                                </svg>
                            </div>
                            <span className={`hidden sm:block ${isActive(`/user/profile?userid=${userId}`) ? "text-[#0694FA]" : "text-white"}`}>Hồ sơ</span>
                        </button>
                    </NavigationMenuItem>
                    {/* Settings */}
                    <NavigationMenuItem>
                        <button
                            onClick={() => handleNav("/settings")}
                            className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-2 font-medium transition-colors hover:opacity-80 text-xs sm:text-sm md:text-base bg-transparent focus:bg-transparent active:bg-transparent"
                        >
                            <div className="sm:hidden">
                                <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="3"
                                        stroke={isActive("/settings") ? "#0694FA" : "#fff"}
                                        strokeWidth="2" fill="none" />
                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
                                        stroke={isActive("/settings") ? "#0694FA" : "#fff"}
                                        strokeWidth="2" fill="none" />
                                </svg>
                            </div>
                            <span className={`hidden sm:block ${isActive("/settings") ? "text-[#0694FA]" : "text-white"}`}>Cài đặt</span>
                        </button>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    );
}