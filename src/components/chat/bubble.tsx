import React, { useState } from "react";

interface BubbleChatProps {
  name: string;
  status: string;
}

const BubbleChat: React.FC<BubbleChatProps> = ({ name, status }) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="fixed bottom-6 right-6 z-[1000]">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="w-18 h-18 rounded-full bg-blue-700 text-white shadow-lg flex items-center justify-center text-3xl hover:bg-blue-800 transition"
          aria-label="Open chat"
        >
          💬
        </button>
      )}

      {open && (
        <div className="w-80 h-[400px] bg-white rounded-2xl shadow-2xl flex flex-col relative">
          <div className="px-4 py-3 border-b border-gray-200 bg-blue-700 text-white rounded-t-2xl flex justify-between items-center">
            <div>
              <div className="font-bold">{name}</div>
              <div className="text-sm opacity-80">{status}</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="bg-transparent border-none text-white text-xl cursor-pointer"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto text-sm text-gray-700">
            <div className="text-gray-400">No messages yet.</div>
          </div>
          <form
            className="flex border-t border-gray-200 p-2 bg-gray-50"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 border-none outline-none px-3 py-2 rounded-lg text-sm bg-gray-100 mr-2"
              disabled
            />
            <button
              type="submit"
              className="bg-blue-700 text-white rounded-lg px-4 py-2 font-medium cursor-pointer disabled:opacity-60"
              disabled
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default BubbleChat;
