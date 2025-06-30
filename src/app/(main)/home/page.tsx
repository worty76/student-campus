"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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

// Đưa interface Post lên trước
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

// Thêm interface cho group nếu chưa có
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

const onlineFriends = ["Minh", "Lan", "Hùng", "Trang"];

const HomePage = () => {
  const [postContent, setPostContent] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [userData, setUserData] = useState<UserdataProps | null>(null);
  const [chatFriend, setChatFriend] = useState<string | null>(null);
  const [isAddmodalopen, setisAddmodalopen] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Thêm state cho group
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);

  useEffect(() => {
    const storedId = localStorage.getItem("userId");
    if (storedId) {
      setUserId(storedId);
      getpost(1, false);
      getUserData();
      getUsersGroupData(); // <-- gọi hàm này
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
      // Có thể thêm limit nếu muốn, ví dụ: &limit=10
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
        setHasMore(response.data.hasMore); // Sử dụng hasMore từ backend
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
        console.log("User groups data:", res.data);
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

        console.log(userData);
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
            <div className="bg-white dark:bg-[#161b22] rounded-lg shadow p-6 h-fit border border-blue-200 w-full max-w-xs flex flex-col items-center relative">
              <div className="w-20 h-20 rounded-full bg-gray-300 mb-3 overflow-hidden flex items-center justify-center">
                <Image
                  src={userData?.avatar_link || "/schoolimg.jpg"}
                  alt={userInfo.name}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover border-4 border-blue-300 shadow"
                />
              </div>
              <div className="font-semibold text-lg text-blue-800 dark:text-white mb-1">
                {userData?.username || userInfo.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {userData?.email || userInfo.email}
              </div>
            </div>
            <hr className="my-6 border-t border-gray-500 w-full" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-3">
                Community Groups
              </h4>
              <ul className="space-y-3">
                {userGroups.length === 0 ? (
                  <li className="text-gray-500">Bạn chưa tham gia nhóm nào.</li>
                ) : (
                  userGroups.map((group) => (
                    <li
                      key={group._id}
                      className="bg-blue-50 rounded-lg p-3 flex flex-col hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center mb-1">
                        <span className="text-lg mr-2">🗨️</span>
                        <span className="font-semibold text-blue-800">
                          {group.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {group.members?.length || 0} members
                      </span>
                      <span className="text-sm text-gray-700 mt-1">
                        {/* Sử dụng group.desc thay vì group.description */}
                        {group.desc || "No description"}
                      </span>
                    </li>
                  ))
                )}
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
                  Hướng dẫn: ![mô tả](link-ảnh) cho ảnh, [video](link-video) cho
                  video, [file tên-file](link-file) cho tài liệu
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
                <div className="text-sm text-gray-400 mt-1">
                  Hãy là người đầu tiên chia sẻ nội dung!
                </div>
              </div>
            ) : (
              posts.map((post) => (
                <RenderPost key={post._id} post={post} userData={post.userInfo || ' '} />
              ))
            )}
            {loading && (
              <div className="text-center text-blue-500 my-4">Đang tải thêm bài viết...</div>
            )}
            {!hasMore && (
              <div className="text-center text-gray-400 my-4">Đã hết bài viết.</div>
            )}
          </div>

          {/* Online Friends */}
          <div className="w-full md:w-[600px] justify-center">
            <div className="bg-white border border-blue-100 rounded-lg p-6 shadow-sm sticky top-8 w-full max-w-[1000px]">
              <h4 className="mb-4 font-semibold text-blue-900">
                Bạn bè online ({onlineFriends.length})
              </h4>
              <ul className="space-y-3">
                {onlineFriends.map((friend) => (
                  <li
                    key={friend}
                    className="flex items-center hover:bg-blue-50 p-2 rounded-md transition-colors cursor-pointer"
                    onClick={() => setChatFriend(friend)}
                  >
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

      {chatFriend && <BubbleChat name={chatFriend} status="Online" />}

      {isAddmodalopen === true && userId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <PostAdd
            _id={userId}
            name={userInfo.name}
            onClose={() => setisAddmodalopen(false)}
          />
        </div>
      )}

      {/* Decorative blue bar bottom */}
      <div className="fixed left-0 bottom-0 w-full bg-gradient-to-r from-blue-400 via-blue-300 to-blue-100 h-2 z-40" />
    </div>
  );
};

export default HomePage;