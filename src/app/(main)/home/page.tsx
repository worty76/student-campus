"use client";
import React, { useState, useEffect } from "react";

import { Input } from "@/components/ui/input";
import NavigationBar from "@/app/(main)/layouts/navbar";
import BubbleChat from "@/components/chat/bubble";
import PostAdd from "@/components/home/postadd";
import Image from "next/image";
import { BASEURL } from "@/app/constants/url";
import axios from "axios";
import RenderPost from "@/components/home/post";

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
  userInfo: userInfo;
  comments: Comments[];
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

interface friends {
  _id: string;
  username: string;
  avatar_link?: string;
}
interface UserdataProps {
  id?: string;
  username: string;
  Year: string;
  Major: string;
  email: string;
  Faculty: string;
  avatar?: string;
  avatar_link?: string;
  friends?: friends[];
}

interface UserGroup {
  _id: string;
  name: string;
  creater: string;
  icon?: string;
  desc?: string;
  members: string[];
  posts: string[];
  createAt: string | Date;
  tags: string[];
}

const userInfo = {
  name: "Nguyễn Văn A",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  email: "vana@student.edu.vn",
  major: "Công nghệ thông tin",
  year: "Năm 3",
};

const HomePage = () => {
  const [postContent, setPostContent] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [userData, setUserData] = useState<UserdataProps | null>(null);
  const [chatFriend] = useState<string | null>(null);
  const [isAddmodalopen, setisAddmodalopen] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
   

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
 
 
    const storedId = localStorage.getItem("userId");
    if (storedId) {
      setUserId(storedId);
      getpost(1, false);
      getUserData();
      getUsersGroupData();
    }
  }, []);


  const getpost = async (pageNum = 1, append = false) => {
    try {
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");
      const storedId = localStorage.getItem("userId");

      if (!storedId || storedId === "null") {
        setPosts([]);
        return;
      }

      setLoading(true);
      const response = await axios.get(
        `${BASEURL}/api/get/personal/feed/${storedId}?page=${pageNum}&limit=10`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        const newPosts = response.data.posts;
        setHasMore(response.data.hasMore);
        if (append) {
          setPosts((prev) => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }
      } else {
        setHasMore(false);
        if (!append) setPosts([]);
      }
    } catch (error) {
      console.log("Error fetching posts:", error);
      setHasMore(false);
      if (!append) setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const getUsersGroupData = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const res = await axios.get(
        `${BASEURL}/api/get/user/group/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (res && res.data) {
        setUserGroups(res.data as UserGroup[]);
      }
    } catch (error) {
      console.error("Error in getUsersGroupData:", error);
    }
  };

  const getUserData = async () => {
    try {
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const response = await axios.get(
        `${BASEURL}/api/get/userinfo/` + userId,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      if (response.status === 200) {
        const userData = response.data.resUser;
        setUserData(userData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
        !loading &&
        hasMore
      ) {
        setPage((prev) => prev + 1);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  useEffect(() => {
    if (page === 1) return;
    getpost(page, true);
  }, [page]);

  useEffect(() => {
  if (userData && posts.length >= 0) {
    setIsInitialLoading(false);
  }
}, [userData, posts]);

  // Enhanced AdsPanel component for reuse
  const AdsPanel = ({
    imgSrc,
    link,
    alt,
    title = "Quảng cáo",
  }: {
    imgSrc: string;
    link: string;
    alt: string;
    title?: string;
  }) => (
    <div className=" bg-[#1E293B] border rounded-3xl p-0 shadow-xl w-full max-w-[340px] min-h-[36vh] flex flex-col mb-8 hover:shadow-2xl transition-all duration-300 group overflow-hidden relative">
      {/* Decorative Ribbon */}
      <div className="absolute top-0 left-0 bg-gradient-to-r bg-[#1E293B] text-white px-4 py-1 rounded-br-2xl font-bold text-xs shadow-md z-10">
        <span className="animate-pulse">QUẢNG CÁO</span>
      </div>
      {/* Sponsored Badge */}
      <span className="absolute top-3 right-3 bg-[#1E293B]  px-2 py-1 rounded-full text-xs font-semibold shadow-sm z-10">
        Sponsored
      </span>
      {/* Banner Image */}
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <div className="relative overflow-hidden rounded-t-3xl shadow-md transition-all duration-300 group-hover:scale-[1.03]">
          <Image
            src={imgSrc}
            alt={alt}
            width={320}
            height={180}
            className="w-full h-44 object-cover group-hover:brightness-110 group-hover:scale-105 transition-all duration-300"
            style={{ objectFit: "cover" }}
            priority
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* Alt text as badge */}
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700 shadow">
            {alt}
          </div>
        </div>
      </a>
      {/* Content */}
      <div className="flex-1 flex flex-col justify-between px-6 py-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <h4 className="font-bold text-gray-800 text-base">{title}</h4>
        </div>
        <div className="text-gray-600 text-sm mb-4 line-clamp-2">
          {alt || "Khám phá thêm thông tin hữu ích dành cho bạn!"}
        </div>
        <div className="text-center">
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2 bg-blue-500 text-white rounded-xl font-semibold shadow hover:bg-blue-600 transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-blue-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              Tìm hiểu thêm
            </a>
        </div>
      </div>
    </div>
  );

  // Hàm thêm post mới vào đầu danh sách
 const handleAddPost = (newPost: Post) => {
  const now = new Date().toISOString();
  const userDataLocal = localStorage.getItem("userdata");
  let userInfoObj = {
    _id: userId || "",
    username: userData?.username || "User",
    avatar_link: userData?.avatar_link || "/schoolimg.jpg",
  };
  if (userDataLocal) {
    try {
      const parsed = JSON.parse(userDataLocal);
      userInfoObj = {
        _id: parsed.id || userId || "",
        username: parsed.username || userData?.username || "User",
        avatar_link: parsed.avatar_link || userData?.avatar_link || "/schoolimg.jpg",
      };
    } catch {}
  }

  const postWithFullData: Post = {
    ...newPost,
    _id: newPost._id || `temp_${Date.now()}_${Math.random()}`,
    userId: userId || "",
    userInfo: userInfoObj,
    createdAt: newPost.createdAt || now,
    likes: newPost.likes || [],
    comments: newPost.comments || [],
    attachments: newPost.attachments || [],
  };
  setPosts((prev) => [postWithFullData, ...prev]);
};

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5FF]">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#0694FA]/30 rounded-full animate-spin border-t-[#0694FA]"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-pulse border-t-[#1E293B]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F1F1E6] min-h-screen pb-20 flex flex-col relative overflow-x-hidden">
      {/* Enhanced decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#0694FA]/10 rounded-full blur-3xl opacity-40 -z-10" />
      <div className="absolute top-20 right-0 w-72 h-72 bg-[#1E293B]/10 rounded-full blur-3xl opacity-30 -z-10" />
      <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-[#0694FA]/10 rounded-full blur-3xl opacity-25 -z-10" />
      
      {/* Enhanced top gradient bar */}
      <div className="w-full h-1 bg-[#0694FA] shadow-sm" />
      
      {/* Fixed Navigation Bar with enhanced shadow */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-[#1E293B]/10">
        <NavigationBar />
      </div>

      {/* Main Content Container - with improved spacing */}
      <div className="flex justify-center w-full pt-20">
        <div className="flex justify-center items-start gap-6 w-full max-w-7xl px-4">
          
          {/* Left Sidebar - Enhanced User Info */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="fixed top-24 w-80 left-[calc((100vw-1280px)/2)] max-h-[calc(100vh-6rem)]">
              
              {/* Enhanced User Profile Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#1E293B]/10 w-full flex flex-col items-center mb-6 hover:shadow-xl transition-all duration-300">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-[#F1F1E6] mb-4 overflow-hidden flex items-center justify-center ring-4 ring-[#0694FA]/20 ring-offset-2 ring-offset-white group-hover:ring-[#0694FA]/40 transition-all duration-300">
                    <Image
                      src={userData?.avatar_link || "/schoolimg.jpg"}
                      alt={userInfo.name}
                      width={96}
                      height={96}
                      quality={100}
                      className="w-24 h-24 rounded-full object-cover group-hover:scale-105 transition-transform duration-300"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white shadow-sm animate-pulse"></div>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="font-bold text-xl text-[#1E293B]">
                    {userData?.username || userInfo.name}
                  </div>
                  <div className="text-sm text-[#0694FA] font-medium">
                    {userData?.email || userInfo.email}
                  </div>
                  <div className="flex items-center justify-center space-x-4 mt-4 text-sm text-[#1E293B]/70">
                    <div className="flex items-center space-x-1">
                      <span className="w-2 h-2 bg-[#0694FA] rounded-full"></span>
                      <span>{userData?.Major || "IT"}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>{userData?.Year || "Year 3"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Community Groups Section */}
              <div className="bg-white rounded-2xl shadow-lg border border-[#1E293B]/10 mb-6 overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="bg-[#1E293B] px-6 py-4">
                  <h4 className="font-bold text-white flex items-center gap-3">
                    <span className="text-xl">👥</span>
                    <span>Community Groups</span>
                    <span className="ml-auto bg-[#0694FA] px-2 py-1 rounded-full text-xs font-semibold">
                      {userGroups.length}
                    </span>
                  </h4>
                </div>
                <div className="px-6 py-4 max-h-72 overflow-y-auto">
                  {userGroups.length === 0 ? (
                    <div className="text-center py-8 space-y-3">
                      <div className="text-4xl opacity-50">👥</div>
                      <div className="text-[#1E293B]/70 text-sm">Bạn chưa tham gia nhóm nào</div>
                      <button className="text-[#0694FA] hover:text-[#1E293B] text-sm font-medium underline">
                        Khám phá nhóm
                      </button>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {userGroups.map((group) => (
                        <li
                          key={group._id}
                          className="bg-[#F1F1E6] rounded-xl p-4 hover:bg-[#F5F5FF] transition-all duration-200 cursor-pointer group border border-[#1E293B]/10 hover:border-[#0694FA]/30 hover:shadow-md"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <span className="text-lg group-hover:scale-110 transition-transform duration-200">🗨️</span>
                              <span className="font-semibold text-[#1E293B] text-sm group-hover:text-[#0694FA]">
                                {group.name}
                              </span>
                            </div>
                            <span className="bg-[#0694FA] text-white px-2 py-1 rounded-full text-xs font-medium">
                              {group.members?.length || 0}
                            </span>
                          </div>
                          <p className="text-xs text-[#1E293B]/70 leading-relaxed line-clamp-2">
                            {group.desc || "Không có mô tả"}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Enhanced About Website Section */}
              <div className="bg-white rounded-2xl shadow-lg border border-[#1E293B]/10 overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="bg-[#1E293B] px-6 py-4">
                  <h4 className="font-bold text-white flex items-center gap-3">
                    <span className="text-xl">ℹ️</span>
                    <span>About Website</span>
                  </h4>
                </div>
                <ul className="space-y-3 px-6 py-4">
                  <li className="bg-[#F1F1E6] rounded-xl p-4 hover:bg-[#F5F5FF] transition-all duration-200 cursor-pointer group border border-[#1E293B]/10 hover:border-[#0694FA]/30 hover:shadow-md">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg group-hover:scale-110 transition-transform duration-200">🗨️</span>
                      <span className="font-semibold text-[#1E293B] text-sm group-hover:text-[#0694FA]">IT Q&A</span>
                    </div>
                  </li>
                  <li className="bg-[#F1F1E6] rounded-xl p-4 hover:bg-[#F5F5FF] transition-all duration-200 cursor-pointer group border border-[#1E293B]/10 hover:border-[#0694FA]/30 hover:shadow-md">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg group-hover:scale-110 transition-transform duration-200">📚</span>
                      <span className="font-semibold text-[#1E293B] text-sm group-hover:text-[#0694FA]">Study Groups</span>
                    </div>
                  </li>
                  <li className="bg-[#F1F1E6] rounded-xl p-4 hover:bg-[#F5F5FF] transition-all duration-200 cursor-pointer group border border-[#1E293B]/10 hover:border-[#0694FA]/30 hover:shadow-md">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg group-hover:scale-110 transition-transform duration-200">💼</span>
                      <span className="font-semibold text-[#1E293B] text-sm group-hover:text-[#0694FA]">Career</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Center Feed - Enhanced Posts Area */}
          <div className="w-full max-w-2xl flex flex-col items-center space-y-6">
            
            {/* Enhanced New Post Input */}
            <div className="bg-white border border-[#1E293B]/10 rounded-3xl p-6 shadow-lg w-full hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Image
                    src={userData?.avatar_link || "/schoolimg.jpg"}
                    alt={userInfo.name}
                    width={52}
                    height={52}
                    quality={100}
                    className="w-13 h-13 rounded-full object-cover border-3 border-[#0694FA]/30 group-hover:border-[#0694FA] transition-colors duration-300 shadow-md"
                    style={{ objectFit: "cover" }}
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="relative">
                    <Input
                      placeholder="Bạn đang nghĩ gì? Chia sẻ trạng thái, hình ảnh, file tài liệu..."
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="border-0 bg-[#F5F5FF] hover:bg-[#F1F1E6] focus:bg-white focus:ring-2 focus:ring-[#0694FA] rounded-2xl px-6 py-4 text-base cursor-pointer transition-all duration-300 placeholder-[#1E293B]/50 text-[#1E293B] shadow-inner"
                      readOnly
                      onClick={() => setisAddmodalopen(true)}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#1E293B]/50 group-hover:text-[#0694FA] transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Enhanced Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-2 text-[#1E293B]/70 hover:text-[#0694FA] transition-colors px-3 py-2 rounded-xl hover:bg-[#F5F5FF]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium">Ảnh</span>
                      </button>
                      <button className="flex items-center space-x-2 text-[#1E293B]/70 hover:text-[#0694FA] transition-colors px-3 py-2 rounded-xl hover:bg-[#F5F5FF]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm font-medium">File</span>
                      </button>
                      <button className="flex items-center space-x-2 text-[#1E293B]/70 hover:text-[#0694FA] transition-colors px-3 py-2 rounded-xl hover:bg-[#F5F5FF]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium">Cảm xúc</span>
                      </button>
                    </div>
                    
                    <button
                      className="px-8 py-3 bg-[#0694FA] hover:bg-[#1E293B] text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:ring-4 focus:ring-[#0694FA]/30 focus:outline-none"
                      onClick={() => setisAddmodalopen(true)}
                      type="button"
                    >
                      Đăng bài
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Posts Feed */}
            <div className="w-full space-y-6">
              {posts.length === 0 ? (
                <div className="bg-white border border-[#1E293B]/10 rounded-3xl p-12 shadow-lg w-full text-center">
                  <div className="space-y-4">
                    <div className="w-20 h-20 mx-auto bg-[#F1F1E6] rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-[#0694FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <div className="text-[#1E293B] text-xl font-semibold">Chưa có bài viết nào</div>
                      <div className="text-[#1E293B]/70">Hãy là người đầu tiên chia sẻ nội dung!</div>
                    </div>
                    <button 
                      onClick={() => setisAddmodalopen(true)}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-[#0694FA] text-white rounded-xl font-medium hover:bg-[#1E293B] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Tạo bài viết đầu tiên</span>
                    </button>
                  </div>
                </div>
              ) : (
                posts.map((post, index) => (
                  <div
                    key={post._id}
                    className="transform transition-all duration-500 ease-out"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      animation: 'fadeInUp 0.6s ease-out forwards'
                    }}
                  >
                    <RenderPost post={post} userData={post.userInfo || ""} />
                  </div>
                ))
              )}
              
              {/* Enhanced Loading State */}
              {loading && (
                <div className="bg-white border border-[#1E293B]/10 rounded-3xl p-8 shadow-lg text-center">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="relative">
                      <div className="w-8 h-8 border-3 border-[#0694FA]/30 rounded-full animate-spin border-t-[#0694FA]"></div>
                      <div className="absolute inset-0 w-8 h-8 border-3 border-transparent rounded-full animate-pulse border-t-[#1E293B]"></div>
                    </div>
                    <span className="text-[#0694FA] font-medium text-lg">Đang tải thêm bài viết...</span>
                  </div>
                </div>
              )}
              
              {/* Enhanced End of Feed */}
              {!hasMore && posts.length > 0 && (
                <div className="bg-[#F1F1E6] border border-[#1E293B]/10 rounded-3xl p-8 text-center">
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto bg-[#0694FA] rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-[#1E293B] font-semibold">Bạn đã xem hết bài viết!</div>
                    <div className="text-[#1E293B]/70 text-sm">Hãy quay lại sau để xem nội dung mới</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Right Sidebar - Ads */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="fixed top-24 w-80 right-[calc((100vw-1280px)/2)] space-y-6">
              
              {/* Quick Stats Card */}
              <div className="bg-white border border-[#1E293B]/10 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <h4 className="font-bold text-[#1E293B] mb-4 flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  <span>Hoạt động hôm nay</span>
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-[#F5F5FF] rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-[#0694FA] rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{posts.length}</span>
                      </div>
                      <span className="text-[#1E293B] font-medium">Bài viết</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#F1F1E6] rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-[#1E293B] rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{userGroups.length}</span>
                      </div>
                      <span className="text-[#1E293B] font-medium">Nhóm tham gia</span>
                    </div>
                  </div>
                </div>
              </div>

              <AdsPanel
                imgSrc="https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/34a17917926931.562c0f7f02c94.jpg"
                link="https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/34a17917926931.562c0f7f02c94.jpg"
                alt=""
                title="Quảng cáo"
              />
              
              <AdsPanel
                imgSrc="https://th.bing.com/th/id/OIP.1e0RvQj_gmhu4P9adBboQAHaLR?w=202&h=308&c=7&r=0&o=7&pid=1.7&rm=3"
                link="https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/34a17917926931.562c0f7f02c94.jpg"
                alt=""
                title="Quảng cáo"
              />

              {/* Trending Topics */}
              <div className="bg-white border border-[#1E293B]/10 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <h4 className="font-bold text-[#1E293B] mb-4 flex items-center gap-2">
                  <span className="text-xl">🔥</span>
                  <span>Trending</span>
                </h4>
                <div className="space-y-3">
                  {['#ReactJS', '#NodeJS', '#TypeScript', '#NextJS', '#TailwindCSS'].map((tag, index) => (
                    <div 
                      key={tag}
                      className="flex items-center justify-between p-3 bg-[#F1F1E6] rounded-xl hover:bg-[#F5F5FF] cursor-pointer transition-all duration-200 group"
                    >
                      <span className="text-[#1E293B] font-medium group-hover:text-[#0694FA]">{tag}</span>
                      <span className="bg-[#0694FA] text-white px-2 py-1 rounded-full text-xs font-semibold">
                        {Math.floor(Math.random() * 100) + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Chat Bubble */}
      {chatFriend && (
        <div className="fixed bottom-6 right-6 z-50">
          <BubbleChat name={chatFriend} status="Online" />
        </div>
      )}

      {/* Enhanced Post Add Modal */}
      {isAddmodalopen && userId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
       
            <PostAdd
              _id={userId}
              name={userData?.username || userInfo.name}
              avatar={userData?.avatar_link || userInfo.avatar}
              onClose={() => setisAddmodalopen(false)}
              onPostAdded={handleAddPost}
            />
      
        </div>
      )}

      {/* Enhanced bottom gradient bar */}
      <div className="fixed left-0 bottom-0 w-full bg-[#0694FA] h-1 z-40 shadow-lg" />
      
      {/* Floating Action Button for Mobile */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setisAddmodalopen(true)}
          className="w-14 h-14 bg-[#0694FA] text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center hover:scale-110 focus:ring-4 focus:ring-[#0694FA]/30 focus:outline-none hover:bg-[#1E293B]"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Add custom keyframes for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        
        .scrollbar-thumb-blue-200 {
          scrollbar-color: #dbeafe transparent;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
    
  );
};

export default HomePage;