import React, { useState, useEffect } from "react";
import downloadFileFromObject from "@/app/helper/file_handler";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import axios from "axios";
import { BASEURL } from "@/app/constants/url";
import { useWebSocket } from "@/app/context/websocket.contex";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"; // Thêm dòng này

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
  userInfo: userInfo;
  createdAt: string;
  likes: string[];
  comments: Comments[];
}

interface Attachment {
  file?: FileAttachment;
  url?: string;
  filename?: string;
  mimetype?: string;
  filetype?: string;
}

interface Comments {
  userinfo: userInfo;
  context: string;
}
interface userInfo {
  _id: string;
  username: string;
  avatar_link: string;
}

const formatTime = (createdAt: string): string => {
  const now = new Date();
  const postTime = new Date(createdAt);
  const diffInMinutes = Math.floor(
    (now.getTime() - postTime.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "Vừa xong";
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  if (diffInMinutes < 1440)
    return `${Math.floor(diffInMinutes / 60)} giờ trước`;
  return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
};

// Thay đổi props của RenderPost:
interface RenderPostProps {
  post: Post;
  onDelete?: (postId: string) => void;
  onEdit?: (postData: { _id: string; userId: string; content: string; files: Attachment[]; userInfo: userInfo }) => void;
}

// Sửa lại khai báo component:
const RenderPost: React.FC<RenderPostProps> = ({
  post,
  onDelete,
  onEdit,
}) => {
  const [likes, setLikes] = useState<string[]>(
    Array.isArray(post.likes) ? post.likes : []
  );
  const [userId, setUserId] = useState<string>("");
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState<Comments[]>(post.comments || []);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const { sendMessage } = useWebSocket();

  useEffect(() => {
    const id = localStorage.getItem("userId") || "";
    setUserId(id);
    // Kiểm tra luôn khi mount
    if (Array.isArray(post.likes) && id) {
      setIsLiked(post.likes.includes(id));
    }
  }, [post.likes]);

  useEffect(() => {
    if (userId) {
      setIsLiked(likes.includes(userId));
    }
  }, [likes, userId]);

  const handleEditPost = () => {
    if (onEdit) {
      onEdit({
        _id: post._id,
        userId: post.userId,
        content: post.text,
        files: post.attachments || [],
        userInfo: post.userInfo
      });
    }
  };

  const handleLikePost = () => {
    try {
      const currentUserData = localStorage.getItem("userdata");
      let username = "User";
      console.log(currentUserData);
      if (currentUserData) {
        try {
          const parsed = JSON.parse(currentUserData);
          if (parsed.username) {
            username = parsed.username;
          }
        } catch (e) {
          console.log(e);
        }
      }
      const fromid = userId;
      const toid = post.userInfo?._id;

      sendMessage({
        type: "likes_post",
        from: fromid || "123",
        to: toid || "123",
        postid: post._id || "123",
        fromName: username,
      });

      if (userId && !likes.includes(userId)) {
        const newLikes = [...likes, userId];
        setLikes(newLikes);
        setIsLiked(true);
      }
    } catch (err) {
      console.error("Gửi like thất bại:", err);
      alert("Lỗi khi gửi like.");
    }
  };

  const handleUnLikePost = () => {
    try {
      const fromid = userId;
      const toid = post.userInfo?._id;
      sendMessage({
        type: "unlike_post",
        from: fromid || "123",
        to: toid || "123",
        postid: post._id || "123",
      });

      if (userId && likes.includes(userId)) {
        const newLikes = likes.filter((id) => id !== userId);
        setLikes(newLikes);
        setIsLiked(false);
      }
    } catch (err) {
      console.error("Gửi unlike thất bại:", err);
      alert("Lỗi khi gửi unlike.");
    }
  };

  const handleDeletePost = async () => {
    setShowDeleteDialog(false);
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      const response = await axios.delete(
        `${BASEURL}/api/post/delete/${post._id}?userId=${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (response.status !== 200) throw new Error("Xóa bài viết thất bại");
      setDeleteSuccess(true);
      if (onDelete) onDelete(post._id); // Gọi callback reload list post
    } catch (error) {
      console.error("Lỗi khi xóa bài viết:", error);
      alert("Có lỗi xảy ra khi xóa bài viết. Vui lòng thử lại sau.");
    }
  };

  const handleAddComment = () => {
    if (commentInput.trim()) {
      const currentUserData = localStorage.getItem("userdata");
      let username = "User";
      let avatar_link = "/schoolimg.jpg";
      console.log(currentUserData);
      if (currentUserData) {
        try {
          const parsed = JSON.parse(currentUserData);
          if (parsed.username) {
            username = parsed.username;
          }
          if (parsed.avatar_link) {
            avatar_link = parsed.avatar_link;
          }
        } catch (e) {
          console.log(e);
        }
      }
      setComments([
        ...comments,
        {
          userinfo: {
            _id: userId || "",
            username,
            avatar_link,
          },
          context: commentInput.trim(),
        },
      ]);
      setCommentInput("");
      try {
        const fromid = userId;
        const toid = post.userInfo?._id;
        sendMessage({
          type: "Comment",
          from: fromid || "123",
          to: toid || "123",
          postid: post._id || "123",
          context: commentInput,
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div
      key={post._id}
      className="bg-white/90 backdrop-blur-sm border border-white/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg w-full max-w-2xl mx-auto transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group"
    >
      {/* Enhanced Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md rounded-3xl border-0 shadow-2xl">
          <DialogHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900 text-center">
              Xác nhận xóa bài đăng
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-center">
              Bạn có chắc chắn muốn xóa bài đăng này không? Hành động này không
              thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleDeletePost}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Xóa bài viết
            </button>
            <button
              onClick={() => setShowDeleteDialog(false)}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-300"
            >
              Hủy
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Success Dialog */}
      <Dialog open={deleteSuccess} onOpenChange={setDeleteSuccess}>
        <DialogContent className="max-w-md rounded-3xl border-0 shadow-2xl">
          <DialogHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <DialogTitle className="text-xl font-bold text-green-600 text-center">
              Đã xóa bài đăng
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-center">
              Bài đăng đã được xóa thành công.
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={() => setDeleteSuccess(false)}
            className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Đóng
          </button>
        </DialogContent>
      </Dialog>

      {/* Enhanced Post Header */}
      <div className="flex items-center mb-3 sm:mb-4">
        <div className="relative">
          <Image
            src={post.userInfo?.avatar_link || "/schoolimg.jpg"}
            alt="User Avatar"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 sm:ring-3 ring-blue-200 ring-offset-1 sm:ring-offset-2 ring-offset-white shadow-lg group-hover:ring-blue-300 transition-all duration-300"
            width={96}
            height={96}
            quality={90}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/schoolimg.jpg";
            }}
          />
        </div>

        <div className="ml-3 sm:ml-4 flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <div className="font-bold text-sm sm:text-base text-gray-900 truncate group-hover:text-blue-700 transition-colors duration-300">
              {post.userInfo?.username || "User"}
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-0.5 sm:mt-1">
            <div className="text-xs sm:text-sm text-gray-500">
              {formatTime(post.createdAt)}
            </div>
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
          </div>
        </div>

        <div className="ml-auto">
          {userId && userId === post.userId && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all duration-200 group-hover:bg-blue-50 group-hover:text-blue-600">
                  <MoreVertical size={18} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-52 z-50 rounded-2xl border-0 shadow-2xl bg-white/95 backdrop-blur-md"
                sideOffset={8}
                avoidCollisions={true}
              >
                <DropdownMenuItem
                  onClick={handleEditPost}
                  className="flex items-center gap-3 cursor-pointer px-4 py-3 hover:bg-blue-50 rounded-xl transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <span className="font-medium">Chỉnh sửa bài viết</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="flex items-center gap-3 cursor-pointer px-4 py-3 hover:bg-red-50 rounded-xl transition-colors text-red-600 focus:text-red-600"
                >
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </div>
                  <span className="font-medium">Xóa bài viết</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Enhanced Post Content */}
      {post.text && (
        <div className="text-gray-800 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base break-words">
          {post.text.length > 300 ? (
            <div>
              <span>{post.text.substring(0, 300)}...</span>
              <button className="text-blue-600 hover:text-blue-700 font-medium ml-2 hover:underline text-sm sm:text-base">
                Xem thêm
              </button>
            </div>
          ) : (
            post.text
          )}
        </div>
      )}

      {/* Enhanced Attachments */}
      {post.attachments && post.attachments.length > 0 && (
        <div className="mb-6 space-y-3 sm:space-y-4">
          {post.attachments.map((attachment, index) => {
            const file = attachment.file || attachment;
            if (
              file.filetype === "image" ||
              file.mimetype?.startsWith("image/")
            ) {
              return (
                <div
                  key={index}
                  className="relative group overflow-hidden rounded-lg sm:rounded-2xl shadow-lg"
                >
                  <Image
                    src={file.url || "/default-image.png"}
                    alt="Hình ảnh đăng tải"
                    width={1280}
                    height={720}
                    quality={95}
                    className="w-full h-48 sm:h-64 md:h-80 lg:max-h-96 object-cover group-hover:scale-105 transition-transform duration-300"
                    style={{ width: "100%", objectFit: "cover" }}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            } else if (
              file.filetype === "video" ||
              file.mimetype?.startsWith("video/")
            ) {
              return (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-lg sm:rounded-2xl shadow-lg"
                >
                  <video
                    controls
                    className="w-full h-48 sm:h-64 md:h-80 lg:max-h-96 object-cover rounded-lg sm:rounded-2xl"
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
                <div key={index} className="group">
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        file.url &&
                        file.filename &&
                        file.mimetype &&
                        file.filetype
                      ) {
                        downloadFileFromObject({
                          file: {
                            url: file.url,
                            filename: file.filename,
                            mimetype: file.mimetype,
                            filetype: file.filetype,
                          },
                        });
                      } else {
                        alert("File đính kèm không hợp lệ!");
                      }
                    }}
                    className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 border border-blue-200 hover:border-blue-300 group-hover:shadow-md"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-sm sm:text-base text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                        {file.filename || "Tài liệu đính kèm"}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 capitalize">
                        {file.filetype || "File"}
                      </div>
                    </div>
                    <div className="text-blue-600 group-hover:text-blue-700">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </div>
                  </button>
                </div>
              );
            }
          })}
        </div>
      )}

      {/* Enhanced Likes Display */}
      {likes && likes.length > 0 && (
        <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              {/* Show heart reaction */}
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <span className="text-gray-700 font-medium">
              {likes.length === 1
                ? isLiked
                  ? "Bạn đã thích"
                  : "1 người đã thích"
                : likes.length === 2
                ? isLiked
                  ? `Bạn và 1 người khác đã thích`
                  : "2 người đã thích"
                : isLiked
                ? `Bạn và ${likes.length - 1} người khác đã thích`
                : `${likes.length} người đã thích`}
            </span>
          </div>

          {comments.length > 0 && (
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-gray-500 hover:text-blue-600 font-medium transition-colors"
            >
              {comments.length} bình luận
            </button>
          )}
        </div>
      )}

      {/* Enhanced Action Buttons */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-3 sm:pt-4 mt-3 sm:mt-4">
        <button
          className="flex-1 flex items-center justify-center gap-2 sm:gap-3 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base text-gray-700 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
          onClick={isLiked ? handleUnLikePost : handleLikePost}
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center transition-all duration-300">
            <svg
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${
                isLiked ? "text-red-500 scale-110" : "text-gray-400"
              }`}
              fill={isLiked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <span className="hidden sm:inline">
            {isLiked ? "Đã thích" : "Thích"}
          </span>
          <span className="sm:hidden">❤️</span>
        </button>

        <button
          className={`flex-1 flex items-center justify-center gap-2 sm:gap-3 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 ml-1 sm:ml-2 ${
            showComments
              ? "text-blue-600 bg-blue-50 shadow-md"
              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          }`}
          onClick={() => setShowComments((v) => !v)}
        >
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              showComments ? "bg-blue-100" : "bg-gray-100"
            }`}
          >
            <span className="text-base sm:text-lg">💬</span>
          </div>
          <span className="hidden sm:inline">Bình luận</span>
          <span className="sm:hidden">💬</span>
          {comments.length > 0 && (
            <span className="bg-blue-500 text-white rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-bold min-w-[16px] sm:min-w-[20px] h-4 sm:h-5 flex items-center justify-center">
              {comments.length}
            </span>
          )}
        </button>
      </div>

      {/* Enhanced Comments Section */}
      {showComments && (
        <div className="mt-4 sm:mt-6 border-t border-gray-100 pt-4 sm:pt-6 space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Comments List */}
          <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {comments.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <div className="text-gray-500 font-medium text-sm sm:text-base">
                  Chưa có bình luận nào
                </div>
                <div className="text-gray-400 text-xs sm:text-sm mt-1">
                  Hãy là người đầu tiên bình luận!
                </div>
              </div>
            ) : (
              comments.map((cmt, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 sm:gap-3 group animate-in fade-in slide-in-from-left-2 duration-300"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="relative flex-shrink-0">
                    <Image
                      src={cmt.userinfo?.avatar_link || "/schoolimg.jpg"}
                      alt="User Avatar"
                      width={72}
                      height={72}
                      quality={90}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-1 sm:ring-2 ring-gray-200 group-hover:ring-blue-300 transition-all duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/schoolimg.jpg";
                      }}
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-1 sm:border-2 border-white"></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 group-hover:bg-gray-100 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 transition-colors duration-300">
                      <div className="flex items-center space-x-2 mb-0.5 sm:mb-1">
                        <span className="font-semibold text-gray-900 text-xs sm:text-sm">
                          {cmt?.userinfo.username || "User"}
                        </span>
                      </div>
                      <p className="text-gray-800 text-xs sm:text-sm leading-relaxed break-words">
                        {cmt?.context || ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Enhanced Comment Input */}
          <div className="flex items-start gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-100">
            <div className="flex-shrink-0">
              <Image
                src={(function() {
                  const currentUserData = localStorage.getItem("userdata");
                  if (currentUserData) {
                    try {
                      const parsed = JSON.parse(currentUserData);
                      return parsed.avatar_link || "/schoolimg.jpg";
                    } catch {
                      return "/schoolimg.jpg";
                    }
                  }
                  return "/schoolimg.jpg";
                })()}
                alt="Your Avatar"
                width={72}
                height={72}
                quality={90}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/schoolimg.jpg";
                }}
              />
            </div>

            <div className="flex-1 space-y-3">
              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-gray-50 border-0 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:bg-white transition-all duration-300 placeholder-gray-500"
                  placeholder="Viết bình luận của bạn..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <button className="text-gray-400 hover:text-blue-500 transition-colors">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button className="text-gray-400 hover:text-blue-500 transition-colors p-2 rounded-full hover:bg-blue-50">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                  <button className="text-gray-400 hover:text-blue-500 transition-colors p-2 rounded-full hover:bg-blue-50">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      />
                    </svg>
                  </button>
                </div>

                <Button
                  type="button"
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                  onClick={handleAddComment}
                  disabled={!commentInput.trim()}
                >
                  Gửi
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RenderPost;
