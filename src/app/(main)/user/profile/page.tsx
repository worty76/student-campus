'use client'
import React, { useEffect, useState, useRef } from 'react';
import {  Edit3, Save, X, Camera } from 'lucide-react';
import NavigationBar from '@/app/(main)/layouts/navbar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import axios from 'axios';
import { BASEURL } from "@/app/constants/url";
import { useRouter } from 'next/navigation';
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
interface friends {
  _id: string;
  username: string;
  avatar_link?: string;
}
interface UserdataProps {
  id?: string,
  username: string,
  Year: string,
  Major: string,
  email: string,
  Faculty: string,
  avatar?: string,
  avatar_link?: string,
  friends?: friends[]
}

const UserProfilePage = () => {
  const [userData, setUserData] = useState<UserdataProps | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<UserdataProps | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isAddmodalopen, setisAddmodalopen] = useState(false);
  const router = useRouter();
  const facultyOptions = [
    'Software Engineering',
    'Artificial Intelligence',
    'Business Administration',
    'Graphic Design',
  ];

  const majorOptions = [
    'Web Development',
    'Mobile Development',
    'Marketing',
    'Animation',
  ];

  const yearOptions = [
    'First Year',
    'Second Year',
    'Third Year',
    'Fourth Year',
  ];

  const getUserData = async () => {
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const userId = localStorage.getItem('userId')
      const response = await axios.get(`${BASEURL}/api/get/userinfo/` + userId, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        }
      });
      if (response.status === 200) {
        const userData = response.data.resUser;
        setUserData(userData);
        setEditedData(userData);
        setAvatarPreview(userData.avatar_link || userData.avatar || '/schoolimg.jpg');
        console.log(userData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(userData);
    setAvatarPreview(userData?.avatar_link || userData?.avatar || '/schoolimg.jpg');
    setAvatarFile(null);
  }

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const userId = localStorage.getItem('userId');
      const info = {
        id: userId,
        username: editedData?.username || '',
        email: editedData?.email || '',
        Faculty: editedData?.Faculty || '',
        Major: editedData?.Major || '',
        Year: editedData?.Year || '',
        friends: editedData?.friends || []
      };
      const formData = new FormData();
      formData.append('info', JSON.stringify(info));
      if (avatarFile) {
        formData.append('file', avatarFile);
      }
      const response = await axios.post(`${BASEURL}/api/update/user/img`, formData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.status === 200) {
        const updatedUser = response.data.user;
        setUserData(updatedUser);
        setEditedData(updatedUser);
        setAvatarPreview(updatedUser.avatar_link || updatedUser.avatar || '/schoolimg.jpg');
        setIsEditing(false);
        setAvatarFile(null);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      
    } finally {
      setIsSaving(false);
    }
  }

  const handleInputChange = (field: keyof UserdataProps, value: string) => {
    if (editedData) {
      setEditedData({
        ...editedData,
        [field]: value
      });
    }
  }

  const getCurrentAvatarUrl = () => {
    if (isEditing) {
      return avatarPreview;
    } else {
      return userData?.avatar_link || userData?.avatar || '/schoolimg.jpg';
    }
  }
 
 
  
  const getUserPost = async () => {
    try {
      const userId = localStorage.getItem('userId');
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
  };

  useEffect(() => {
    getUserData();
    getUserPost();
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 dark:bg-[#0d1117] overflow-hidden">
      <NavigationBar />
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 mt-[10vh] overflow-hidden ">
        {/* Sidebar - Profile Info and Friends */}
        <div className="w-full md:w-64 flex flex-col gap-4">
          {/* Profile Info Container */}
          <aside className="bg-white dark:bg-[#161b22] rounded-lg shadow p-6">
            <div className="mb-6 flex flex-col items-center">
              <div
                className={`w-20 h-20 rounded-full bg-gray-300 mb-3 overflow-hidden flex items-center justify-center relative ${isEditing ? 'cursor-pointer hover:opacity-80' : ''}`}
                onClick={handleAvatarClick}
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
                {isEditing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Camera size={24} className="text-white" />
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              {isEditing ? (
                <input
                  type="text"
                  value={editedData?.username || ''}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="text-lg font-bold text-center bg-transparent border-b-2 border-blue-300 focus:border-blue-500 outline-none w-full"
                />
              ) : (
                <div className="text-center font-semibold text-lg text-blue-800 dark:text-white mb-1">
                  {userData?.username}
                </div>
              )}
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                {userData?.email}
              </div>
             
              
            </div>
            <hr className="border-gray-300 dark:border-gray-700 border-2 my-4" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-3">Faculty</h4>
              {isEditing ? (
                <Select value={editedData?.Faculty} onValueChange={(value) => handleInputChange('Faculty', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {facultyOptions.map((faculty) => (
                      <SelectItem key={faculty} value={faculty}>
                        {faculty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-gray-700">{userData?.Faculty}</div>
              )}
            </div>
            <hr className="border-gray-300 dark:border-gray-700 border-2 my-4" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-3">Major</h4>
              {isEditing ? (
                <Select value={editedData?.Major} onValueChange={(value) => handleInputChange('Major', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select major" />
                  </SelectTrigger>
                  <SelectContent>
                    {majorOptions.map((major) => (
                      <SelectItem key={major} value={major}>
                        {major}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-gray-700">{userData?.Major}</div>
              )}
            </div>
            <hr className="border-gray-300 dark:border-gray-700 border-2 my-4" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-3">Year</h4>
              {isEditing ? (
                <Select value={editedData?.Year} onValueChange={(value) => handleInputChange('Year', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-gray-700">{userData?.Year}</div>
              )}
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                  >
                    <Save size={16} />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                  >
                    <X size={16} />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleEdit}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                >
                  <Edit3 size={16} />
                  Edit Profile
                </Button>
              )}
            </div>
          </aside>

          {/* Friends List Container */}
          <div className="bg-white dark:bg-[#161b22] rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-semibold text-lg text-gray-900 dark:text-white">Bạn bè</span>
                <span className="ml-2 text-gray-500 text-sm">{userData?.friends?.length || 0} người bạn</span>
              </div>
              {/* <a href="#" className="text-blue-600 text-sm hover:underline">Xem tất cả bạn bè</a> */}
            </div>
            <div className="grid grid-cols-3 gap-3">
           {userData?.friends?.slice(0, 9).map((friend) => (
              <button    
                onClick={() => {
                  localStorage.setItem('profileData', JSON.stringify(friend));
                  router.push(`/user/profile/${friend._id}`);
                }}
                key={friend._id}
                className="flex flex-col items-center rounded-lg p-2 transition-all duration-200"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden mb-1 bg-white flex items-center justify-center">
                  <Image
                    src={friend.avatar_link || '/schoolimg.jpg'}
                    alt={friend.username}
                    width={64}
                    height={64}
                    className="object-contain w-full h-full transition duration-200 hover:brightness-110"
                  />
                </div>
                <span className="text-xs text-gray-800 dark:text-gray-200 text-center truncate w-16">
                  {friend.username}
                </span>
              </button>
            ))}



            </div>
          </div>
        </div>

        {/* Main Content (Posts) */}
        <main className="flex-1 bg-white dark:bg-[#161b22] rounded-lg shadow p-8 flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Bài viết của bạn</h1>
            <Button
              onClick={() => {setisAddmodalopen(true)
                console.log(isAddmodalopen)
              }}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Đăng bài
            </Button>
          </div>
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

export default UserProfilePage