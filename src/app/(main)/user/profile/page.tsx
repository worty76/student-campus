"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  Edit3,
  Save,
  X,
  Camera,
  Users,
  Heart,
  MessageCircle,
} from "lucide-react";
import NavigationBar from "@/app/(main)/layouts/navbar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import axios from "axios";
import { BASEURL } from "@/app/constants/url";
import { useRouter } from "next/navigation";
import RenderPost from "@/components/home/post";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import "./profile.css";

interface Comments {
  userinfo: userInfo;
  context: string;
}
interface userInfo {
  _id: string;
  username: string;
  avatar_link: string;
}
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
  isPremium?: boolean;
}

const UserProfilePage = () => {
  const [userData, setUserData] = useState<UserdataProps | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<UserdataProps | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true); // Thêm state loading
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const router = useRouter();
  const facultyOptions = [
    "Software Engineering",
    "Artificial Intelligence",
    "Business Administration",
    "Graphic Design",
  ];

  const majorOptions = [
    "Web Development",
    "Mobile Development",
    "Marketing",
    "Animation",
  ];

  const yearOptions = [
    "First Year",
    "Second Year",
    "Third Year",
    "Fourth Year",
  ];

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
        setEditedData(userData);
        setAvatarPreview(
          userData.avatar_link || userData.avatar || "/schoolimg.jpg"
        );
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(userData);
    setAvatarPreview(
      userData?.avatar_link || userData?.avatar || "/schoolimg.jpg"
    );
    setAvatarFile(null);
  };

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const info = {
        id: userId,
        username: editedData?.username || "",
        email: editedData?.email || "",
        Faculty: editedData?.Faculty || "",
        Major: editedData?.Major || "",
        Year: editedData?.Year || "",
        friends: editedData?.friends || [],
      };
      const formData = new FormData();
      formData.append("info", JSON.stringify(info));
      if (avatarFile) {
        formData.append("file", avatarFile);
      }
      const response = await axios.post(
        `${BASEURL}/api/update/user/img`,
        formData,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 200) {
        // Gọi lại getUserData để lấy dữ liệu mới nhất (bao gồm friends)
        await getUserData();
        setIsEditing(false);
        setAvatarFile(null);
        setShowSuccessDialog(true); // Hiện dialog thông báo đã lưu
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof UserdataProps, value: string) => {
    if (editedData) {
      setEditedData({
        ...editedData,
        [field]: value,
      });
    }
  };

  const getCurrentAvatarUrl = () => {
    if (isEditing) {
      return avatarPreview;
    } else {
      return userData?.avatar_link || userData?.avatar || "/schoolimg.jpg";
    }
  };

  const getUserPost = async () => {
    try {
      const userId = localStorage.getItem("userId");
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
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    getUserData();
    getUserPost();
  }, []);

  // Khi userData và posts đã load xong thì tắt loading
  useEffect(() => {
    if (userData && posts) {
      setIsInitialLoading(false);
    }
  }, [userData, posts]);

  const LoadingContent = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
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

  return (
    <div className="min-h-screen bg-[#F1F1E6]">
      <NavigationBar />

      {/* Main Container with improved spacing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-[7vh] pb-8">
        {isInitialLoading ? (
          <LoadingContent />
        ) : (
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Enhanced Sidebar */}
            <div className="w-full lg:w-72 space-y-4 lg:sticky lg:top-[7vh] lg:h-fit">
              {/* Profile Card with Glassmorphism Effect */}
              <div className="profile-card group bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-4 transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] hover:bg-white/80">
                <div className="text-center mb-4">
                  <div className="relative inline-block">
                    <div
                      className={`relative w-20 h-20 mx-auto mb-3 rounded-full bg-[#0694FA] p-1 transition-all duration-300 ${
                        isEditing
                          ? "cursor-pointer hover:scale-110 hover:rotate-3"
                          : ""
                      }`}
                      onClick={handleAvatarClick}
                    >
                      <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                        <Image
                          src={getCurrentAvatarUrl()}
                          alt="User Avatar"
                          className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-110"
                          width={160}
                          height={160}
                          quality={95}
                          priority
                          unoptimized={getCurrentAvatarUrl().startsWith(
                            "data:"
                          )}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/schoolimg.jpg";
                          }}
                        />
                      </div>
                      {isEditing && (
                        <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                          <Camera
                            size={16}
                            className="text-white drop-shadow-lg"
                          />
                        </div>
                      )}
                    </div>
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
                      value={editedData?.username || ""}
                      onChange={(e) =>
                        handleInputChange("username", e.target.value)
                      }
                      className="text-lg font-bold text-center bg-transparent border-b-2 border-[#0694FA]/50 focus:border-[#0694FA] outline-none w-full pb-1 transition-colors duration-300"
                    />
                  ) : (
                    <h2 className="text-lg font-bold text-gray-800 mb-1 transition-colors duration-300 text-shadow flex items-center justify-center gap-2">
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
                  )}

                  <p className="text-xs text-gray-600 mb-3 flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#0694FA] rounded-full animate-pulse"></span>
                    {userData?.email}
                  </p>

                  {/* Stats Row */}
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
                        {posts.reduce(
                          (acc, post) => acc + post.likes.length,
                          0
                        )}
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
                </div>

                {/* Enhanced Info Sections */}
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
                    {isEditing ? (
                      <Select
                        value={editedData?.Faculty}
                        onValueChange={(value) =>
                          handleInputChange("Faculty", value)
                        }
                      >
                        <SelectTrigger className="w-full border-0 bg-white/50 focus:bg-white transition-colors duration-300">
                          <SelectValue placeholder="Chọn khoa" />
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
                      <p className="text-sm text-[#1E293B] font-medium">
                        {userData?.Faculty}
                      </p>
                    )}
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
                    {isEditing ? (
                      <Select
                        value={editedData?.Major}
                        onValueChange={(value) =>
                          handleInputChange("Major", value)
                        }
                      >
                        <SelectTrigger className="w-full border-0 bg-white/50 focus:bg-white transition-colors duration-300">
                          <SelectValue placeholder="Chọn chuyên ngành" />
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
                      <p className="text-sm text-[#1E293B] font-medium">
                        {userData?.Major}
                      </p>
                    )}
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
                    {isEditing ? (
                      <Select
                        value={editedData?.Year}
                        onValueChange={(value) =>
                          handleInputChange("Year", value)
                        }
                      >
                        <SelectTrigger className="w-full border-0 bg-white/50 focus:bg-white transition-colors duration-300">
                          <SelectValue placeholder="Chọn năm học" />
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
                      <p className="text-sm text-[#1E293B] font-medium">
                        {userData?.Year}
                      </p>
                    )}
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

                {/* Enhanced Action Buttons */}
                <div className="flex justify-center gap-2 mt-4">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-[#0694FA] hover:bg-[#0694FA]/90 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
                      >
                        <Save size={14} />
                        {isSaving ? "Đang lưu..." : "Lưu"}
                      </Button>
                      <Button
                        onClick={handleCancel}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <X size={14} />
                        Hủy
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleEdit}
                      className="bg-[#0694FA] hover:bg-[#0694FA]/90 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Edit3 size={14} />
                      Chỉnh sửa hồ sơ
                    </Button>
                  )}
                </div>
              </div>

              {/* Enhanced Friends Section */}
              <div className="friends-card bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden transition-all duration-500 hover:shadow-2xl">
                <div className="bg-[#1E293B] px-4 py-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white flex items-center gap-2 text-base">
                      <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                        <Users size={14} className="text-white" />
                      </div>
                      Bạn bè
                    </h3>
                    <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                      {userData?.friends?.length || 0}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  {(userData?.friends?.length || 0) === 0 ? (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users size={20} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-xs">
                        Chưa có bạn bè nào
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="friends-grid grid grid-cols-3 gap-3">
                        {userData?.friends?.slice(0, 9).map((friend, index) => (
                          <button
                            onClick={() => {
                              localStorage.setItem(
                                "profileData",
                                JSON.stringify(friend)
                              );
                              router.push(`/user/profile/${friend._id}`);
                            }}
                            key={friend._id}
                            className="friend-avatar group flex flex-col items-center p-2 rounded-xl transition-all duration-300 hover:bg-[#F5F9FF] hover:shadow-md transform hover:scale-105"
                            style={{
                              animationDelay: `${index * 100}ms`,
                            }}
                          >
                            <div className="relative w-12 h-12 mb-1">
                              <div className="w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-md group-hover:shadow-lg transition-all duration-300">
                                <Image
                                  src={friend.avatar_link || "/schoolimg.jpg"}
                                  alt={friend.username}
                                  width={96}
                                  height={96}
                                  quality={90}
                                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "/schoolimg.jpg";
                                  }}
                                />
                              </div>
                            </div>
                            <span className="text-xs font-medium text-gray-700 text-center truncate w-full group-hover:text-[#0694FA] transition-colors duration-300">
                              {friend.username}
                            </span>
                          </button>
                        ))}
                      </div>

                      {(userData?.friends?.length || 0) > 9 && (
                        <div className="mt-4 text-center">
                          <button className="text-[#0694FA] hover:text-[#1E293B] text-xs font-medium transition-colors duration-300 hover:underline">
                            Xem thêm {(userData?.friends?.length || 0) - 9} bạn
                            bè...
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Main Content - Posts Section */}
            <div className="flex-1 space-y-4">
              {/* Enhanced Header */}
              <div className="bg-[#1E293B] px-8 py-6 flex items-center justify-between rounded-2xl shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <MessageCircle size={20} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white text-shadow">
                      Bài viết của bạn
                    </h1>
                    <p className="text-white/80 text-sm">
                      {posts.length} bài viết đã đăng
                    </p>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="profile-stats hidden md:flex gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-center transition-all duration-300 hover:bg-white/30">
                    <div className="text-white font-bold text-lg">
                      {posts.length}
                    </div>
                    <div className="text-white/80 text-xs">Bài viết</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-center transition-all duration-300 hover:bg-white/30">
                    <div className="text-white font-bold text-lg flex items-center justify-center gap-1">
                      <Heart size={14} />
                      {posts.reduce((acc, post) => acc + post.likes.length, 0)}
                    </div>
                    <div className="text-white/80 text-xs">Lượt thích</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-center transition-all duration-300 hover:bg-white/30">
                    <div className="text-white font-bold text-lg flex items-center justify-center gap-1">
                      <MessageCircle size={14} />
                      {posts.reduce(
                        (acc, post) => acc + post.comments.length,
                        0
                      )}
                    </div>
                    <div className="text-white/80 text-xs">Bình luận</div>
                  </div>
                </div>
              </div>

              {/* Posts Container */}
              <div className="space-y-6">
                {posts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center min-h-[400px] bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
                    <div className="w-32 h-32 bg-[#F1F1E6] rounded-full flex items-center justify-center mb-6 shadow-lg hover-lift">
                      <MessageCircle size={48} className="text-[#0694FA]" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2 text-shadow">
                      Chưa có bài viết nào
                    </h3>
                    <p className="text-gray-500 max-w-md leading-relaxed">
                      Bạn chưa tạo bài viết nào. Hãy chia sẻ những suy nghĩ và
                      khoảnh khắc đáng nhớ của bạn với mọi người!
                    </p>
                    <button
                      onClick={() => router.push("/home")}
                      className="mt-6 px-6 py-3 bg-[#0694FA] hover:bg-[#0694FA]/90 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      Tạo bài viết đầu tiên
                    </button>
                  </div>
                ) : (
                  <>
                    {posts.map((post, index) => (
                      <div
                        key={post._id}
                        style={{
                          animation: `fadeInUp 0.6s ease-out ${
                            index * 100
                          }ms both`,
                        }}
                      >
                        <RenderPost
                          post={post}
                          userData={post.userInfo || " "}
                          onDelete={getUserPost}
                        />
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
          <div className="text-center p-6">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-green-500 text-lg font-bold">✓</span>
              </div>
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-800 mb-3 text-shadow">
                Cập nhật thành công!
              </DialogTitle>
              <DialogDescription className="text-gray-600 leading-relaxed">
                Thông tin cá nhân của bạn đã được lưu thành công. Các thay đổi
                sẽ được hiển thị ngay lập tức.
              </DialogDescription>
            </DialogHeader>
            <button
              onClick={() => setShowSuccessDialog(false)}
              className="mt-8 w-full px-6 py-3 bg-[#0694FA] hover:bg-[#0694FA]/90 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 btn-gradient"
            >
              Đóng
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Additional inline styles for scrolling */}
      <style jsx>{`
        /* Remove custom scrollbar styles since we're using browser scroll now */

        /* Fade in animation for posts */
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
      `}</style>
    </div>
  );
};

export default UserProfilePage;
