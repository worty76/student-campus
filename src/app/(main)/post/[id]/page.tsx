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
    const { sendMessage } = useWebSocket();
    const params = useParams();
    const postIdFromUrl = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

    const getPostData = async (token: string, postId: string) => {
        try {
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
        } catch (error) {
            console.log(error)
            setPost(null);
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

        // Nếu cần token, lấy từ localStorage
        const token = localStorage.getItem("token") || "";
        getPostData(token, postIdFromUrl);
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

    if (!post) {
        return (
            <div className="w-full max-w-2xl mx-auto mt-10 text-center text-gray-500">
                Đang tải bài viết...
            </div>
        );
    }

    return (
        <div className="w-full max-w-3xl mx-auto mt-[10vh] bg-white border border-blue-100 rounded-lg p-6 shadow">
            <NavigationBar />
            <div className="flex items-center top-[5vh] mb-4">
                <Image
                    src={post.userId?.avatar_link || "/schoolimg.jpg"}
                    alt="User Avatar"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full bg-blue-100 object-cover mr-3"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = "/schoolimg.jpg";
                    }}
                />
                <div>
                    <div className="font-semibold text-blue-900">{post.userId?.username || "User"}</div>
                    <div className="text-xs text-blue-400">{formatTime(post.createdAt)}</div>
                </div>
            </div>
            {post.text && <div className="mb-4 text-gray-800">{post.text}</div>}
            {post.attachments && post.attachments.length > 0 && (
                <div className="mb-4">
                    {post.attachments.map((attachment, idx) => {
                        const file = attachment.file || attachment;
                        if (file.filetype === "image" || file.mimetype?.startsWith("image/")) {
                            return (
                                <Image
                                    key={idx}
                                    src={file.url || "/default-image.png"}
                                    alt="Attachment"
                                    width={640}
                                    height={400}
                                    className="rounded-lg mb-2 w-full object-cover border border-blue-100"
                                    style={{ maxHeight: 384 }}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = "none";
                                    }}
                                />
                            );
                        } else if (file.filetype === "video" || file.mimetype?.startsWith("video/")) {
                            return (
                                <video
                                    key={idx}
                                    controls
                                    className="rounded-lg mb-2 w-full border border-blue-100"
                                    style={{ maxHeight: 384 }}
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
                                <div key={idx} className="mb-2">
                                    <a
                                        href={file.url}
                                        download={file.filename}
                                        className="inline-block px-3 py-2 bg-blue-50 rounded hover:bg-blue-100 text-blue-700 text-sm border border-blue-200"
                                    >
                                        {file.filename || "Tài liệu đính kèm"}
                                    </a>
                                </div>
                            );
                        }
                    })}
                </div>
            )}
            <div className="flex items-center mb-2">
                <span className="flex items-center text-blue-600 text-sm font-medium">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center mr-1 text-xs">👍</span>
                    {likes.length} người đã thích
                </span>
            </div>
            <div className="flex gap-2 mb-4">
                <Button
                    className={`flex-1 ${isLiked ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-700"}`}
                    onClick={isLiked ? handleUnlike : handleLike}
                >
                    {isLiked ? "💙 Đã thích" : "🤍 Thích"}
                </Button>
                <Button className="flex-1 bg-gray-50 text-gray-700" disabled>
                    <span className="inline-block bg-blue-100 text-blue-600 rounded-full px-2 py-0.5 text-xs font-bold">
                        {comments.length}
                    </span>
                    <span className="ml-2">💬 Bình luận</span>
                </Button>
                <Button
                    className="flex-1 bg-gray-50 text-blue-700 hover:bg-blue-50"
                    type="button"
                    onClick={() => {
                     
                    }}
                >
                    🔗 Chia sẻ
                </Button>
            </div>
            <div className="border-t border-blue-100 pt-4">
                <div className="mb-3">
                    {comments.length === 0 && (
                        <div className="text-gray-400 text-sm">Chưa có bình luận nào.</div>
                    )}
                    {comments.map((cmt, idx) => (
                        <div key={idx} className="mb-2 flex items-start gap-2">
                            <Image
                                src={cmt.userinfo?.avatar_link || "/schoolimg.jpg"}
                                alt="User Avatar"
                                width={28}
                                height={28}
                                className="w-7 h-7 rounded-full bg-blue-100 object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/schoolimg.jpg";
                                }}
                            />
                            <div>
                                <div className="flex flex-col bg-blue-50 rounded-lg px-3 py-2">
                                    <span className="font-semibold text-blue-900 text-sm">{cmt.userinfo.username || "User"}</span>
                                    <span className="text-gray-800 text-sm">{cmt.context || ""}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 border border-blue-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                        placeholder="Viết bình luận..."
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddComment();
                        }}
                    />
                    <Button
                        type="button"
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={handleAddComment}
                    >
                        Gửi
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PostPage;