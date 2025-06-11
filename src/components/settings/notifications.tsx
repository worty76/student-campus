import React, { useState } from "react";
import { Input } from "../ui/input";
const Notifications = () => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    return (
        <div>
            <h2 className="text-lg font-semibold mb-3">Thông báo</h2>
            <label className="flex items-center gap-3 cursor-pointer">
                <Input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={() => setNotificationsEnabled((v) => !v)}
                    className="accent-blue-600"
                />
                <span>Bật thông báo</span>
            </label>
        </div>
    );
};

export default Notifications;