'use client'
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NavigationBar from '@/app/(main)/layouts/navbar';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import axios from 'axios';
import { useWebSocket } from '@/app/context/websocket.contex';
import { BASEURL } from '@/app/constants/url';
import RenderPost from '@/components/home/post';
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
  userInfo: userInfo
  
}
interface Attachment {
  file?: FileAttachment;
  url?: string;
  filename?: string;
  mimetype?: string;
  filetype?: string;
}
interface UserdataProps {
  id?: string,
  username: string,
  Year: string,
  Major: string,
  email: string,
  status:string,
  Faculty: string,
  avatar?: string,
  avatar_link?: string,
  friends?: string[]
  profilePrivacy?: string;
  messagePrivacy?: string;
  notifcationSettings?: string;
}
interface Comments {
  userinfo: userInfo;
  context: string;
}
interface userInfo {
  _id:string;
  username:string;
  avatar_link:string;
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
    const data = localStorage.getItem('friends');
    if (data) setFriends(JSON.parse(data));
  }, [userId]);

  const createFriendRequest = () => {
    const fromid = localStorage.getItem('userId')
    const toid = userId;
    sendMessage({
      type: 'friend_request',
      from: fromid || '123',
      to: toid || '123',
    });
  }

  const getUserData = React.useCallback(async () => {
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const response = await axios.get(`${BASEURL}/api/get/userinfo/` + userId, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        }
      });
      if (response.status === 200) {
        const userData = response.data.resUser;
        setUserData(userData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, [userId]);

  const getCurrentAvatarUrl = () => {
    return userData?.avatar_link || userData?.avatar || '/schoolimg.jpg';
  }

  const getUserPost = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${BASEURL}/api/get/user/post/${userId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        }
      });
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

  const currentUserId = typeof window !== "undefined" ? localStorage.getItem('userId') : null;

  const canViewProfile = () => {
    if (!userData?.profilePrivacy || userData.profilePrivacy === "everyone") return true;
    if (userData.profilePrivacy === "everyone") return false;
    if (userData.profilePrivacy === "private") return false;
    if (userData.profilePrivacy === "friends") {
      return userData.friends?.includes(currentUserId || "") || currentUserId === userId;
    }
    return false;
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100">
        <div className="flex flex-col items-center space-y-6 p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20">
          <div className="relative">
            <svg className="animate-spin h-12 w-12 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <div className="absolute inset-0 animate-ping">
              <svg className="h-12 w-12 text-indigo-400 opacity-30" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
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
                          (e.target as HTMLImageElement).src = '/schoolimg.jpg';
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full shadow-lg">
                    <div className="w-full h-full bg-green-500 rounded-full animate-ping opacity-75"></div>
                  </div>
                </div>

                <h2 className="text-lg font-bold text-gray-800 mb-1 transition-colors duration-300 text-shadow">
                  {userData?.username}
                </h2>

                <p className="text-xs text-gray-600 mb-3 flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#0694FA] rounded-full animate-pulse"></span>
                  {userData?.email}
                </p>

                <div className="flex justify-center gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-sm font-bold text-[#0694FA]">{posts.length}</div>
                    <div className="text-xs text-gray-500">Bài viết</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-[#1E293B]">{userData?.friends?.length || 0}</div>
                    <div className="text-xs text-gray-500">Bạn bè</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-[#0694FA]">
                      {posts.reduce((acc, post) => acc + post.likes.length, 0)}
                    </div>
                    <div className="text-xs text-gray-500">Lượt thích</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {Array.isArray(friends) && friends.includes(userId) ? (
                    <>
                      <Button
                        className="bg-[#0694FA] hover:bg-[#0694FA]/90 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        onClick={() => router.push('/messages')}
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
                        onClick={() => router.push('/messages')}
                      >
                        Nhắn tin
                      </Button>
                      {userData && userData.status !== 'accepted' && (
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
                    <h4 className="font-semibold text-[#1E293B] text-sm">Khoa</h4>
                  </div>
                  <p className="text-sm text-[#1E293B] font-medium">{userData?.Faculty}</p>
                </div>

                <div className="bg-[#F1F1E6] rounded-xl p-3 border border-[#0694FA]/20 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-[#1E293B] rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs">📚</span>
                    </div>
                    <h4 className="font-semibold text-[#1E293B] text-sm">Chuyên ngành</h4>
                  </div>
                  <p className="text-sm text-[#1E293B] font-medium">{userData?.Major}</p>
                </div>

                <div className="bg-[#F1F1E6] rounded-xl p-3 border border-[#0694FA]/20 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-[#0694FA] rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs">📅</span>
                    </div>
                    <h4 className="font-semibold text-[#1E293B] text-sm">Năm học</h4>
                  </div>
                  <p className="text-sm text-[#1E293B] font-medium">{userData?.Year}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Bài viết</h2>
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
                        userData={post.userInfo} 
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