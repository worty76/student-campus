import React, { useState } from "react";
import { Button } from "../ui/button";

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
        notifications: "yes", // Khởi tạo là "yes"
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(privacy);
    };

    return (
        <form onSubmit={handleSave}>
            <h2 className="text-lg font-semibold mb-3">Cài đặt riêng tư</h2>
            <div className="mb-4 max-w-md">
                <label className="block mb-1 font-medium">
                    Ai có thể xem hồ sơ của bạn?
                </label>
                <select
                    className="w-full border rounded px-3 py-2"
                    value={privacy.profileVisibility}
                    onChange={(e) =>
                        setPrivacy((prev) => ({
                            ...prev,
                            profileVisibility: e.target.value as PrivacySettings["profileVisibility"],
                        }))
                    }
                >
                    <option value="everyone">Mọi người</option>
                    <option value="friends">Bạn bè</option>
                    <option value="onlyme">Chỉ mình tôi</option>
                </select>
            </div>
            <div className="max-w-md mb-4">
                <label className="block mb-1 font-medium">
                    Ai có thể nhắn tin cho bạn?
                </label>
                <select
                    className="w-full border rounded px-3 py-2"
                    value={privacy.messagePermission}
                    onChange={(e) =>
                        setPrivacy((prev) => ({
                            ...prev,
                            messagePermission: e.target.value as PrivacySettings["messagePermission"],
                        }))
                    }
                >
                    <option value="everyone">Mọi người</option>
                    <option value="friends">Bạn bè</option>
                    <option value="noone">Không ai</option>
                </select>
            </div>
            <div className="max-w-md mb-4">
                <label className="block mb-1 font-medium">
                    Nhận thông báo
                </label>
                <input
                    type="checkbox"
                    checked={privacy.notifications === "yes"}
                    onChange={(e) =>
                        setPrivacy((prev) => ({
                            ...prev,
                            notifications: e.target.checked ? "yes" : "no",
                        }))
                    }
                    className="mr-2"
                />
                <span>{privacy.notifications === "yes" ? "Bật" : "Tắt"}</span>
            </div>
            <Button type="submit" className="mt-4 bg-blue-500 text-white hover:bg-blue-600">
                Lưu cài đặt
            </Button>
        </form>
    );
};

export default Privacy;