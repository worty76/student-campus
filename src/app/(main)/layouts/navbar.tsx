import React, { useState, useEffect, useCallback } from "react";
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    
} from "@/components/ui/navigation-menu";
import axios from "axios";
import { BASEURL } from "@/app/constants/url";
import { useWebSocket } from "@/app/context/websocket.contex";



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
        window.location.href = href;
    };

    return (
        <div className="fixed left-0 top-0 w-full bg-[#1E293B] border-t border-gray-200 z-50 shadow-lg flex justify-center">
            <NavigationMenu className="w-full max-w-xl h-16">
                <NavigationMenuList className="flex justify-center gap-2 sm:gap-6 py-3 w-full">
                    <NavigationMenuItem>
                        <button
                            onClick={() => handleNav("/home")}
                            className="flex items-center gap-2 px-2 sm:px-4 py-2 font-medium transition-colors text-sm sm:text-base bg-transparent focus:bg-transparent active:bg-transparent"
                        >
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                                <path d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4h-4v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10.5Z"
                                    stroke={isActive("/home") ? "#3b82f6" : "#fff"}
                                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                            <span className={`hidden sm:inline ${isActive("/home") ? "text-blue-500" : "text-white"}`}>Home</span>
                        </button>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <button
                            onClick={() => handleNav("/messages")}
                            className="flex items-center gap-2 px-2 sm:px-4 py-2 font-medium transition-colors text-sm sm:text-base bg-transparent focus:bg-transparent active:bg-transparent"
                        >
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z"
                                    stroke={isActive("/messages") ? "#3b82f6" : "#fff"}
                                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                            <span className={`hidden sm:inline ${isActive("/messages") ? "text-blue-500" : "text-white"}`}>Messages</span>
                        </button>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <button
                            onClick={() => handleNav("/documents")}
                            className="flex items-center gap-2 px-2 sm:px-4 py-2 font-medium transition-colors text-sm sm:text-base bg-transparent focus:bg-transparent active:bg-transparent"
                        >
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                                <rect x="4" y="2" width="16" height="20" rx="2"
                                    stroke={isActive("/documents") ? "#3b82f6" : "#fff"}
                                    strokeWidth="2" fill="none" />
                                <path d="M9 10h6M9 14h6" stroke={isActive("/documents") ? "#3b82f6" : "#fff"} strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <span className={`hidden sm:inline ${isActive("/documents") ? "text-blue-500" : "text-white"}`}>Documents</span>
                        </button>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <button
                            onClick={() => handleNav("/community")}
                            className="flex items-center gap-2 px-2 sm:px-4 py-2 font-medium transition-colors text-sm sm:text-base bg-transparent focus:bg-transparent active:bg-transparent"
                        >
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                                <circle cx="12" cy="7" r="4"
                                    stroke={isActive("/community") ? "#3b82f6" : "#fff"}
                                    strokeWidth="2" fill="none" />
                                <path d="M5.5 21a6.5 6.5 0 0 1 13 0"
                                    stroke={isActive("/community") ? "#3b82f6" : "#fff"}
                                    strokeWidth="2" fill="none" />
                            </svg>
                            <span className={`hidden sm:inline ${isActive("/community") ? "text-blue-500" : "text-white"}`}>Community</span>
                        </button>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <button
                            onClick={() => handleNav("/friends")}
                            className="flex items-center gap-2 px-2 sm:px-4 py-2 font-medium transition-colors text-sm sm:text-base bg-transparent focus:bg-transparent active:bg-transparent"
                        >
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                                <circle cx="8" cy="8" r="4"
                                    stroke={isActive("/friends") ? "#3b82f6" : "#fff"}
                                    strokeWidth="2" fill="none" />
                                <circle cx="16" cy="17" r="4"
                                    stroke={isActive("/friends") ? "#3b82f6" : "#fff"}
                                    strokeWidth="2" fill="none" />
                            </svg>
                            <span className={`hidden sm:inline ${isActive("/friends") ? "text-blue-500" : "text-white"}`}>Friends</span>
                        </button>
                    </NavigationMenuItem>
                    {/* Notification */}
                    <NavigationMenuItem className="relative">
                        <button
                            onClick={() => handleNav("/notifications")}
                            className="flex items-center gap-2 px-2 sm:px-4 py-2 font-medium transition-colors text-sm sm:text-base bg-transparent focus:bg-transparent active:bg-transparent"
                        >
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                                <path d="M18 17v-5a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2Z"
                                    stroke={isActive("/notifications") ? "#3b82f6" : "#fff"}
                                    strokeWidth="2" fill="none" />
                            </svg>
                            {noticounts > 0 && (
                                <span className="absolute right-[110px] -bottom-2 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] flex items-center justify-center border border-white shadow">
                                    {noticounts}
                                </span>
                            )}
                            <span className={`hidden sm:inline ${isActive("/notifications") ? "text-blue-500" : "text-white"}`}>Notifications</span>
                        </button>
                    </NavigationMenuItem>
                    {/* Profile */}
                    <NavigationMenuItem>
                        <button
                            onClick={() => handleNav(`/user/profile?userid=${userId}`)}
                            className="flex items-center gap-2 px-2 sm:px-4 py-2 font-medium transition-colors text-sm sm:text-base bg-transparent focus:bg-transparent active:bg-transparent"
                        >
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                                <circle cx="12" cy="8" r="4"
                                    stroke={isActive(`/user/profile?userid=${userId}`) ? "#3b82f6" : "#fff"}
                                    strokeWidth="2" fill="none" />
                                <path d="M4 20a8 8 0 0 1 16 0"
                                    stroke={isActive(`/user/profile?userid=${userId}`) ? "#3b82f6" : "#fff"}
                                    strokeWidth="2" fill="none" />
                            </svg>
                            <span className={`hidden sm:inline ${isActive(`/user/profile?userid=${userId}`) ? "text-blue-500" : "text-white"}`}>Profile</span>
                        </button>
                    </NavigationMenuItem>
                    {/* Settings */}
                    <NavigationMenuItem>
                        <button
                            onClick={() => handleNav("/settings")}
                            className="flex items-center gap-2 px-2 sm:px-4 py-2 font-medium transition-colors text-sm sm:text-base bg-transparent focus:bg-transparent active:bg-transparent"
                        >
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="3"
                                    stroke={isActive("/settings") ? "#3b82f6" : "#fff"}
                                    strokeWidth="2" fill="none" />
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
                                    stroke={isActive("/settings") ? "#3b82f6" : "#fff"}
                                    strokeWidth="2" fill="none" />
                            </svg>
                            <span className={`hidden sm:inline ${isActive("/settings") ? "text-blue-500" : "text-white"}`}>Settings</span>
                        </button>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    );
}