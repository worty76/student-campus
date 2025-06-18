"use client";
import React, { useState ,useEffect} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NavigationBar from "@/app/(main)/layouts/navbar";
import BubbleChat from "@/components/chat/bubble";
import PostAdd from "@/components/home/postadd";
import Image from "next/image";

import axios from "axios";

// TypeScript interfaces for the post data
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

interface Post {
  _id: string;
  userId: string;
  text: string;
  attachments: Attachment[];
  createdAt: string;
  likes: string[];
  comments: string[];
}

const userInfo = {
  name: "Nguyễn Văn A",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  email: "vana@student.edu.vn",
  major: "Công nghệ thông tin",
  year: "Năm 3",
};

const onlineFriends = ["Minh", "Lan", "Hùng", "Trang"];

const HomePage = () => {

  const [postContent, setPostContent] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  
  const [chatFriend, setChatFriend] = useState<string | null>(null);
  const [isAddmodalopen, setisAddmodalopen] = useState(false);
  
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedId = localStorage.getItem('userId');
    if (storedId) {
      setUserId(storedId);
    }
  }, []);

  
  
  
  useEffect(() => {
    console.log("User ID:", userId);
    getpost();
   
  }, [userId]);
   
  const getpost = async() => {
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const response = await axios.get('http://localhost:3001/api/get/post',{
        headers:{
          Authorization: token ? `Bearer ${token}` : "",
        }
      });
      if (response.status === 200 && response.data.success) {
        const posts = response.data.posts;
        console.log('Random posts:', posts);
        setPosts(posts);
      } else {
        console.error('Failed to fetch posts:', response.data.message);
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching random posts:', error);
      setPosts([]);
    }
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

  // const getFileIcon = (filetype: string): string => {
  //   switch (filetype) {
  //     case 'image':
  //       return '🖼️';
  //     case 'txt':
  //       return '📄';
  //     case 'pdf':
  //       return '📋';
  //     case 'doc':
  //     case 'docx':
  //       return '📝';
  //     case 'video':
  //       return '🎥';
  //     default:
  //       return '📎';
  //   }
  // };

  return (
    <div className="bg-gradient-to-br from-blue-100 to-blue-300 min-h-screen pb-20 flex flex-col items-center relative overflow-x-hidden">
      {/* Decorative blue gradient top left */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-60 -z-10" />
      {/* Decorative blue bar top */}
      <div className="w-full h-2 bg-gradient-to-r from-blue-400 via-blue-300 to-blue-100 mb-2" />
      <NavigationBar />
      <div className="flex flex-col absolute top-[5vh] items-center w-full">
      
        <div className="flex flex-col md:flex-row justify-center items-start gap-8 w-full max-w-7xl mt-8">
          {/* User Info */}
          <div className="w-full md:w-74 flex-shrink-0 justify-center">
            <div className="bg-white border border-blue-200 rounded-lg p-6 shadow-md w-full max-w-xs flex flex-col items-center relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-2 bg-blue-200 rounded-full blur-sm" />
              <Image
                src={'/schoolimg.jpg'}
                alt={userInfo.name}
                width={80}
                height={80}
                className="w-20 h-20 rounded-full mb-3 object-cover border-4 border-blue-300 shadow"
              />
              <div className="font-semibold text-lg text-blue-800 mb-1">{userInfo.name}</div>
              <div className="text-sm text-gray-500 mb-2">{userInfo.email}</div>
            </div>

            <hr className="my-6 border-t border-gray-500 w-full" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-3">Community Groups</h4>
              <ul className="space-y-3">
                <li className="bg-blue-50 rounded-lg p-3 flex flex-col hover:bg-blue-100 transition-colors cursor-pointer">
                  <div className="flex items-center mb-1">
                    <span className="text-lg mr-2">🗨️</span>
                    <span className="font-semibold text-blue-800">IT Q&A</span>
                  </div>
                  <span className="text-xs text-gray-500">1.2k members • 32 new posts</span>
                  <span className="text-sm text-gray-700 mt-1">A place to discuss programming, software, hardware knowledge...</span>
                </li>
                <li className="bg-blue-50 rounded-lg p-3 flex flex-col hover:bg-blue-100 transition-colors cursor-pointer">
                  <div className="flex items-center mb-1">
                    <span className="text-lg mr-2">📚</span>
                    <span className="font-semibold text-blue-800">Study Materials</span>
                  </div>
                  <span className="text-xs text-gray-500">980 members • 12 new posts</span>
                  <span className="text-sm text-gray-700 mt-1">Share documents, books, and course outlines.</span>
                </li>
                <li className="bg-blue-50 rounded-lg p-3 flex flex-col hover:bg-blue-100 transition-colors cursor-pointer">
                  <div className="flex items-center mb-1">
                    <span className="text-lg mr-2">🎮</span>
                    <span className="font-semibold text-blue-800">Entertainment & Events</span>
                  </div>
                  <span className="text-xs text-gray-500">540 members • 5 new posts</span>
                  <span className="text-sm text-gray-700 mt-1">Updates on events, tournaments, and extracurricular activities.</span>
                </li>
                <li className="bg-blue-50 rounded-lg p-3 flex flex-col hover:bg-blue-100 transition-colors cursor-pointer">
                  <div className="flex items-center mb-1">
                    <span className="text-lg mr-2">💼</span>
                    <span className="font-semibold text-blue-800">Jobs & Internships</span>
                  </div>
                  <span className="text-xs text-gray-500">300 members • 2 new posts</span>
                  <span className="text-sm text-gray-700 mt-1">Recruitment info, internships, and interview experiences.</span>
                </li>
              </ul>
            </div>
            <hr className="my-6 border-t border-gray-500 w-full" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-3">About Website</h4>
              <ul className="space-y-3">
                <li className="bg-blue-50 rounded-lg p-3 flex flex-col hover:bg-blue-100 transition-colors cursor-pointer">
                  <div className="flex items-center mb-1">
                    <span className="text-lg mr-2">🗨️</span>
                    <span className="font-semibold text-blue-800">IT Q&A</span>
                  </div>
                </li>
                <li className="bg-blue-50 rounded-lg p-3 flex flex-col hover:bg-blue-100 transition-colors cursor-pointer">
                  <div className="flex items-center mb-1">
                    <span className="text-lg mr-2">🗨️</span>
                    <span className="font-semibold text-blue-800">IT Q&A</span>
                  </div>
                </li>
                <li className="bg-blue-50 rounded-lg p-3 flex flex-col hover:bg-blue-100 transition-colors cursor-pointer">
                  <div className="flex items-center mb-1">
                    <span className="text-lg mr-2">🗨️</span>
                    <span className="font-semibold text-blue-800">IT Q&A</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Main Feed */}
          <div className="w-full md:w-[1400px] flex flex-col items-center">
            {/* New Post */}
            <div className="bg-white border border-blue-100 rounded-lg p-4 mb-6 shadow-sm w-full max-w-2xl">
              <div className="mb-3">
                <Input
                  placeholder="Chia sẻ trạng thái, hình ảnh, file tài liệu..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="mb-2 border-blue-200 focus:ring-blue-400"
                />
                <div className="text-xs text-blue-500 mb-2">
                  Hướng dẫn: ![mô tả](link-ảnh) cho ảnh, [video](link-video) cho video, [file tên-file](link-file) cho tài liệu
                </div>
              </div>
              <Button
                onClick={() => setisAddmodalopen(true)}
                className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600"
              >
                Đăng bài
              </Button>
            </div>

            {/* Posts */}
            {posts.length === 0 ? (
              <div className="bg-white border border-blue-100 rounded-lg p-8 mb-5 shadow-sm w-full max-w-2xl mx-auto text-center">
                <div className="text-gray-500 text-lg mb-2">📝</div>
                <div className="text-gray-600">Chưa có bài viết nào</div>
                <div className="text-sm text-gray-400 mt-1">Hãy là người đầu tiên chia sẻ nội dung!</div>
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white border border-blue-100 rounded-lg p-4 mb-5 shadow-sm w-full max-w-2xl mx-auto"
                >
                  <div className="flex items-center mb-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 mr-3 flex items-center justify-center text-white font-semibold text-sm shadow">
                      U
                    </div>
                    <div>
                      <div className="font-semibold text-blue-900">User</div>
                      <div className="text-xs text-blue-400">{formatTime(post.createdAt)}</div>
                    </div>
                  </div>

                  {/* Post text content */}
                  {post.text && (
                    <div className="text-gray-800 mb-3 leading-relaxed">{post.text}</div>
                  )}

                  {/* Attachments */}
                  {post.attachments && post.attachments.length > 0 && (
                    <div className="mb-3 space-y-3">
                      {post.attachments.map((attachment, index) => {
                        // Handle both attachment structures
                        const file = attachment.file || attachment;
                        
                        if (file.filetype === 'image' || file.mimetype?.startsWith('image/')) {
                          return (
                            <div key={index} className="mb-3">
                              
                              <Image
                                src={file.url || '/default-image.png'}
                                alt="Hình ảnh đăng tải"
                                width={640}
                                height={640

                                }
                                className="rounded-lg max-h-96 w-full object-cover border border-blue-100"
                                style={{ maxHeight: 384, width: "100%", objectFit: "cover" }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          );
                        } else if (file.filetype === 'video' || file.mimetype?.startsWith('video/')) {
                          return (
                            <div key={index} className="mb-3">
                              <video
                                controls
                                className="rounded-lg max-h-96 w-full border border-blue-100"
                                onError={(e) => {
                                  (e.target as HTMLVideoElement).style.display = 'none';
                                }}
                              >
                                <source src={file.url} type={file.mimetype} />
                                Trình duyệt của bạn không hỗ trợ video.
                              </video>
                            </div>
                          );
                        } else {
                          // For other file types (documents, text files, etc.)
                          return (
                            <div key={index} className="mb-2">
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-2 bg-blue-50 rounded-lg hover:bg-blue-100 text-blue-700 text-sm transition-colors duration-200 border border-blue-200"
                              >
                                {/* <span className="mr-2">{getFileIcon(file.filetype)}</span> */}
                                {file.filename || 'Tài liệu đính kèm'}
                              </a>
                            </div>
                          );
                        }
                      })}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-4 pt-3 border-t border-blue-100">
                    <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors text-sm">
                      <span>👍</span> Thích ({post.likes?.length || 0})
                    </button>
                    <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors text-sm">
                      <span>💬</span> Bình luận ({post.comments?.length || 0})
                    </button>
                    <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors text-sm">
                      <span>📤</span> Chia sẻ
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Online Friends */}
          <div className="w-full md:w-[600px] justify-center">
            <div className="bg-white border border-blue-100 rounded-lg p-6 shadow-sm sticky top-8 w-full max-w-[1000px]">
              <h4 className="mb-4 font-semibold text-blue-900">Bạn bè online ({onlineFriends.length})</h4>
              <ul className="space-y-3">
                {onlineFriends.map((friend) => (
                  <li key={friend}
                   className="flex items-center hover:bg-blue-50 p-2 rounded-md transition-colors cursor-pointer"
                    onClick={() => setChatFriend(friend)}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 mr-3 flex items-center justify-center text-white font-semibold text-sm">
                      {friend.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-blue-900">{friend}</span>
                    <span className="text-green-500 ml-auto text-xs">●</span>
                  </li>
                ))}
              </ul>
            </div>
            <hr className="my-6 border-t border-gray-500 w-full" />
          </div>
        </div>
      </div>
      
      {chatFriend && (
        <BubbleChat
          name={chatFriend}
          status="Online"
        />
      )}
      
      {isAddmodalopen === true && userId && (
        <PostAdd
          _id={userId}
          name={userInfo.name}
          onClose={() => setisAddmodalopen(false)}
        />
      )}

      {/* Decorative blue bar bottom */}
      <div className="fixed left-0 bottom-0 w-full bg-gradient-to-r from-blue-400 via-blue-300 to-blue-100 h-2 z-40" />
    </div>
  );
};

export default HomePage;