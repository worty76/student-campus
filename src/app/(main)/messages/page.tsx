'use client'
import React, { useState } from "react";
import NavigationBar from "@/app/layouts/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

const conversations = [
  { id: 1, name: "Nguyễn Văn A", lastMessage: "Chào bạn!", unread: 2 },
  { id: 2, name: "Trần Thị B", lastMessage: "Hẹn gặp lại.", unread: 0 },
  { id: 3, name: "Lê Văn C", lastMessage: "Cảm ơn bạn.", unread: 1 },
];

const messages = [
  { id: 1, fromMe: false, text: "Chào bạn!", time: "09:00" },
  { id: 2, fromMe: true, text: "Chào bạn, bạn cần gì?", time: "09:01" },
  { id: 3, fromMe: false, text: "Bạn có tài liệu Toán không?", time: "09:02" },
  { id: 4, fromMe: true, text: "Mình gửi bạn nhé.", time: "09:03" },
];

export default function MessagesPage() {
  const [selected, setSelected] = useState(1);
  const [input, setInput] = useState("");

  return (
    <div>
      <NavigationBar />
      <div className="w-full p-4 h-[90vh] mt-[10vh]">
        <div className="flex h-full bg-white rounded-lg shadow border overflow-hidden " >
          {/* Left: Conversation List */}
          <div className="w-1/4 border-r bg-blue-50 flex flex-col">
            <div className="p-4 font-bold text-blue-700 text-lg border-b">Tin nhắn</div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`p-4 cursor-pointer hover:bg-blue-100 flex justify-between items-center ${
                    selected === conv.id ? "bg-blue-100" : ""
                  }`}
                  onClick={() => setSelected(conv.id)}
                >
                  <div>
                    <div className="font-medium text-blue-900">{conv.name}</div>
                    <div className="text-xs text-gray-500 truncate">{conv.lastMessage}</div>
                  </div>
                  {conv.unread > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 ml-2">
                      {conv.unread}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <Button className="m-4 bg-blue-600 text-white">Tin nhắn mới</Button>
          </div>
          {/* Middle: Chat */}
          <div className="w-2/4 flex flex-col">
            <div className="p-4 border-b font-semibold text-blue-700 flex items-center gap-2">
              <span>Nguyễn Văn A</span>
              <span className="text-xs text-gray-400">(Đang hoạt động)</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-blue-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-xs ${
                      msg.fromMe
                        ? "bg-blue-600 text-white"
                        : "bg-white border text-blue-900"
                    }`}
                  >
                    <div>{msg.text}</div>
                    <div className="text-xs text-gray-400 text-right mt-1">{msg.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <form
              className="flex items-center gap-2 p-4 border-t bg-white"
              onSubmit={e => {
                e.preventDefault();
                setInput("");
              }}
            >
              <Input
                className="flex-1"
                placeholder="Nhập tin nhắn..."
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <Button type="submit" className="bg-blue-600 text-white px-4">
                <Send size={18} />
              </Button>
            </form>
          </div>
          {/* Right: Info */}
          <div className="w-1/4 border-l bg-blue-50 flex flex-col items-center p-6">
            <div className="w-24 h-24 rounded-full bg-blue-200 mb-4" />
            <div className="font-bold text-blue-900 text-lg mb-2">Nguyễn Văn A</div>
            <div className="text-gray-500 mb-4 text-sm">Sinh viên năm 2</div>
            <Button className="bg-blue-600 text-white w-full mb-2">Xem hồ sơ</Button>
            <Button variant="outline" className="w-full">Chặn</Button>
          </div>
        </div>
      </div>
    </div>
  );
}