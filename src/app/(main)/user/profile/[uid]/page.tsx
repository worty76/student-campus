"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NavigationBar from "@/app/(main)/layouts/navbar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import axios from "axios";
import { useWebSocket } from "@/app/context/websocket.contex";
import { BASEURL } from "@/app/constants/url";
import RenderPost from "@/components/home/post";
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
  comments: Comments[];
  userInfo: userInfo;
}
interface Attachment {
  file?: FileAttachment;
  url?: string;
  filename?: string;
  mimetype?: string;
  filetype?: string;
}
interface UserdataProps {
  id?: string;
  username: string;
  Year: string;
  Major: string;
  email: string;
  status: string;
  Faculty: string;
  avatar?: string;
  avatar_link?: string;
  friends?: string[];
  profilePrivacy?: string;
  messagePrivacy?: string;
  notifcationSettings?: string;
  isPremium?: boolean;
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

const UserProfilePage = () => {
  const [userData, setUserData] = useState<UserdataProps | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const { sendMessage } = useWebSocket();
  const [friends, setFriends] = useState<string[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const userId = params?.uid as string;

  useEffect(() => {
    const data = localStorage.getItem("friends");
    if (data) setFriends(JSON.parse(data));
  }, [userId]);

  const createFriendRequest = () => {
    const fromid = localStorage.getItem("userId");
    const toid = userId;
    sendMessage({
      type: "friend_request",
      from: fromid || "123",
      to: toid || "123",
    });
  };

  const getUserData = React.useCallback(async () => {
    try {
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");
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
  }, [userId]);

  const getCurrentAvatarUrl = () => {
    return userData?.avatar_link || userData?.avatar || "/schoolimg.jpg";
  };

  const getUserPost = React.useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASEURL}/api/get/user/post/${userId}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      if (response.status === 200 && Array.isArray(response.data.posts)) {
        setPosts(response.data.posts);
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  }, [userId]);

  useEffect(() => {
    getUserData();
    getUserPost();
  }, [getUserData, getUserPost]);

  useEffect(() => {
    if (userData && posts) {
      setIsInitialLoading(false);
    }
  }, [userData, posts]);

  const currentUserId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const canViewProfile = () => {
    if (!userData?.profilePrivacy || userData.profilePrivacy === "everyone")
      return true;
    if (userData.profilePrivacy === "everyone") return false;
    if (userData.profilePrivacy === "private") return false;
    if (userData.profilePrivacy === "friends") {
      return (
        userData.friends?.includes(currentUserId || "") ||
        currentUserId === userId
      );
    }
    return false;
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100">
        <div className="flex flex-col items-center space-y-6 p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20">
          <div className="relative">
            <svg
              className="animate-spin h-12 w-12 text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
            <div className="absolute inset-0 animate-ping">
              <svg
                className="h-12 w-12 text-indigo-400 opacity-30"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                ></circle>
              </svg>
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-gray-800">Đang tải hồ sơ</h3>
            <p className="text-gray-600">Vui lòng chờ trong giây lát...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F1E6]">
      <NavigationBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-[7vh] pb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-72 space-y-4 lg:sticky lg:top-[7vh] lg:h-fit">
            <div className="profile-card group bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-4 transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] hover:bg-white/80">
              <div className="text-center mb-4">
                <div className="relative inline-block">
                  <div className="relative w-20 h-20 mx-auto mb-3 rounded-full bg-[#0694FA] p-1 transition-all duration-300">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                      <Image
                        src={getCurrentAvatarUrl()}
                        alt="User Avatar"
                        className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-110"
                        width={80}
                        height={80}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/schoolimg.jpg";
                        }}
                      />
                    </div>
                  </div>

                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full shadow-lg">
                    <div className="w-full h-full bg-green-500 rounded-full animate-ping opacity-75"></div>
                  </div>
                </div>

                <h2 className="text-lg font-bold text-gray-800 mb-1 transition-colors duration-300 text-shadow flex items-center gap-2">
                  {userData?.username}
                  {userData?.isPremium && (
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs font-semibold text-yellow-600 ml-1 bg-yellow-100 px-2 py-1 rounded-full">
                        PREMIUM
                      </span>
                    </div>
                  )}
                </h2>

                <p className="text-xs text-gray-600 mb-3 flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#0694FA] rounded-full animate-pulse"></span>
                  {userData?.email}
                </p>

                <div className="flex justify-center gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-sm font-bold text-[#0694FA]">
                      {posts.length}
                    </div>
                    <div className="text-xs text-gray-500">Bài viết</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-[#1E293B]">
                      {userData?.friends?.length || 0}
                    </div>
                    <div className="text-xs text-gray-500">Bạn bè</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-[#0694FA]">
                      {posts.reduce((acc, post) => acc + post.likes.length, 0)}
                    </div>
                    <div className="text-xs text-gray-500">Lượt thích</div>
                  </div>
                  {userData?.isPremium && (
                    <div className="text-center">
                      <div className="text-sm font-bold text-yellow-600">
                        ⭐
                      </div>
                      <div className="text-xs text-yellow-600 font-medium">
                        Premium
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {Array.isArray(friends) && friends.includes(userId) ? (
                    <>
                      <Button
                        className="bg-[#0694FA] hover:bg-[#0694FA]/90 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        onClick={() => router.push("/messages")}
                      >
                        Nhắn tin
                      </Button>
                      <Button
                        className="bg-gray-400 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium"
                        disabled
                      >
                        Đã là bạn bè
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        className="bg-[#0694FA] hover:bg-[#0694FA]/90 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        onClick={() => router.push("/messages")}
                      >
                        Nhắn tin
                      </Button>
                      {userData && userData.status !== "accepted" && (
                        <Button
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          onClick={createFriendRequest}
                        >
                          Thêm bạn bè
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-[#F1F1E6] rounded-xl p-3 border border-[#0694FA]/20 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-[#0694FA] rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs">🎓</span>
                    </div>
                    <h4 className="font-semibold text-[#1E293B] text-sm">
                      Khoa
                    </h4>
                  </div>
                  <p className="text-sm text-[#1E293B] font-medium">
                    {userData?.Faculty}
                  </p>
                </div>

                <div className="bg-[#F1F1E6] rounded-xl p-3 border border-[#0694FA]/20 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-[#1E293B] rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs">📚</span>
                    </div>
                    <h4 className="font-semibold text-[#1E293B] text-sm">
                      Chuyên ngành
                    </h4>
                  </div>
                  <p className="text-sm text-[#1E293B] font-medium">
                    {userData?.Major}
                  </p>
                </div>

                <div className="bg-[#F1F1E6] rounded-xl p-3 border border-[#0694FA]/20 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-[#0694FA] rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs">📅</span>
                    </div>
                    <h4 className="font-semibold text-[#1E293B] text-sm">
                      Năm học
                    </h4>
                  </div>
                  <p className="text-sm text-[#1E293B] font-medium">
                    {userData?.Year}
                  </p>
                </div>

                {userData?.isPremium && (
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-3 border border-yellow-300 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-yellow-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs">👑</span>
                      </div>
                      <h4 className="font-semibold text-yellow-800 text-sm">
                        Thành viên Premium
                      </h4>
                    </div>
                    <p className="text-sm text-yellow-700 font-medium flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Đã kích hoạt
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Bài viết
              </h2>
              <div className="space-y-6">
                {canViewProfile() ? (
                  posts.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p className="text-lg">Chưa có bài viết nào.</p>
                    </div>
                  ) : (
                    posts.map((post) => (
                      <RenderPost
                        key={post._id}
                        post={post}
                       
                        onDelete={() => getUserPost()}
                      />
                    ))
                  )
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p className="text-lg">Bài viết không được công khai.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
