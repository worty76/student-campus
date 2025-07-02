import React, { useState, useEffect, useCallback } from "react";
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
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
 
    const {addMessageHandler} = useWebSocket();

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

    return (
        <div className="fixed left-0 top-0 w-full bg-[#1E293B] border-t border-gray-200 z-50 shadow-lg flex justify-center">
            <NavigationMenu className="w-full max-w-xl h-16">
                <NavigationMenuList className="flex justify-center gap-2 sm:gap-6 py-3 w-full">
                    <NavigationMenuItem>
                        <NavigationMenuLink
                            href="/home"
                        
    
                            className="flex items-center gap-2 px-2 sm:px-4 py-2 text-white font-medium transition-colors text-sm sm:text-base hover:bg-transparent hover:text-blue-300 focus:bg-transparent focus:text-blue-300 active:bg-transparent active:text-blue-300"
                        >
                            <span>🏠</span>
                            <span className="hidden sm:inline">Home</span>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink
                            href="/messages"

                            className="flex items-center gap-2 px-2 sm:px-4 py-2 text-white font-medium transition-colors text-sm sm:text-base hover:bg-transparent hover:text-blue-300 focus:bg-transparent focus:text-blue-300 active:bg-transparent active:text-blue-300"
                         
                        >
                            <span>💬</span>
                            <span className="hidden sm:inline">Messages</span>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink
                            href="/documents"
                              className="flex items-center gap-2 px-2 sm:px-4 py-2 text-white font-medium transition-colors text-sm sm:text-base hover:bg-transparent hover:text-blue-300 focus:bg-transparent focus:text-blue-300 active:bg-transparent active:text-blue-300"
                        >
                            <span>📚</span>
                            <span className="hidden sm:inline">Documents</span>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink
                            href="/community"
                            className="flex items-center gap-2 px-2 sm:px-4 py-2 text-white font-medium transition-colors text-sm sm:text-base hover:bg-transparent hover:text-blue-300 focus:bg-transparent focus:text-blue-300 active:bg-transparent active:text-blue-300"
                        >
                            <span>🌐</span>
                            <span className="hidden sm:inline">Comunity</span>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink
                            href="/friends"
                              className="flex items-center gap-2 px-2 sm:px-4 py-2 text-white font-medium transition-colors text-sm sm:text-base hover:bg-transparent hover:text-blue-300 focus:bg-transparent focus:text-blue-300 active:bg-transparent active:text-blue-300"
                        >
                            <span>🔍</span>
                            <span className="hidden sm:inline">Friends</span>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    {/* Profile stays before the last three */}
                    {/* The following three items are at the end */}
                    <NavigationMenuItem className="relative">
                        <NavigationMenuLink
                            href='/notifications'
                            className="flex items-center gap-2 px-2 sm:px-4 py-2 text-white font-medium transition-colors text-sm sm:text-base hover:bg-transparent hover:text-blue-300 focus:bg-transparent focus:text-blue-300 active:bg-transparent active:text-blue-300"
                        >
                            <span>🔔
                                {/* Notification badge */}
                                {noticounts > 0 && (
                                    <span className="absolute -bottom-[-30px] -right-[-40px] bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] flex items-center justify-center border border-white shadow">
                                        {noticounts}
                                    </span>
                                )}
                            </span>
                            <span className="hidden sm:inline">Notifications</span>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink
                            href={`/user/profile?userid=${userId}`}
                            className="flex items-center gap-2 px-2 sm:px-4 py-2 text-white font-medium transition-colors text-sm sm:text-base hover:bg-transparent hover:text-blue-300 focus:bg-transparent focus:text-blue-300 active:bg-transparent active:text-blue-300"
                        >
                            <span>👤</span>
                            <span className="hidden sm:inline">Profile</span>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink
                            href="/settings"
                            className="flex items-center gap-2 px-2 sm:px-4 py-2 text-white font-medium transition-colors text-sm sm:text-base hover:bg-transparent hover:text-blue-300 focus:bg-transparent focus:text-blue-300 active:bg-transparent active:text-blue-300"
                        >
                            <span>⚙️</span>
                            <span className="hidden sm:inline">Settings</span>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    );
}