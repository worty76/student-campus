import React, { useState } from 'react';
import downloadFileFromObject  from '@/app/api/file_handler';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import PostUpdate from '../home/postupdate';
import axios from 'axios';
import { BASEURL } from '@/app/constants/url';
interface FileAttachment {
  url: string;
  filename: string;
  mimetype: string;
  filetype: string;
}
interface Post {
  _id: string;
  userId: string;
  text: string;
  attachments: Attachment[];
  createdAt: string;
  likes: string[];
  comments: string[];
}
interface Attachment {
  file?: FileAttachment;
  url?: string;
  filename?: string;
  mimetype?: string;
  filetype?: string;
}
interface UserdataProps {
  id?: string,
  username: string,
  Year: string,
  Major: string,
  email: string,
  Faculty: string,
  avatar?: string,
  avatar_link?: string,
  interest?: string[]
}

const formatTime = (createdAt: string): string => {
  const now = new Date();
  const postTime = new Date(createdAt);
  const diffInMinutes = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return "Vừa xong";
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
  return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
};

// Sử dụng component thay vì function thường để dùng state
const RenderPost: React.FC<{ post: Post; userData: UserdataProps | null }> = ({ post, userData }) => {
  const [isEditModal, setIsEditModal] = useState(false);
   
  const handleCloseEdit = () => {
    setIsEditModal(false);
    
  };
  const userId = localStorage.getItem('userId');

 const  handleDeletePost = async () => {
    if (confirm("Bạn có chắc muốn xóa bài viết này?")) {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        const response = await axios.delete(
        `${BASEURL}/api/post/delete/${post._id}?userId=${userId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
        }
      );

        if (response.status !== 200) throw new Error('Xóa bài viết thất bại');
        alert("Bài viết đã được xóa thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa bài viết:", error);
        alert("Có lỗi xảy ra khi xóa bài viết. Vui lòng thử lại sau.");
      }
    }
  }

  return (
    <div
      key={post._id}
      className="bg-white border border-blue-100 rounded-lg p-4 mb-5 shadow-sm w-full max-w-2xl mx-auto"
    >
      {/* Popup chỉnh sửa */}
      {isEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <PostUpdate
            _id={post._id}
            userid={post.userId}
            content={post.text}
            files={post.attachments || []}
            userData={userData || undefined}
            onClose={handleCloseEdit}
          />
        </div>
      )}

      <div className="flex items-center mb-3">
        <Image
          src={userData?.avatar_link || '/schoolimg.jpg'}
          alt="User Avatar"
          className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 mr-3 flex items-center justify-center text-white font-semibold text-sm shadow"
          width={36}
          height={36}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/schoolimg.jpg';
          }}
        />
        <div className="min-w-0">
          <div className="font-semibold text-blue-900 truncate">{userData?.username || "User"}</div>
          <div className="text-xs text-blue-400">{formatTime(post.createdAt)}</div>
        </div>
        <div className="ml-auto shrink-0">
          {userId && userId === post.userId && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full hover:bg-blue-50 text-blue-400 transition-colors">
                  <MoreVertical size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-48 z-50"
                sideOffset={4}
                avoidCollisions={true}
                style={{ 
                  right: 10,
                  position: 'fixed',
                  zIndex: 9999
                }}
              >
                <>
                  <DropdownMenuItem 
                    onClick={() => setIsEditModal(true)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <span>✏️</span>
                    Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleDeletePost}
                    className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <span>🗑️</span>
                    Xóa
                  </DropdownMenuItem>
                </>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      {post.text && (
        <div className="text-gray-800 mb-3 leading-relaxed">{post.text}</div>
      )}
      {post.attachments && post.attachments.length > 0 && (
        <div className="mb-3 space-y-3">
          {post.attachments.map((attachment, index) => {
            const file = attachment.file || attachment;
            if (file.filetype === "image" || file.mimetype?.startsWith("image/")) {
              return (
                <div key={index} className="mb-3">
                  <Image
                    src={file.url || "/default-image.png"}
                    alt="Hình ảnh đăng tải"
                    width={640}
                    height={640}
                    className="rounded-lg max-h-96 w-full object-cover border border-blue-100"
                    style={{ maxHeight: 384, width: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              );
            } else if (file.filetype === "video" || file.mimetype?.startsWith("video/")) {
              return (
                <div key={index} className="mb-3">
                  <video
                    controls
                    className="rounded-lg max-h-96 w-full border border-blue-100"
                    onError={(e) => {
                      (e.target as HTMLVideoElement).style.display = "none";
                    }}
                  >
                    <source src={file.url} type={file.mimetype} />
                    Trình duyệt của bạn không hỗ trợ video.
                  </video>
                </div>
              );
            } else {
              return (
                <div key={index} className="mb-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (file.url && file.filename && file.mimetype && file.filetype) {
                        downloadFileFromObject({
                          file: {
                            url: file.url,
                            filename: file.filename,
                            mimetype: file.mimetype,
                            filetype: file.filetype,
                          }
                        });
                      } else {
                        alert("File đính kèm không hợp lệ!");
                      }
                    }}
                    className="inline-flex items-center px-3 py-2 bg-blue-50 rounded-lg hover:bg-blue-100 text-blue-700 text-sm transition-colors duration-200 border border-blue-200"
                  >
                    {file.filename + " "  + file.filetype || "Tài liệu đính kèm"}
                  </button>
                </div>
              );
            }
          })}
        </div>
      )}
      {/* Hiển thị người đã thích */}
      {post.likes && post.likes.length > 0 && (
        <div className="flex items-center mb-2">
          <span className="flex items-center text-blue-600 text-sm font-medium">
            <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center mr-1 text-xs">👍</span>
            {post.likes.length} người đã thích
          </span>
        </div>
      )}
      {/* Nút bấm giống Facebook */}
      <div className="flex justify-between border-t border-blue-100 pt-2 mt-2">
        <button
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded hover:bg-blue-50 transition-colors text-gray-700 font-semibold text-base"
        >
          <span role="img" aria-label="like">👍</span> Thích
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded hover:bg-blue-50 transition-colors text-gray-700 font-semibold text-base"
        >
          <span role="img" aria-label="comment">💬</span> Bình luận
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded hover:bg-blue-50 transition-colors text-gray-700 font-semibold text-base"
        >
          <span role="img" aria-label="share">📤</span> Chia sẻ
        </button>
      </div>
    </div>
  );
};

export default RenderPost;