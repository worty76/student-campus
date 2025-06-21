'use client'
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import NavigationBar from '@/app/(main)/layouts/navbar';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import axios from 'axios';
import { useWebSocket } from '@/app/constants/websocket.contex';
import { BASEURL } from '@/app/constants/url';
import RenderPost from '@/components/ui/post';
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
  comments: string[];
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
  interest?: string[]
}

const UserProfilePage = () => {
  const [userData, setUserData] = useState<UserdataProps | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const { sendMessage } = useWebSocket();

  const params = useParams();
  const userId = params?.uid as string;
  
  useEffect(() => {
    const data = localStorage.getItem('profileData');
    if (data) setUserData(JSON.parse(data));
    console.log('data :'+data)
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
        console.log(response)
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  }, [userId]);

  useEffect(() => {
    getUserData();
    getUserPost();
  }, [getUserData, getUserPost]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 dark:bg-[#0d1117] overflow-hidden">
      <NavigationBar />
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 mt-[10vh]">
        {/* Sidebar (Profile Info) */}
        <aside className="w-full md:w-64 bg-white dark:bg-[#161b22] rounded-lg shadow p-6 h-fit">
          <div className="mb-6 flex flex-col items-center">
            <div
              className="w-20 h-20 rounded-full bg-gray-300 mb-3 overflow-hidden flex items-center justify-center relative"
            >
              <Image
                src={getCurrentAvatarUrl()}
                alt="User Avatar"
                className="w-20 h-20 object-cover rounded-full"
                width={80}
                height={80}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/schoolimg.jpg';
                }}
              />
            </div>
            <div className="text-center font-semibold text-lg text-blue-800 dark:text-white mb-1">
              {userData?.username}
            </div>
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-2">
              {userData?.email}
            </div>

           
  <div className="flex gap-2 mt-2">
    <Button
      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
      onClick={() => alert('Chức năng nhắn tin!')}
    >
      Nhắn tin
    </Button>
  {userData && userData.status !== 'accepted' ? (
    <Button
      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
      onClick={createFriendRequest}
    >
      Thêm bạn bè
    </Button>
 
) : null}
            </div>  
          </div>
          <hr className="border-gray-300 dark:border-gray-700 border-2 my-4" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-3">Faculty</h4>
            <div className="text-sm text-gray-700">{userData?.Faculty}</div>
          </div>
          <hr className="border-gray-300 dark:border-gray-700 border-2 my-4" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-3">Major</h4>
            <div className="text-sm text-gray-700">{userData?.Major}</div>
          </div>
          <hr className="border-gray-300 dark:border-gray-700 border-2 my-4" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-3">Year</h4>
            <div className="text-sm text-gray-700">{userData?.Year}</div>
          </div>
          <div className="flex justify-center gap-2 mt-4">
          
          </div>
        </aside>
        {/* Main Content (Posts) */}
        <main className="flex-1 bg-white dark:bg-[#161b22] rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold mb-8">Bài viết của bạn</h1>
          
          {/* Posts List */}
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="text-gray-500 text-center">Bạn chưa có bài viết nào.</div>
            ) : (
             posts.map((post) => (
                <RenderPost key={post._id} post={post} userData={userData} />
              ))
            )}
            
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserProfilePage;