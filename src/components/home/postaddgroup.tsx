import React, { useRef, useState, useEffect } from "react";
import { X, ImageIcon, Smile, FileText } from "lucide-react";
import axios from "axios";
import Image from "next/image";
import { BASEURL } from "@/app/constants/url";

const user = {
  name: "Lê Khánh",
  avatar: "/api/placeholder/40/40",
  privacy: "Bạn bè ngoại trừ...",
};

interface PostAddProps {
  groupid: string;
  groupname: string;
  _id: string;
  name: string;
  avatar?: string;
  onClose: () => void;
  onPostSuccess?: () => Promise<void>;
}

const emojiList = [
  "😀",
  "😂",
  "😍",
  "🥳",
  "😎",
  "😭",
  "👍",
  "🔥",
  "❤️",
  "🎉",
  "😃",
  "😅",
  "😆",
  "😉",
  "😊",
  "😋",
  "😜",
  "🤩",
  "😏",
  "😢",
];

const PostAddGroup: React.FC<PostAddProps> = ({ 
  groupid, 
  groupname, 
  _id = "user123", 
  name, 
  avatar,
  onClose,
  onPostSuccess
}) => {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [showEmoji, setShowEmoji] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log("Files:", files);
  }, [files]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter((file) => {
        if (!file.type.startsWith("image/")) {
          alert("Vui lòng chọn file hình ảnh hợp lệ");
          return false;
        }
        if (file.size > 5 * 1024 * 1024) {
          alert("File hình ảnh phải nhỏ hơn 5MB");
          return false;
        }
        return true;
      });
      setFiles((prev) => [...prev, ...selectedFiles]);
      setUploadStatus("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter((file) => {
        if (file.size > 10 * 1024 * 1024) {
          alert("File phải nhỏ hơn 10MB");
          return false;
        }
        return true;
      });
      setFiles((prev) => [...prev, ...selectedFiles]);
      setUploadStatus("");
    }
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEmojiClick = (emoji: string) => {
    setContent((prev) => prev + emoji);
    setShowEmoji(false);
  };

  const handlePost = async () => {
    if (!content.trim() && files.length === 0) {
      alert("Vui lòng nhập nội dung hoặc chọn file");
      return;
    }

    setIsLoading(true);
    setUploadStatus("Đang đăng bài...");

    const formData = new FormData();
    formData.append("userId", _id);
    formData.append("groupid", groupid);
    formData.append("text", content.trim());

    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");
      const res = await axios.post(`${BASEURL}/api/create/grpost`, formData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "multipart/form-data",
        },
      });

      if (res && res.status === 201) {
        setUploadStatus("Đăng bài thành công !");
        
        // Gọi callback để refresh data
        if (onPostSuccess) {
          await onPostSuccess();
        }
        
        setTimeout(() => {
          setContent("");
          setFiles([]);
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error("Error:", error);
      setUploadStatus("Có lỗi xảy ra khi đăng bài. Vui lòng thử lại.");
      if (error instanceof Error) {
        console.error("Error message:", error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isPostEnabled = (content.trim() || files.length > 0) && !isLoading;

  return (
    <div className="bg-white top-[5vh] rounded-2xl w-full max-w-xl mx-auto p-0 relative shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-7 pb-3 border-b border-blue-100">
        <span className="text-xl font-bold text-blue-900">
          Tạo bài viết trong nhóm {groupname}
        </span>
        <button
          onClick={onClose}
          className="text-blue-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50"
          disabled={isLoading}
        >
          <X size={28} />
        </button>
      </div>

      {/* User info */}
      <div className="flex items-center gap-4 px-8 pt-6">
        <Image
          src={avatar || "/api/placeholder/40/40"}
          alt="avatar"
          className="w-12 h-12 rounded-full object-cover bg-blue-100"
          width={96}
          height={96}
        />
        <div>
          <div className="text-blue-900 font-semibold text-lg">
            {name || user.name}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 pt-4">
        <textarea
          className="w-full bg-transparent text-xl text-blue-900 outline-none resize-none placeholder-blue-400 border-none min-h-[120px]"
          rows={6}
          placeholder="Lê ơi, bạn đang nghĩ gì thế?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isLoading}
        />

        {/* Preview files (images & docs) */}
        {files.length > 0 && (
          <div className="mt-3 flex flex-col gap-3">
            {files.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 text-blue-800 bg-blue-50 p-4 rounded-xl"
              >
                {file.type.startsWith("image/") ? (
                  <Image
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="w-16 h-16 object-cover rounded"
                    width={96}
                    height={96}
                  />
                ) : (
                  <a
                    href={URL.createObjectURL(file)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <FileText size={36} />
                    <span className="underline">{file.name}</span>
                  </a>
                )}

                <button
                  onClick={() => removeFile(idx)}
                  className="text-red-500 hover:text-red-700 p-2"
                  disabled={isLoading}
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload status */}
        {uploadStatus && (
          <div className="mt-3 text-base text-center text-blue-600 bg-blue-50 p-3 rounded">
            {uploadStatus}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-8 pt-4 pb-6">
        <div className="bg-blue-50 rounded-xl flex items-center px-3 py-3 gap-3 mb-4 justify-end">
          {/* Giữ lại text "Thêm vào bài viết của bạn" */}
          <span className="text-blue-700 text-base font-medium mr-auto">
            Thêm vào bài viết của bạn
          </span>
          {/* Các nút icon về bên phải */}
          <button
            className="p-3 rounded hover:bg-blue-100 disabled:opacity-50"
            onClick={() => imageInputRef.current?.click()}
            title="Hình ảnh"
            type="button"
            disabled={isLoading}
          >
            <ImageIcon className="text-green-500" size={26} />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={imageInputRef}
              onChange={handleImageChange}
              multiple
            />
          </button>

          <button
            className="p-3 rounded hover:bg-blue-100 disabled:opacity-50"
            onClick={() => fileInputRef.current?.click()}
            title="Tài liệu"
            type="button"
            disabled={isLoading}
          >
            <FileText className="text-blue-500" size={26} />
            <input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
            />
          </button>

          {/* Nút emoji */}
          <div className="relative">
            <button
              className="p-3 rounded hover:bg-blue-100 disabled:opacity-50"
              title="Cảm xúc/hoạt động"
              type="button"
              disabled={isLoading}
              onClick={() => setShowEmoji((v) => !v)}
            >
              <Smile className="text-yellow-400" size={26} />
            </button>
            {showEmoji && (
              <div className="absolute z-10 bg-white border rounded shadow p-2 flex gap-1 top-12 right-0">
                {emojiList.map((emoji) => (
                  <button
                    key={emoji}
                    className="text-2xl hover:bg-blue-100 rounded"
                    type="button"
                    onClick={() => handleEmojiClick(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          className={`w-full py-3 rounded-xl font-semibold text-white text-lg transition-colors ${
            isPostEnabled
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-blue-200 cursor-not-allowed"
          }`}
          disabled={!isPostEnabled}
          onClick={handlePost}
        >
          {isLoading ? "Đang đăng..." : "Đăng"}
        </button>
      </div>
    </div>
  );
};

export default PostAddGroup;