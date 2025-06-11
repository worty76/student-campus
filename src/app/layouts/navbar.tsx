import React from "react";
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
} from "@/components/ui/navigation-menu";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function NavigationBar() {
    return (
         <div className="fixed left-0 top-0 w-full bg-white border-t border-gray-200 z-50 shadow-lg flex justify-center">
                <NavigationMenu className="w-full max-w-xl h-16">
                <NavigationMenuList className="flex justify-center gap-2 sm:gap-6 py-3 w-full">
                    <NavigationMenuItem>
                        <NavigationMenuLink
                            href="/home"
                            className="flex items-center gap-2 px-2 sm:px-4 py-2 text-blue-600 font-medium hover:text-blue-700 transition-colors text-sm sm:text-base"
                        >
                            <span>🏠</span>
                            <span className="hidden sm:inline">Home</span>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink
                            href="/messages"
                            className="flex items-center gap-2 px-2 sm:px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base"
                        >
                            <span>💬</span>
                            <span className="hidden sm:inline">Messages</span>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink
                            href="/documents"
                            className="flex items-center gap-2 px-2 sm:px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base"
                        >
                            <span>📚</span>
                            <span className="hidden sm:inline">Documents</span>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink
                            href="/friends"
                            className="flex items-center gap-2 px-2 sm:px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base"
                        >
                            <span>🔍</span>
                            <span className="hidden sm:inline">Friends</span>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    {/* Profile stays before the last three */}
                   
                    {/* The following three items are at the end */}
                     <NavigationMenuItem className="relative">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <NavigationMenuLink
                                    href="#"
                                    className="flex items-center gap-2 px-2 sm:px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base"
                                    tabIndex={0}
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                >
                                    <span>🔔</span>
                                    <span className="hidden sm:inline">Notifications</span>
                                </NavigationMenuLink>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="center"
                                className="left-1/2 -translate-x-1/2 min-w-[260px] sm:min-w-[320px] mt-2"
                                style={{ position: "absolute" }}
                            >
                                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    New message from Alice
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    Document Math101pdf updated
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    John sent you a friend request
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </NavigationMenuItem>
                     <NavigationMenuItem>
                        <NavigationMenuLink
                            href="/user"
                            className="flex items-center gap-2 px-2 sm:px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base"
                        >
                            <span>👤</span>
                            <span className="hidden sm:inline">Profile</span>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink
                            href="/settings"
                            className="flex items-center gap-2 px-2 sm:px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base"
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