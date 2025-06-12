import React from "react";
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
} from "@/components/ui/navigation-menu";

export default function NavigationBar() {
    return (
        <div className="fixed left-0 bottom-0 w-full bg-white border-t border-gray-200 z-50 shadow-lg flex justify-center">
            <NavigationMenu className="w-full max-w-2xl h-16">
                <NavigationMenuList className="flex justify-center gap-2 sm:gap-6 py-3 w-full">
                    <NavigationMenuItem>
                        <NavigationMenuLink
                            href="/main/home"
                            className="flex items-center gap-2 px-2 sm:px-4 py-2 text-blue-600 font-medium hover:text-blue-700 transition-colors text-sm sm:text-base"
                        >
                            <span>🏠</span>
                            <span className="hidden sm:inline">Home</span>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink
                            href="#"
                            className="flex items-center gap-2 px-2 sm:px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base"
                        >
                            <span>💬</span>
                            <span className="hidden sm:inline">Messages</span>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink
                            href="#"
                            className="flex items-center gap-2 px-2 sm:px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base"
                        >
                            <span>📚</span>
                            <span className="hidden sm:inline">Documents</span>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink
                            href="/main/friends"
                            className="flex items-center gap-2 px-2 sm:px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base"
                        >
                            <span>🔍</span>
                            <span className="hidden sm:inline">Friends & Communities</span>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink
                            href="/main/user"   
                            className="flex items-center gap-2 px-2 sm:px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base"
                        >
                            <span>👤</span>
                            <span className="hidden sm:inline">Profile</span>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    );
}