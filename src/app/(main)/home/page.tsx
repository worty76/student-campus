"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NavigationBar from "@/app/layouts/navbar";
import BubbleChat from "@/components/chat/bubble";
import PostAdd from "@/components/home/postadd";
import Image from "next/image";
// Dummy user info
const userInfo = {
  name: "Nguyễn Văn A",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  email: "vana@student.edu.vn",
  major: "Công nghệ thông tin",
  year: "Năm 3",
};

const dummyPosts = [
  {
    id: 1,
    author: "Alice",
    content: "Chào mọi người!",
    time: "2 phút trước",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    author: "Bob",
    content: "Đây là video học nhóm hôm qua!",
    time: "10 phút trước",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
  {
    id: 3,
    author: "Lan",
    content: "Mình chia sẻ file tài liệu Toán nhé!",
    time: "20 phút trước",
    file: {
      name: "BaiTapToan.pdf",
      url: "#",
    },
  },
];

const onlineFriends = ["Minh", "Lan", "Hùng", "Trang"];

const HomePage = () => {
  const [postContent, setPostContent] = useState("");
  const [posts] = useState(dummyPosts);
   const [chatFriend, setChatFriend] = useState<string | null>(null);
   const [isAddmodalopen,setisAddmodalopen] = useState(false)
  // const handlePost = () => {
  //   if (!postContent.trim()) return;

  //   let processedContent = postContent;
  //   const newPost  = {
  //     id: Date.now(),
  //     author: "Bạn",
  //     content: processedContent,
  //     time: "Vừa xong",
  //   };

  //   // Check for image ![alt](url)
  //   const imageMatch = postContent.match(/!\[.*?\]\((.*?)\)/);
  //   if (imageMatch) {
  //     newPost.image = imageMatch[1];
  //     processedContent = processedContent.replace(/!\[.*?\]\(.*?\)/, '').trim();
  //   }

  //   // Check for video [video](url)
  //   const videoMatch = postContent.match(/\[video\]\((.*?)\)/);
  //   if (videoMatch) {
  //     newPost.video = videoMatch[1];
  //     processedContent = processedContent.replace(/\[video\]\(.*?\)/, '').trim();
  //   }

  //   // Check for file [file name](url)
  //   const fileMatch = postContent.match(/\[file\s+(.*?)\]\((.*?)\)/);
  //   if (fileMatch) {
  //     newPost.file = {
  //       name: fileMatch[1],
  //       url: fileMatch[2],
  //     };
  //     processedContent = processedContent.replace(/\[file\s+.*?\]\(.*?\)/, '').trim();
  //   }

  //   newPost.content = processedContent;
  //   setPosts([newPost, ...posts]);
  //   setPostContent("");
  // };

  // const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (e.key === 'Enter' && !e.shiftKey) {
  //     e.preventDefault();
  //     handlePost();
  //   }
  // };

  return (
    <div className="bg-gradient-to-br from-blue-100 to-blue-300 min-h-screen pb-20 flex flex-col items-center relative overflow-x-hidden">
      {/* Decorative blue gradient top left */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-60 -z-10" />
      {/* Decorative blue bar top */}
      <div className="w-full h-2 bg-gradient-to-r from-blue-400 via-blue-300 to-blue-100 mb-2" />
      <NavigationBar />
      <div className="flex flex-col absolute top-[5vh]  items-center w-full">
      
        <div className="flex flex-col md:flex-row justify-center items-start gap-8 w-full max-w-7xl mt-8">
          {/* User Info */}
          <div className="w-full md:w-74  flex-shrink-0  justify-center">
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
                  // onKeyPress={handleKeyPress}
                  className="mb-2 border-blue-200 focus:ring-blue-400"
                />
                <div className="text-xs text-blue-500 mb-2">
                  Hướng dẫn: ![mô tả](link-ảnh) cho ảnh, [video](link-video) cho video, [file tên-file](link-file) cho tài liệu
                </div>
              </div>
              <Button
                onClick={()=>setisAddmodalopen(true)}
               
                className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600"
              >
                Đăng bài
              </Button>
            </div>

            {/* Posts */}
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white border border-blue-100 rounded-lg p-4 mb-5 shadow-sm w-full max-w-2xl mx-auto"
              >
                <div className="flex items-center mb-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 mr-3 flex items-center justify-center text-white font-semibold text-sm shadow">
                    {post.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-blue-900">{post.author}</div>
                    <div className="text-xs text-blue-400">{post.time}</div>
                  </div>
                </div>

                {post.content && (
                  <div className="text-gray-800 mb-3 leading-relaxed">{post.content}</div>
                )}

                {post.image && (
                  <div className="mb-3">
                     <Image
                      src={'/schoolimg.jpg'}
                      alt="Hình ảnh đăng tải"
                      width={800}
                      height={400}
                      className="rounded-lg max-h-96 w-full object-cover border border-blue-100"
                      style={{ maxHeight: 384, width: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {post.video && (
                  <div className="mb-3">
                    <video
                      controls
                      className="rounded-lg max-h-96 w-full border border-blue-100"
                      onError={(e) => {
                        (e.target as HTMLVideoElement).style.display = 'none';
                      }}
                    >
                      <source src={post.video} type="video/mp4" />
                      Trình duyệt của bạn không hỗ trợ video.
                    </video>
                  </div>
                )}

                {post.file && (
                  <div className="mb-2">
                    <a
                      href={post.file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 bg-blue-50 rounded-lg hover:bg-blue-100 text-blue-700 text-sm transition-colors duration-200 border border-blue-200"
                      onClick={(e) => {
                        if (post.file.url === '#') {
                          e.preventDefault();
                          alert('Đây là file demo - không có link thực tế');
                        }
                      }}
                    >
                      <span className="mr-2">📄</span>
                      {post.file.name}
                    </a>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-4 pt-3 border-t border-blue-100">
                  <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors text-sm">
                    <span>👍</span> Thích
                  </button>
                  <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors text-sm">
                    <span>💬</span> Bình luận
                  </button>
                  <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors text-sm">
                    <span>📤</span> Chia sẻ
                  </button>
                </div>
              </div>
            ))}
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
        {isAddmodalopen === true && (
            <PostAdd name={userInfo.name} onClose={() => setisAddmodalopen(false)} />
        )}
      {/* Decorative blue bar bottom */}
      <div className="fixed left-0 bottom-0 w-full bg-gradient-to-r from-blue-400 via-blue-300 to-blue-100 h-2 z-40" />

      {/* Bottom Menu */}
      
    </div>
  );
};

export default HomePage;