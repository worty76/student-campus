'use client'
import React, { useState } from "react";
import { Bell, Users, Image as ImageIcon, Trophy } from "lucide-react";
import NavigationBar from "@/app/(main)/layouts/navbar";
import Image from "next/image";
const notifications = [
    {
        id: 1,
        avatar: "/schoolimg.jpg",
        name: "Nguyễn Văn A",
        content: 'đã chia sẻ tài liệu "Bài tập Toán lớp 12" với bạn.',
        time: "2 giờ",
        icon: <ImageIcon className="text-blue-500" size={20} />,
        unread: true,
    },
    {
        id: 2,
        avatar: "/schoolimg.jpg",
        name: "Lê Thị B",
        content: "đã đăng tin tức mới: Kinh nghiệm ôn thi đại học hiệu quả.",
        time: "5 giờ",
        icon: <Users className="text-blue-500" size={20} />,
        unread: true,
    },
    {
        id: 3,
        avatar: "/schoolimg.jpg",
        name: "Nhóm Học Tập Lý 12",
        content:
            "vừa chia sẻ tài liệu: Đề cương ôn tập học kỳ II môn Vật Lý.",
        time: "1 ngày",
        icon: <Users className="text-blue-500" size={20} />,
        unread: true,
    },
    {
        id: 4,
        avatar: "/schoolimg.jpg",
        name: "Bạn",
        content:
            "đã nhận được huy hiệu Chia sẻ tích cực vì đóng góp nhiều tài liệu hữu ích.",
        time: "2 ngày",
        icon: <Trophy className="text-yellow-400" size={20} />,
        unread: true,
    },
];

const Notifications = () => {
  const [tab, setTab] = useState<"all" | "unread">("all");

  return (
    <div
      className="bg-white rounded-xl shadow-lg p-0"
      style={{
        width: "60vw",
        margin: "0 auto",
        marginTop: "10vh",
        minHeight: "60vh",
      }}
    >
      {/* Header */}
      <NavigationBar />
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <h2 className="text-2xl font-bold text-blue-900">Thông báo</h2>
        <Bell className="text-blue-500" size={28} />
      </div>
      {/* Tabs */}
      <div className="flex gap-2 px-6 pb-2">
        <button
          className={`px-4 py-1 rounded-full font-semibold text-sm ${
            tab === "all"
              ? "bg-blue-600 text-white"
              : "bg-transparent text-blue-600 hover:bg-blue-100"
          }`}
          onClick={() => setTab("all")}
        >
          Tất cả
        </button>
        <button
          className={`px-4 py-1 rounded-full font-semibold text-sm ${
            tab === "unread"
              ? "bg-blue-600 text-white"
              : "bg-transparent text-blue-600 hover:bg-blue-100"
          }`}
          onClick={() => setTab("unread")}
        >
          Chưa đọc
        </button>
      </div>
      {/* List */}
      <div className="px-6 pb-2 text-blue-900">
        <div className="text-blue-400 text-sm mb-2 mt-2">Trước đó</div>
        {notifications
          .filter((n) => tab === "all" || n.unread)
          .map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 py-3 border-b border-blue-100 last:border-b-0 relative group`}
            >
                <Image
                src={n.avatar}
                alt={n.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover mt-1"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{n.name}</span>
                  {n.icon}
                </div>
                <div className="text-blue-800 text-[15px] truncate">{n.content}</div>
                <div className="text-xs text-blue-400 mt-1">{n.time}</div>
              </div>
              {n.unread && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full"></span>
              )}
            </div>
          ))}
      </div>
      {/* Footer */}
      <div className="px-6 py-3">
        <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-2 rounded-lg transition">
          Xem thông báo trước đó
        </button>
      </div>
    </div>
  );
};

export default Notifications;