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

  // AdsPanel component for reuse
  const AdsPanel = ({
    imgSrc,
    link,
    alt,
  }: {
    imgSrc: string;
    link: string;
    alt: string;
  }) => (
    <div className="bg-white border border-blue-100 rounded-lg p-6 shadow-sm w-full max-w-[320px] min-h-[35vh] flex flex-col items-center justify-center mb-6">
      <h4 className="mb-4 font-semibold text-blue-900 text-center">Quảng cáo</h4>
      <div className="w-full flex flex-col items-center flex-1 justify-center">
        <a href={link} target="_blank" rel="noopener noreferrer">
          <Image
            src={imgSrc}
            alt={alt}
            width={280}
            height={200}
            className="rounded-lg shadow mb-2 object-cover"
            style={{ width: "100%", height: "24vh", objectFit: "cover" }}
          />
        </a>
        <span className="text-xs text-gray-500">Được tài trợ</span>
      </div>
    </div>
  );

  // Hàm thêm post mới vào đầu danh sách
  const handleAddPost = (newPost: Post) => {
    const postWithId = {
    ...newPost,
    _id: newPost._id || `temp_${Date.now()}_${Math.random()}`,
  };
    setPosts((prev) => [postWithId, ...prev]);
  };

  return (
    <div className="bg-gradient-to-br min-h-screen pb-20 flex flex-col relative overflow-x-hidden">
      {/* Decorative blue gradient top left */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-60 -z-10" />
      {/* Decorative blue bar top */}
      <div className="w-full h-2 bg-gradient-to-r from-blue-400 via-blue-300 to-blue-100 mb-2" />
      
      {/* Fixed Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <NavigationBar />
      </div>

      {/* Main Content Container - with top padding for fixed nav */}
      <div className="flex justify-center w-full pt-20">
        <div className="flex justify-center items-start gap-8 w-full max-w-7xl px-4">
          
          {/* Left Sidebar - User Info (Fixed Position) */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="fixed top-24 w-80 left-[calc((100vw-1280px)/2)]">
              <div className="bg-white dark:bg-[#161b22] rounded-lg shadow p-6 border border-blue-200 w-full flex flex-col items-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gray-300 mb-3 overflow-hidden flex items-center justify-center">
                  <Image
                    src={userData?.avatar_link || "/schoolimg.jpg"}
                    alt={userInfo.name}
                    width={80}
                    height={80}
                    quality={100} // Thêm dòng này cho ảnh nét
                    className="w-20 h-20 rounded-full object-cover border-4 border-blue-300 shadow"
                    style={{ objectFit: "cover" }} // Đảm bảo object-fit cover
                  />
                </div>
                <div className="font-semibold text-lg text-blue-800 dark:text-white mb-1 text-center">
                  {userData?.username || userInfo.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 text-center">
                  {userData?.email || userInfo.email}
                </div>
              </div>

              {/* Community Groups Section */}
              <div className="bg-[#F8FAFC] rounded-lg shadow p-0 border border-blue-200 mb-6">
                <div className="rounded-t-lg px-6 py-3 bg-[#E2E8F0]">
                  <h4 className="font-semibold text-[#1D4ED8] mb-0 flex items-center gap-2">
                    <span className="text-lg">👥</span>
                    Community Groups
                  </h4>
                </div>
                <div className="px-6 py-4 max-h-64 overflow-y-auto">
                  {userGroups.length === 0 ? (
                    <div className="text-gray-500 text-sm">Bạn chưa tham gia nhóm nào.</div>
                  ) : (
                    <ul className="space-y-3">
                      {userGroups.map((group) => (
                        <li
                          key={group._id}
                          className="bg-blue-50 rounded-lg p-3 flex flex-col hover:bg-blue-100 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center mb-1">
                            <span className="text-lg mr-2 text-[#1D4ED8]">🗨️</span>
                            <span className="font-semibold text-[#1D4ED8] text-sm">
                              {group.name}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {group.members?.length || 0} members
                          </span>
                          <span className="text-sm text-gray-700 mt-1">
                            {group.desc || "No description"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* About Website Section */}
              <div className="bg-[#F8FAFC] rounded-lg shadow p-0 border border-blue-200">
                <div className="rounded-t-lg px-6 py-3 bg-[#E0F2FE]">
                  <h4 className="font-semibold text-[#1D4ED8] mb-0 flex items-center gap-2">
                    <span className="text-lg">ℹ️</span>
                    About Website
                  </h4>
                </div>
                <ul className="space-y-3 px-6 py-4">
                  <li className="bg-blue-50 rounded-lg p-3 flex flex-col hover:bg-blue-100 transition-colors cursor-pointer">
                    <div className="flex items-center mb-1">
                      <span className="text-lg mr-2 text-[#1D4ED8]">🗨️</span>
                      <span className="font-semibold text-[#1D4ED8] text-sm">IT Q&A</span>
                    </div>
                  </li>
                  <li className="bg-blue-50 rounded-lg p-3 flex flex-col hover:bg-blue-100 transition-colors cursor-pointer">
                    <div className="flex items-center mb-1">
                      <span className="text-lg mr-2 text-[#1D4ED8]">📚</span>
                      <span className="font-semibold text-[#1D4ED8] text-sm">Study Groups</span>
                    </div>
                  </li>
                  <li className="bg-blue-50 rounded-lg p-3 flex flex-col hover:bg-blue-100 transition-colors cursor-pointer">
                    <div className="flex items-center mb-1">
                      <span className="text-lg mr-2 text-[#1D4ED8]">💼</span>
                      <span className="font-semibold text-[#1D4ED8] text-sm">Career</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Center Feed - Scrollable Posts */}
          <div className="w-full max-w-2xl flex flex-col items-center">
            {/* New Post Input */}
            <div className="bg-white border border-blue-100 rounded-2xl p-6 mb-8 shadow-lg w-full max-w-2xl flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <Image
                  src={userData?.avatar_link || "/schoolimg.jpg"}
                  alt={userInfo.name}
                  width={48}
                  height={48}
                  quality={100} // Thêm dòng này cho ảnh nét
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                  style={{ objectFit: "cover" }} // Đảm bảo object-fit cover
                />
                <div className="flex-1">
                  <Input
                    placeholder="Bạn đang nghĩ gì? Chia sẻ trạng thái, hình ảnh, file tài liệu..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="mb-2 border-blue-200 focus:ring-blue-400 bg-blue-50 rounded-xl px-4 py-3 text-base cursor-pointer"
                    readOnly
                    onClick={() => setisAddmodalopen(true)}
                  />
                </div>
              </div>
              <button
    className="mt-2 self-end px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow transition"
    onClick={() => setisAddmodalopen(true)}
    type="button"
  >
    Đăng bài
  </button>
            </div>

            {/* Posts Feed */}
            <div className="w-full space-y-6">
              {posts.length === 0 ? (
                <div className="bg-white border border-blue-100 rounded-lg p-8 shadow-sm w-full text-center">
                  <div className="text-gray-500 text-lg mb-2">📝</div>
                  <div className="text-gray-600">Chưa có bài viết nào</div>
                  <div className="text-sm text-gray-400 mt-1">
                    Hãy là người đầu tiên chia sẻ nội dung!
                  </div>
                </div>
              ) : (
                posts.map((post) => (
                  <RenderPost key={post._id} post={post} userData={post.userInfo || ""} />
                ))
              )}
              
              {loading && (
                <div className="text-center text-blue-500 py-4">
                  <div className="inline-flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
                    Đang tải thêm bài viết...
                  </div>
                </div>
              )}
              
              {!hasMore && posts.length > 0 && (
                <div className="text-center text-gray-400 py-4">Đã hết bài viết.</div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Ads (Fixed Position) */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="fixed top-24 w-80 right-[calc((100vw-1280px)/2)]">
              <AdsPanel
                imgSrc="https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/34a17917926931.562c0f7f02c94.jpg"
                link="https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/34a17917926931.562c0f7f02c94.jpg"
                alt="Quảng cáo 1"
              />
              <AdsPanel
                imgSrc="https://th.bing.com/th/id/OIP.1e0RvQj_gmhu4P9adBboQAHaLR?w=202&h=308&c=7&r=0&o=7&pid=1.7&rm=3"
                link="https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/34a17917926931.562c0f7f02c94.jpg"
                alt="Quảng cáo 2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Chat Bubble */}
      {chatFriend && <BubbleChat name={chatFriend} status="Online" />}

      {/* Post Add Modal */}
      {isAddmodalopen && userId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <PostAdd
            _id={userId}
            name={userData?.username || userInfo.name}
            avatar={userData?.avatar_link || userInfo.avatar}
            onClose={() => setisAddmodalopen(false)}
            onPostAdded={handleAddPost} // Thêm prop này
          />
        </div>
      )}

      {/* Decorative blue bar bottom */}
      <div className="fixed left-0 bottom-0 w-full bg-gradient-to-r from-blue-400 via-blue-300 to-blue-100 h-2 z-40" />
    </div>
  );
};

export default HomePage;