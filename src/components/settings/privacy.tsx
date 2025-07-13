import React, { useState } from "react";
import { Button } from "../ui/button";
import { Globe, Users, Lock, Bell, BellOff, Shield, Check } from "lucide-react";

type PrivacySettings = {
    profileVisibility:   'everyone'|"friends" | "private";
    messagePermission:  "friends" | "noone";
    notifications: "yes" | "no"; // Đổi thành yes | no
};

interface PrivacyProps {
    onSave: (settings: PrivacySettings) => void;
}

const Privacy: React.FC<PrivacyProps> = ({ onSave }) => {
    const [privacy, setPrivacy] = useState<PrivacySettings>({
        profileVisibility: "friends",
        messagePermission: "friends",
        notifications: "yes",
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSave(privacy);
        } finally {
            setIsLoading(false);
        }
    };

    const privacyOptions = [
        {
            value: "everyone",
            label: "Mọi người",
            description: "Tất cả mọi người có thể xem",
            icon: Globe,
            color: "text-blue-600 dark:text-blue-400"
        },
        {
            value: "friends",
            label: "Bạn bè",
            description: "Chỉ bạn bè có thể xem",
            icon: Users,
            color: "text-green-600 dark:text-green-400"
        },
        {
            value: "onlyme",
            label: "Chỉ mình tôi",
            description: "Chỉ bạn có thể xem",
            icon: Lock,
            color: "text-red-600 dark:text-red-400"
        }
    ];

    const messageOptions = [
        {
            value: "friends",
            label: "Bạn bè",
            description: "Chỉ bạn bè có thể nhắn tin",
            icon: Users,
            color: "text-green-600 dark:text-green-400"
        },
        {
            value: "noone",
            label: "Không ai",
            description: "Không ai có thể nhắn tin",
            icon: Lock,
            color: "text-red-600 dark:text-red-400"
        }
    ];

    return (
        <form onSubmit={handleSave} className="space-y-8">
            {/* Profile Visibility */}
            <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Quyền xem hồ sơ
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Chọn ai có thể xem thông tin hồ sơ của bạn
                        </p>
                    </div>
                </div>
                
                <div className="grid gap-3">
                    {privacyOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = privacy.profileVisibility === option.value;
                        return (
                            <label
                                key={option.value}
                                className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                    isSelected
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="profileVisibility"
                                    value={option.value}
                                    checked={isSelected}
                                    onChange={(e) =>
                                        setPrivacy((prev) => ({
                                            ...prev,
                                            profileVisibility: e.target.value as PrivacySettings["profileVisibility"],
                                        }))
                                    }
                                    className="sr-only"
                                />
                                <div className="flex items-center space-x-3 flex-1">
                                    <Icon className={`w-5 h-5 ${option.color}`} />
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {option.label}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {option.description}
                                        </div>
                                    </div>
                                </div>
                                {isSelected && (
                                    <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                )}
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Message Permission */}
            <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Quyền nhắn tin
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Chọn ai có thể gửi tin nhắn cho bạn
                        </p>
                    </div>
                </div>
                
                <div className="grid gap-3">
                    {messageOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = privacy.messagePermission === option.value;
                        return (
                            <label
                                key={option.value}
                                className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                    isSelected
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="messagePermission"
                                    value={option.value}
                                    checked={isSelected}
                                    onChange={(e) =>
                                        setPrivacy((prev) => ({
                                            ...prev,
                                            messagePermission: e.target.value as PrivacySettings["messagePermission"],
                                        }))
                                    }
                                    className="sr-only"
                                />
                                <div className="flex items-center space-x-3 flex-1">
                                    <Icon className={`w-5 h-5 ${option.color}`} />
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {option.label}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {option.description}
                                        </div>
                                    </div>
                                </div>
                                {isSelected && (
                                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                                )}
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Notifications */}
            <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                        <Bell className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Thông báo
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Quản lý cách bạn nhận thông báo
                        </p>
                    </div>
                </div>
                
                <label className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    privacy.notifications === "yes"
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }`}>
                    <input
                        type="checkbox"
                        checked={privacy.notifications === "yes"}
                        onChange={(e) =>
                            setPrivacy((prev) => ({
                                ...prev,
                                notifications: e.target.checked ? "yes" : "no",
                            }))
                        }
                        className="sr-only"
                    />
                    <div className="flex items-center space-x-3 flex-1">
                        {privacy.notifications === "yes" ? (
                            <Bell className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        ) : (
                            <BellOff className="w-5 h-5 text-gray-400" />
                        )}
                        <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                                Nhận thông báo
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {privacy.notifications === "yes" 
                                    ? "Bạn sẽ nhận được tất cả thông báo" 
                                    : "Tắt tất cả thông báo"
                                }
                            </div>
                        </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${
                        privacy.notifications === "yes" ? 'bg-yellow-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200 ${
                            privacy.notifications === "yes" ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                    </div>
                </label>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                            Đang lưu...
                        </div>
                    ) : (
                        <div className="flex items-center justify-center">
                            <Shield className="h-4 w-4 mr-2" />
                            Lưu cài đặt
                        </div>
                    )}
                </Button>
            </div>
        </form>
    );
};

export default Privacy;