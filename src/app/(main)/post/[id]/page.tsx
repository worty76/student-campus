"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { BASEURL } from "@/app/constants/url";
import { useWebSocket } from "@/app/context/websocket.contex";
import { Button } from "@/components/ui/button";
import NavigationBar from "../../layouts/navbar";
import { useParams } from "next/navigation";



interface FileAttachment {
    url: string;
    filename: string;
    mimetype: string;
    filetype: string;
}

interface Attachment {
    file?: FileAttachment;
    url?: string;
    filename?: string;
    mimetype?: string;
    filetype?: string;
}

interface UserdataProps {
    _id: string;
    username: string;
    avatar_link?: string;
}

interface userInfo {
    _id: string;
    username: string;
    avatar_link: string;
}

interface Comments {
    userinfo: userInfo;
    context: string;
}

interface Post {
    _id: string;
    userId: UserdataProps; // Sửa lại: userId là object
    text: string;
    attachments: Attachment[];
    createdAt: string;
    likes: string[]; // Nếu API trả về mảng lồng, cần flatten ở dưới
    comments: Comments[];
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

const PostPage: React.FC = () => {
    const [post, setPost] = useState<Post | null>(null);
    const [likes, setLikes] = useState<string[]>([]);
    const [isLiked, setIsLiked] = useState(false);
    const [userId, setUserId] = useState("");
    const [comments, setComments] = useState<Comments[]>([]);
    const [commentInput, setCommentInput] = useState("");
    const [isLoadingTimeout, setIsLoadingTimeout] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [postNotFound, setPostNotFound] = useState(false);
    const { sendMessage } = useWebSocket();
    const params = useParams();
    const postIdFromUrl = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

    const getPostData = async (token: string, postId: string) => {
        try {
            setIsLoading(true);
            const res = await axios.get(`${BASEURL}/api/get/post/${postId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // Flatten likes nếu là mảng lồng
            let likesArr = res.data.post.likes;
            if (Array.isArray(likesArr) && Array.isArray(likesArr[0])) {
                likesArr = likesArr.flat();
            }
            setPost(res.data.post);
            setLikes(likesArr || []);
            setComments(res.data.post.comments || []);
            setPostNotFound(false);
        } catch (error) {
            console.log(error)
            setPost(null);
            setPostNotFound(true);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/login";
        }
      }, []);
    // Lấy postId từ URL (Next.js app router)
    useEffect(() => {
        if (!postIdFromUrl) return;

        const token = localStorage.getItem("token") || "";
        
        // Set timeout for 5 seconds
        const timeoutId = setTimeout(() => {
            setIsLoadingTimeout(true);
        }, 5000);

        getPostData(token, postIdFromUrl)
            .finally(() => {
                clearTimeout(timeoutId);
            });

        return () => clearTimeout(timeoutId);
    }, [postIdFromUrl]);

    useEffect(() => {
        const id = localStorage.getItem("userId") || "";
        setUserId(id);
        if (post && Array.isArray(post.likes) && id) {
            setIsLiked(post.likes.includes(id));
        }
    }, [post]);

    useEffect(() => {
        if (userId) setIsLiked(likes.includes(userId));
    }, [likes, userId]);

    const handleLike = () => {
        if (!userId || !post) return;
        if (!likes.includes(userId)) {
            setLikes([...likes, userId]);
            setIsLiked(true);
            sendMessage({
                type: "likes_post",
                from: userId,
                to: post.userId?._id || "",
                postid: post._id,
                fromName: post.userId?.username || "User",
            });
        }
    };

    const handleUnlike = () => {
        if (!userId || !post) return;
        setLikes(likes.filter((id) => id !== userId));
        setIsLiked(false);
        sendMessage({
            type: "unlike_post",
            from: userId,
            to: post.userId?._id || "",
            postid: post._id,
        });
    };

    const handleAddComment = () => {
        if (!commentInput.trim() || !userId || !post) return;
        const currentUserData = localStorage.getItem("userdata");
        let username = "User";
        let avatar_link = "/schoolimg.jpg";
        if (currentUserData) {
            try {
                const parsed = JSON.parse(currentUserData);
                if (parsed.username) username = parsed.username;
                if (parsed.avatar_link) avatar_link = parsed.avatar_link;
            } catch {}
        }
        const newComment: Comments = {
            userinfo: {
                _id: userId,
                username,
                avatar_link,
            },
            context: commentInput.trim(),
        };
        setComments([...comments, newComment]);
        setCommentInput("");
        sendMessage({
            type: "Comment",
            from: userId,
            to: post.userId?._id || "",
            postid: post._id,
            context: commentInput,
        });
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
                    <div className="mb-6">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0694FA] mx-auto"></div>
                    </div>
                    <h2 className="text-xl font-semibold text-[#1E293B] mb-2">Đang tải bài viết...</h2>
                    <p className="text-gray-500">Vui lòng chờ trong giây lát</p>
                </div>
            </div>
        );
    }

    if (postNotFound || (isLoadingTimeout && !post)) {
        return (
            <div className="min-h-screen bg-[#F1F1E6] flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
                    <div className="mb-4">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-[#1E293B] mb-2">Bài viết không tồn tại</h2>
                    <p className="text-gray-500 mb-6">Bài viết này có thể đã bị xóa hoặc không tồn tại</p>
                    <button 
                        onClick={() => window.history.back()}
                        className="bg-[#0694FA] text-white px-6 py-2 rounded-xl hover:bg-[#1E293B] transition-colors duration-300"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-[#F1F1E6] flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
                    <div className="mb-6">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0694FA] mx-auto"></div>
                    </div>
                    <h2 className="text-xl font-semibold text-[#1E293B] mb-2">Đang tải bài viết...</h2>
                    <p className="text-gray-500">Vui lòng chờ trong giây lát</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <NavigationBar />
            <div className="max-w-7xl mx-auto pt-[8vh] pb-6 px-4">
                {/* Main Container with Post and Comments */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[75vh] max-h-[90vh]">
                        {/* Post Content Section */}
                        <div className="lg:col-span-2 p-5 border-r border-gray-100 overflow-y-auto max-h-[90vh]">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <Image
                                            src={post.userId?.avatar_link || "/schoolimg.jpg"}
                                            alt="User Avatar"
                                            width={48}
                                            height={48}
                                            className="w-12 h-12 rounded-full object-cover ring-3 ring-blue-100 transition-transform duration-200 hover:scale-105"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = "/schoolimg.jpg";
                                            }}
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white"></div>
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-base text-gray-900 hover:text-blue-600 transition-colors duration-200 cursor-pointer">
                                            {post.userId?.username || "User"}
                                        </h2>
                                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                                            <span>🕒</span>
                                            <span>{formatTime(post.createdAt)}</span>
                                            <span>•</span>
                                           
                                        </div>
                                    </div>
                                </div>
                                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
                                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                                    </svg>
                                </button>
                            </div>

                            {/* Post Text Content */}
                            {post.text && (
                                <div className="mb-5 text-gray-800 leading-relaxed text-base">
                                    {post.text}
                                </div>
                            )}

                            {/* Attachments */}
                            {post.attachments && post.attachments.length > 0 && (
                                <div className="mb-5 rounded-xl overflow-hidden">
                                    {post.attachments.map((attachment, idx) => {
                                        const file = attachment.file || attachment;
                                        if (file.filetype === "image" || file.mimetype?.startsWith("image/")) {
                                            return (
                                                <div key={idx} className="relative group cursor-pointer">
                                                    <Image
                                                        src={file.url || "/default-image.png"}
                                                        alt="Attachment"
                                                        width={800}
                                                        height={500}
                                                        className="rounded-xl w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                                        style={{ maxHeight: 450 }}
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = "/schoolimg.jpg";
                                                        }}
                                                    />
                                                  
                                                      
                                                   
                                                </div>
                                            );
                                        } else if (file.filetype === "video" || file.mimetype?.startsWith("video/")) {
                                            return (
                                                <video
                                                    key={idx}
                                                    controls
                                                    className="rounded-xl w-full shadow-lg"
                                                    style={{ maxHeight: 450 }}
                                                    onError={(e) => {
                                                        (e.target as HTMLVideoElement).style.display = "none";
                                                    }}
                                                >
                                                    <source src={file.url} type={file.mimetype} />
                                                    Trình duyệt của bạn không hỗ trợ video.
                                                </video>
                                            );
                                        } else {
                                            return (
                                                <div key={idx} className="mb-3">
                                                    <a
                                                        href={file.url}
                                                        download={file.filename}
                                                        className="inline-flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 text-blue-700 border border-blue-200 transition-all duration-200 hover:shadow-md"
                                                    >
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="font-medium">{file.filename || "Tài liệu đính kèm"}</span>
                                                    </a>
                                                </div>
                                            );
                                        }
                                    })}
                                </div>
                            )}

                            {/* Engagement Stats */}
                            <div className="py-4 border-t border-gray-50">
                                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                    <div className="flex items-center space-x-4">
                                        <span className="flex items-center space-x-2 hover:text-blue-600 transition-colors duration-200 cursor-pointer">
                                            <div className="flhover:text-blue-600 transition-colors duration-200 font-mediumex -space-x-1">
                                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs border-2 border-white">👍</div>
                                                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs border-2 border-white">❤️</div>
                                            </div>
                                            <span className="font-medium">{likes.length} lượt thích</span>
                                        </span>
                                        <span className="hover:text-blue-600 transition-colors duration-200 cursor-pointer">
                                            {comments.length} bình luận
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons - Removed Share Button */}
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        className={`flex items-center justify-center space-x-2 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 ${
                                            isLiked 
                                                ? "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100" 
                                                : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                                        }`}
                                        onClick={isLiked ? handleUnlike : handleLike}
                                    >
                                        <span className={`text-lg ${isLiked ? '💙' : '🤍'}`}>
                                            {isLiked ? '💙' : '🤍'}
                                        </span>
                                        <span>{isLiked ? "Đã thích" : "Thích"}</span>
                                    </Button>
                                    <Button className="flex items-center justify-center space-x-2 py-2 rounded-xl font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition-all duration-200 transform hover:scale-105" disabled>
                                        <span className="text-lg">💬</span>
                                        <span>Bình luận</span>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Comments Section - Right Side */}
                        <div className="lg:col-span-1 flex flex-col max-h-[90vh]">
                            {/* Comments Header */}
                            <div className="p-4 border-b border-gray-100 bg-gray-50">
                                <h3 className="font-semibold text-gray-900 flex items-center space-x-2 text-sm">
                                    <span className="text-lg">💬</span>
                                    <span>Bình luận ({comments.length})</span>
                                </h3>
                            </div>

                            {/* Comments List */}
                            <div className="flex-1 overflow-y-auto max-h-[65vh] p-4">
                                {comments.length === 0 ? (
                                    <div className="text-center py-6">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-500 font-medium text-sm">Chưa có bình luận</p>
                                        <p className="text-gray-400 text-xs mt-1">Hãy là người đầu tiên!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {comments.map((cmt, idx) => (
                                            <div key={idx} className="group hover:bg-gray-50 rounded-lg p-2 transition-colors duration-200">
                                                <div className="flex items-start space-x-2">
                                                    <Image
                                                        src={cmt.userinfo?.avatar_link || "/schoolimg.jpg"}
                                                        alt="User Avatar"
                                                        width={28}
                                                        height={28}
                                                        className="w-7 h-7 rounded-full object-cover ring-1 ring-gray-100"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = "/schoolimg.jpg";
                                                        }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="bg-gray-100 rounded-xl px-2 py-1">
                                                            <div className="font-semibold text-gray-900 text-xs mb-1">
                                                                {cmt.userinfo.username || "User"}
                                                            </div>
                                                            <div className="text-gray-800 text-xs leading-relaxed break-words">
                                                                {cmt.context || ""}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                                                         
                                                       
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Comment Input */}
                            <div className="p-4 border-t border-gray-100 bg-gray-50">
                                <div className="flex space-x-2">
                                    <Image
                                        src="/schoolimg.jpg"
                                        alt="Your Avatar"
                                        width={32}
                                        height={32}
                                        className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-100"
                                    />
                                    <div className="flex-1 space-y-2">
                                        <input
                                            type="text"
                                            className="w-full bg-white border border-gray-200 rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            placeholder="Viết bình luận..."
                                            value={commentInput}
                                            onChange={(e) => setCommentInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleAddComment();
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            className={`w-full py-1 rounded-full font-medium transition-all duration-200 text-xs ${
                                                commentInput.trim() 
                                                    ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md" 
                                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                            }`}
                                            onClick={handleAddComment}
                                            disabled={!commentInput.trim()}
                                        >
                                            Gửi bình luận
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostPage;