"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import NavigationBar from "@/app/(main)/layouts/navbar";
import BubbleChat from "@/components/chat/bubble";
import PostAdd from "@/components/home/postadd";
import Image from "next/image";
import { BASEURL } from "@/app/constants/url";
import axios from "axios";
import RenderPost from "@/components/home/post";
import { navigateToCommunityGroup } from "@/utils/navigation";

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
  isPremium: boolean;
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
  const router = useRouter();
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
        console.log("Fetched posts:", newPosts);
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
      const res = await axios.get(`${BASEURL}/api/get/user/group/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
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
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
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
  }: {
    imgSrc: string;
    link: string;
    alt: string;
  }) => (
    <div className="bg-white border border-[#1E293B]/10 rounded-2xl shadow-lg w-full overflow-hidden hover:shadow-xl transition-all duration-300 relative">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <Image
          src={imgSrc}
          alt={alt}
          width={320}
          height={280}
          className="w-full h-60 lg:h-72 xl:h-80 object-cover hover:scale-105 transition-transform duration-300"
          style={{ objectFit: "cover" }}
        />
      </a>
      <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium">
        Quảng cáo
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
          avatar_link:
            parsed.avatar_link || userData?.avatar_link || "/schoolimg.jpg",
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

        {/* Loading Content Area */}
        <div className="flex-1 flex items-center justify-center pt-20 px-4">
          <div className="flex flex-col items-center space-y-4 sm:space-y-6">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-3 sm:border-4 border-[#0694FA]/30 rounded-full animate-spin border-t-[#0694FA]"></div>
              <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 border-3 sm:border-4 border-transparent rounded-full animate-pulse border-t-[#1E293B]"></div>
            </div>
            <div className="text-[#0694FA] font-medium text-base sm:text-lg">
              Đang tải dữ liệu...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F1F1E6] min-h-screen pb-24 lg:pb-20 flex flex-col relative overflow-x-hidden">
      {/* Enhanced decorative elements */}
      <div className="absolute top-0 left-0 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-[#0694FA]/10 rounded-full blur-3xl opacity-40 -z-10" />
      <div className="absolute top-20 right-0 w-36 h-36 sm:w-56 sm:h-56 lg:w-72 lg:h-72 bg-[#1E293B]/10 rounded-full blur-3xl opacity-30 -z-10" />
      <div className="absolute bottom-0 left-1/2 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-[#0694FA]/10 rounded-full blur-3xl opacity-25 -z-10" />

      {/* Enhanced top gradient bar */}
      <div className="w-full h-1 bg-[#0694FA] shadow-sm" />

      {/* Fixed Navigation Bar with enhanced shadow */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-[#1E293B]/10">
        <NavigationBar />
      </div>

      {/* Main Content Container - with improved spacing */}
      <div className="main-layout flex justify-center w-full pt-20 px-2 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex justify-between items-start gap-0.5 sm:gap-1 md:gap-1 lg:gap-1 xl:gap-1.5 w-full max-w-[1400px]">
          {/* Left Sidebar - Enhanced User Info */}
          <div className="sidebar-container hidden lg:block w-56 lg:w-64 xl:w-80 flex-shrink-0">
            <div className="fixed top-24 w-56 lg:w-64 xl:w-80 left-1 lg:left-8 xl:left-[calc((100vw-1200px)/2-16rem)] max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
              {/* Enhanced User Profile Card */}
              <div className="bg-white rounded-2xl shadow-lg p-3 lg:p-4 xl:p-6 border border-[#1E293B]/10 w-full flex flex-col items-center mb-2 lg:mb-3 xl:mb-4 hover:shadow-xl transition-all duration-300">
                <div className="relative group">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 rounded-full bg-[#F1F1E6] mb-2 lg:mb-3 xl:mb-4 overflow-hidden flex items-center justify-center ring-2 lg:ring-3 xl:ring-4 ring-[#0694FA]/20 ring-offset-1 lg:ring-offset-2 xl:ring-offset-2 ring-offset-white group-hover:ring-[#0694FA]/40 transition-all duration-300">
                    <Image
                      src={userData?.avatar_link || "/schoolimg.jpg"}
                      alt={userInfo.name}
                      width={160}
                      height={160}
                      quality={95}
                      priority
                      className="w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 rounded-full object-cover group-hover:scale-105 transition-transform duration-300"
                      style={{ objectFit: "cover" }}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      unoptimized={userData?.avatar_link?.startsWith("data:")}
                    />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 lg:-bottom-1 lg:-right-1 xl:-bottom-1 xl:-right-1 w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 bg-green-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                </div>

                <div className="text-center space-y-1 lg:space-y-2 xl:space-y-3">
                  <div className="font-bold text-sm lg:text-base xl:text-xl text-[#1E293B]">
                    {userData?.username || userInfo.name}
                  </div>
                  <div className="text-xs lg:text-sm xl:text-base text-[#0694FA] font-medium">
                    {userData?.email || userInfo.email}
                  </div>
                  <div className="flex items-center justify-center space-x-2 lg:space-x-3 xl:space-x-4 mt-2 lg:mt-3 xl:mt-4 text-xs lg:text-sm xl:text-base text-[#1E293B]/70">
                    <div className="flex items-center space-x-1 lg:space-x-1.5 xl:space-x-2">
                      <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 xl:w-2.5 xl:h-2.5 bg-[#0694FA] rounded-full"></span>
                      <span>{userData?.Major || "IT"}</span>
                    </div>
                    <div className="flex items-center space-x-1 lg:space-x-1.5 xl:space-x-2">
                      <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 xl:w-2.5 xl:h-2.5 bg-green-500 rounded-full"></span>
                      <span>{userData?.Year || "Year 3"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Community Groups Section */}
              <div className="bg-white rounded-2xl shadow-lg border border-[#1E293B]/10 mb-2 lg:mb-3 xl:mb-4 overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="bg-[#1E293B] px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 xl:py-3">
                  <h4 className="font-bold text-white flex items-center gap-1 lg:gap-2 text-xs lg:text-xs xl:text-sm">
                    <span className="text-xs lg:text-sm xl:text-base">👥</span>
                    <span>Nhóm cộng đồng</span>
                    <span className="ml-auto bg-[#0694FA] px-1 lg:px-1.5 xl:px-2 py-0.5 lg:py-1 rounded-full text-xs font-semibold">
                      {userGroups.length}
                    </span>
                  </h4>
                </div>
                <div className="px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 xl:py-3 max-h-40 lg:max-h-52 xl:max-h-60 overflow-y-auto">
                  {userGroups.length === 0 ? (
                    <div className="text-center py-6 space-y-2">
                      <div className="text-3xl opacity-50">👥</div>
                      <div className="text-[#1E293B]/70 text-xs">
                        Bạn chưa tham gia nhóm nào
                      </div>
                      <button 
                        className="text-[#0694FA] hover:text-[#1E293B] text-xs font-medium underline"
                        onClick={() => router.push('/community')}
                      >
                        Khám phá nhóm
                      </button>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {userGroups.map((group) => (
                        <li
                          key={group._id}
                          className="bg-[#F1F1E6] rounded-xl p-3 hover:bg-[#F5F5FF] transition-all duration-200 cursor-pointer group border border-[#1E293B]/10 hover:border-[#0694FA]/30 hover:shadow-md relative"
                          onClick={() => navigateToCommunityGroup(router, group._id, group.name)}
                          title={`Nhấp để xem bài đăng của nhóm ${group.name}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm group-hover:scale-110 transition-transform duration-200">
                                🗨️
                              </span>
                              <span className="font-semibold text-[#1E293B] text-xs group-hover:text-[#0694FA]">
                                {group.name}
                              </span>
                            </div>
                            <span className="bg-[#0694FA] text-white px-1.5 py-0.5 rounded-full text-xs font-medium">
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
                <div className="bg-[#1E293B] px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 xl:py-3">
                  <h4 className="font-bold text-white flex items-center gap-1 lg:gap-2 text-xs lg:text-xs xl:text-sm">
                    <span className="text-xs lg:text-sm xl:text-base">ℹ️</span>
                    <span>Về trang web</span>
                  </h4>
                </div>
                <ul className="space-y-1 lg:space-y-2 px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 xl:py-3">
                  <li 
                    className="bg-[#F1F1E6] rounded-xl p-3 hover:bg-[#F5F5FF] transition-all duration-200 cursor-pointer group border border-[#1E293B]/10 hover:border-[#0694FA]/30 hover:shadow-md"
                    onClick={() => router.push('/about/qa')}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm group-hover:scale-110 transition-transform duration-200">
                        🗨️
                      </span>
                      <span className="font-semibold text-[#1E293B] text-xs group-hover:text-[#0694FA]">
                        Hỏi đáp CNTT
                      </span>
                    </div>
                  </li>
                  <li 
                    className="bg-[#F1F1E6] rounded-xl p-3 hover:bg-[#F5F5FF] transition-all duration-200 cursor-pointer group border border-[#1E293B]/10 hover:border-[#0694FA]/30 hover:shadow-md"
                    onClick={() => router.push('/community')}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm group-hover:scale-110 transition-transform duration-200">
                        📚
                      </span>
                      <span className="font-semibold text-[#1E293B] text-xs group-hover:text-[#0694FA]">
                        Nhóm học tập
                      </span>
                    </div>
                  </li>
                  <li 
                    className="bg-[#F1F1E6] rounded-xl p-3 hover:bg-[#F5F5FF] transition-all duration-200 cursor-pointer group border border-[#1E293B]/10 hover:border-[#0694FA]/30 hover:shadow-md"
                    onClick={() => router.push('/about/career')}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm group-hover:scale-110 transition-transform duration-200">
                        💼
                      </span>
                      <span className="font-semibold text-[#1E293B] text-xs group-hover:text-[#0694FA]">
                        Nghề nghiệp
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Center Feed - Enhanced Posts Area */}
          <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto flex flex-col items-center space-y-4 sm:space-y-6 px-1 sm:px-2 lg:px-4">
            {/* Enhanced New Post Input */}
            <div className="bg-white border border-[#1E293B]/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg w-full hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="relative flex-shrink-0">
                  <Image
                    src={userData?.avatar_link || "/schoolimg.jpg"}
                    alt={userInfo.name}
                    width={96}
                    height={96}
                    quality={95}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 sm:border-3 border-[#0694FA]/30 group-hover:border-[#0694FA] transition-colors duration-300 shadow-md"
                    style={{ objectFit: "cover" }}
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                </div>

                <div className="flex-1 space-y-3 sm:space-y-4">
                  <div className="relative">
                    <Input
                      placeholder="Bạn đang nghĩ gì?"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="border-0 bg-[#F5F5FF] hover:bg-[#F1F1E6] focus:bg-white focus:ring-2 focus:ring-[#0694FA] rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base cursor-pointer transition-all duration-300 placeholder-[#1E293B]/50 text-[#1E293B] shadow-inner"
                      readOnly
                      onClick={() => setisAddmodalopen(true)}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#1E293B]/50 group-hover:text-[#0694FA] transition-colors">
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Enhanced Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto">
                      <button
                        onClick={() => setisAddmodalopen(true)}
                        className="flex items-center space-x-1 sm:space-x-2 text-[#1E293B]/70 hover:text-[#0694FA] transition-colors px-2 sm:px-3 py-2 rounded-lg sm:rounded-xl hover:bg-[#F5F5FF] flex-shrink-0"
                      >
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
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-xs sm:text-sm font-medium">
                          Ảnh
                        </span>
                      </button>
                      <button
                        onClick={() => setisAddmodalopen(true)}
                        className="flex items-center space-x-1 sm:space-x-2 text-[#1E293B]/70 hover:text-[#0694FA] transition-colors px-2 sm:px-3 py-2 rounded-lg sm:rounded-xl hover:bg-[#F5F5FF] flex-shrink-0"
                      >
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="text-xs sm:text-sm font-medium">
                          Tệp
                        </span>
                      </button>
                      <button
                        onClick={() => setisAddmodalopen(true)}
                        className="hidden lg:flex items-center space-x-2 text-[#1E293B]/70 hover:text-[#0694FA] transition-colors px-3 py-2 rounded-xl hover:bg-[#F5F5FF]"
                      >
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
                        <span className="text-sm font-medium">Cảm xúc</span>
                      </button>
                    </div>

                    <button
                      className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 bg-[#0694FA] hover:bg-[#1E293B] text-white rounded-xl sm:rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:ring-4 focus:ring-[#0694FA]/30 focus:outline-none text-sm sm:text-base flex-shrink-0"
                      onClick={() => setisAddmodalopen(true)}
                      type="button"
                    >
                      <span className="hidden md:inline">Đăng bài</span>
                      <span className="md:hidden">Đăng</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Posts Feed */}
            <div className="w-full space-y-4 sm:space-y-6">
              {posts.length === 0 ? (
                <div className="bg-white border border-[#1E293B]/10 rounded-2xl sm:rounded-3xl p-8 sm:p-12 shadow-lg w-full text-center">
                  <div className="space-y-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-[#F1F1E6] rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 sm:w-10 sm:h-10 text-[#0694FA]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <div className="text-[#1E293B] text-lg sm:text-xl font-semibold">
                        Chưa có bài viết nào
                      </div>
                      <div className="text-[#1E293B]/70 text-sm sm:text-base">
                        Hãy là người đầu tiên chia sẻ nội dung!
                      </div>
                    </div>
                    <button
                      onClick={() => setisAddmodalopen(true)}
                      className="inline-flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-[#0694FA] text-white rounded-lg sm:rounded-xl font-medium hover:bg-[#1E293B] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
                    >
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
                          d="M12 4v16m8-8H4"
                        />
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
                      animation: "fadeInUp 0.6s ease-out forwards",
                    }}
                  >
                    <RenderPost post={post} />
                  </div>
                ))
              )}

              {/* Enhanced Loading State */}
              {loading && (
                <div className="bg-white border border-[#1E293B]/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg text-center">
                  <div className="flex items-center justify-center space-x-3 sm:space-x-4">
                    <div className="relative">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 sm:border-3 border-[#0694FA]/30 rounded-full animate-spin border-t-[#0694FA]"></div>
                      <div className="absolute inset-0 w-6 h-6 sm:w-8 sm:h-8 border-2 sm:border-3 border-transparent rounded-full animate-pulse border-t-[#1E293B]"></div>
                    </div>
                    <span className="text-[#0694FA] font-medium text-base sm:text-lg">
                      Đang tải thêm bài viết...
                    </span>
                  </div>
                </div>
              )}

              {/* Enhanced End of Feed */}
              {!hasMore && posts.length > 0 && (
                <div className="bg-[#F1F1E6] border border-[#1E293B]/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center">
                  <div className="space-y-3">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-[#0694FA] rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 sm:w-8 sm:h-8 text-white"
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
                    <div className="text-[#1E293B] font-semibold text-sm sm:text-base">
                      Bạn đã xem hết bài viết!
                    </div>
                    <div className="text-[#1E293B]/70 text-xs sm:text-sm">
                      Hãy quay lại sau để xem nội dung mới
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Right Sidebar - Ads (only for non-premium users) */}
          {!userData?.isPremium && (
            <div className="sidebar-container hidden lg:block w-56 lg:w-64 xl:w-80 flex-shrink-0">
              <div className="fixed top-24 w-56 lg:w-64 xl:w-80 right-1 lg:right-8 xl:right-[calc((100vw-1200px)/2-16rem)] max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 space-y-4">
                {/* Quick Stats Card */}
                <div className="bg-white border border-[#1E293B]/10 rounded-2xl p-3 lg:p-4 xl:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <h4 className="font-bold text-[#1E293B] mb-2 lg:mb-3 xl:mb-4 flex items-center gap-2 lg:gap-3 xl:gap-4 text-sm lg:text-base xl:text-lg">
                    <span className="text-sm lg:text-base xl:text-lg">📊</span>
                    <span>Hoạt động hôm nay</span>
                  </h4>
                  <div className="space-y-2 lg:space-y-3 xl:space-y-4">
                    <div className="flex items-center justify-between p-2 lg:p-3 xl:p-4 bg-[#F5F5FF] rounded-xl">
                      <div className="flex items-center space-x-2 lg:space-x-3 xl:space-x-4">
                        <div className="w-6 h-6 lg:w-8 lg:h-8 xl:w-10 xl:h-10 bg-[#0694FA] rounded-full flex items-center justify-center">
                          <span className="text-white text-xs lg:text-sm xl:text-base font-bold">
                            {posts.length}
                          </span>
                        </div>
                        <span className="text-[#1E293B] font-medium text-xs lg:text-sm xl:text-base">
                          Bài viết
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 lg:p-3 xl:p-4 bg-[#F1F1E6] rounded-xl">
                      <div className="flex items-center space-x-2 lg:space-x-3 xl:space-x-4">
                        <div className="w-6 h-6 lg:w-8 lg:h-8 xl:w-10 xl:h-10 bg-[#1E293B] rounded-full flex items-center justify-center">
                          <span className="text-white text-xs lg:text-sm xl:text-base font-bold">
                            {userGroups.length}
                          </span>
                        </div>
                        <span className="text-[#1E293B] font-medium text-xs lg:text-sm xl:text-base">
                          Nhóm tham gia
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <AdsPanel
                  imgSrc="https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/34a17917926931.562c0f7f02c94.jpg"
                  link="https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/34a17917926931.562c0f7f02c94.jpg"
                  alt=""
                />

                <AdsPanel
                  imgSrc="https://th.bing.com/th/id/OIP.1e0RvQj_gmhu4P9adBboQAHaLR?w=202&h=308&c=7&r=0&o=7&pid=1.7&rm=3"
                  link="https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/34a17917926931.562c0f7f02c94.jpg"
                  alt=""
                />
              </div>
            </div>
          )}

          {/* Premium User - No Ads Message */}
          {userData?.isPremium && (
            <div className="sidebar-container hidden lg:block w-56 lg:w-64 xl:w-80 flex-shrink-0">
              <div className="fixed top-24 w-56 lg:w-64 xl:w-80 right-1 lg:right-8 xl:right-[calc((100vw-1200px)/2-16rem)] max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 space-y-4">
                {/* Quick Stats Card */}
                <div className="bg-white border border-[#1E293B]/10 rounded-2xl p-3 lg:p-4 xl:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <h4 className="font-bold text-[#1E293B] mb-2 lg:mb-3 xl:mb-4 flex items-center gap-2 lg:gap-3 xl:gap-4 text-sm lg:text-base xl:text-lg">
                    <span className="text-sm lg:text-base xl:text-lg">📊</span>
                    <span>Hoạt động hôm nay</span>
                  </h4>
                  <div className="space-y-2 lg:space-y-3 xl:space-y-4">
                    <div className="flex items-center justify-between p-2 lg:p-3 xl:p-4 bg-[#F5F5FF] rounded-xl">
                      <div className="flex items-center space-x-2 lg:space-x-3 xl:space-x-4">
                        <div className="w-6 h-6 lg:w-8 lg:h-8 xl:w-10 xl:h-10 bg-[#0694FA] rounded-full flex items-center justify-center">
                          <span className="text-white text-xs lg:text-sm xl:text-base font-bold">
                            {posts.length}
                          </span>
                        </div>
                        <span className="text-[#1E293B] font-medium text-xs lg:text-sm xl:text-base">
                          Bài viết
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 lg:p-3 xl:p-4 bg-[#F1F1E6] rounded-xl">
                      <div className="flex items-center space-x-2 lg:space-x-3 xl:space-x-4">
                        <div className="w-6 h-6 lg:w-8 lg:h-8 xl:w-10 xl:h-10 bg-[#1E293B] rounded-full flex items-center justify-center">
                          <span className="text-white text-xs lg:text-sm xl:text-base font-bold">
                            {userGroups.length}
                          </span>
                        </div>
                        <span className="text-[#1E293B] font-medium text-xs lg:text-sm xl:text-base">
                          Nhóm tham gia
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Premium No Ads Card */}
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-2xl p-4 md:p-6 shadow-lg">
                  <div className="text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-yellow-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 md:w-8 md:h-8 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h3 className="font-bold text-yellow-800 text-xs md:text-sm mb-1 md:mb-2">
                      🎉 Premium Active!
                    </h3>
                    <p className="text-yellow-700 text-xs">
                      Bạn đang tận hưởng trải nghiệm không quảng cáo với
                      Premium!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Chat Bubble */}
      {chatFriend && (
        <div className="fixed bottom-20 right-4 z-50 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8">
          <BubbleChat name={chatFriend} status="Online" />
        </div>
      )}

      {/* Enhanced Post Add Modal */}
      {isAddmodalopen && userId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md p-2 sm:p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <PostAdd
              _id={userId}
              name={userData?.username || userInfo.name}
              avatar={userData?.avatar_link || userInfo.avatar}
              onClose={() => setisAddmodalopen(false)}
              onPostAdded={handleAddPost}
            />
          </div>
        </div>
      )}

      {/* Enhanced bottom gradient bar */}
      <div className="fixed left-0 bottom-0 w-full bg-[#0694FA] h-1 z-40 shadow-lg" />

      {/* Floating Action Button for Mobile and smaller screens */}
      <div className="lg:hidden fixed bottom-6 right-4 z-50">
        <button
          onClick={() => setisAddmodalopen(true)}
          className="w-12 h-12 sm:w-14 sm:h-14 bg-[#0694FA] text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center hover:scale-110 focus:ring-4 focus:ring-[#0694FA]/30 focus:outline-none hover:bg-[#1E293B]"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
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

        .scrollbar-thumb-gray-300 {
          scrollbar-color: #d1d5db transparent;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Responsive Sidebar Display */
        @media (min-width: 1024px) {
          .sidebar-container {
            display: block !important;
          }
        }

        /* Adjust layout for different screen sizes */
        @media (min-width: 1024px) and (max-width: 1279px) {
          .main-layout {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
        }

        @media (min-width: 1280px) {
          .main-layout {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
        }

        /* Enhanced responsive typography and spacing */
        @media (max-width: 640px) {
          .sidebar-container {
            display: none !important;
          }
        }

        @media (min-width: 641px) and (max-width: 1023px) {
          .sidebar-container {
            display: none !important;
          }
        }

        /* Custom scrollbar for webkit browsers */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
