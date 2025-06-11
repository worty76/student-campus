import React, { useState } from "react";
import { Button } from "../ui/button";

type PrivacySettings = {
    profileVisibility: "everyone" | "friends" | "onlyme";
    messagePermission: "everyone" | "friends" | "noone";
};

const Privacy = () => {
    const [privacy, setPrivacy] = useState<PrivacySettings>({
        profileVisibility: "everyone",
        messagePermission: "everyone",
    });
    const [saved, setSaved] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
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
           <Button type="submit" className="mt-4 bg-blue-500 text-white hover:bg-blue-600">
            Lưu cài đặt
            </Button>
            {saved && (
                <span className="ml-4 text-green-600 font-medium">Đã lưu!</span>
            )}
        </form>
    );
};

export default Privacy;