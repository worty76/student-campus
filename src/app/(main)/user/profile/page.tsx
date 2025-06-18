'use client'
import React, { useEffect, useState, useRef } from 'react';
import {  Mail, FileText, Lock, Globe, Edit3, Save, X, Camera, Upload } from 'lucide-react';
import NavigationBar from '@/app/(main)/layouts/navbar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import axios from 'axios';
import { useWebSocket } from '@/app/constants/websocket.contex';
interface UserdataProps {
   id?: string,
   username: string,
   Year: string,
   Major: string,
   email: string,
   Faculty: string,
   avatar?: string,
   avatar_link?: string, // Match backend field
   interest?: string[]
}

const UserProfilePage = () => {
  
  const [userData, setUserData] = useState<UserdataProps | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<UserdataProps | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { sendMessage, status } = useWebSocket();
  // Options for select dropdowns
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
  
  

  const createFriendRequest = () => {
    console.log('WebSocket status:', status);
    const fromid = localStorage.getItem('userId')
    const toid = '684ff70ccca78e5425b09cc2'
    sendMessage({
      type: 'friend_request',
      from: fromid || '123',
      to: toid || '123',
    });
  }

  
  const getUserData = async() => {
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const userId = localStorage.getItem('userId')

      const response = await axios.get('http://localhost:3001/api/get/userinfo/'+userId, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        }
      });
      if (response.status === 200) {
        console.log("User info:", response.data);
        const userData = response.data.resUser;
        setUserData(userData);
        setEditedData(userData);
        setAvatarPreview(userData.avatar_link)
        // Set avatar preview from user data or default
        const avatarUrl = userData.avatar_link || userData.avatar || '/schoolimg.jpg';
        setAvatarPreview(avatarUrl);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  const handleEdit = () => {
    setIsEditing(true);
  }

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(userData); // Reset to original data
    // Reset avatar preview to original user data
    const originalAvatar = userData?.avatar_link || userData?.avatar || '/schoolimg.jpg';
    setAvatarPreview(originalAvatar);
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
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (e.g., 5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setAvatarFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  const handleSave = async() => {
    setIsSaving(true);
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const userId = localStorage.getItem('userId');

      // Prepare the info object to match backend expectations
      const info = {
        id: userId,
        username: editedData?.username || '',
        email: editedData?.email || '',
        Faculty: editedData?.Faculty || '',
        Major: editedData?.Major || '',
        Year: editedData?.Year || '',
        interest: editedData?.interest || []
      };

      // Create FormData to send both file and data
      const formData = new FormData();
      formData.append('info', JSON.stringify(info));
      
      // Add file if selected
      if (avatarFile) {
        formData.append('file', avatarFile);
      }

      const response = await axios.post('http://localhost:3001/api/update/user/img', formData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        console.log("Update response:", response.data);
        
        // Update local state with the returned user data
        const updatedUser = response.data.user;
        setUserData(updatedUser);
        setEditedData(updatedUser);
        
        // Update avatar preview with new avatar link if available
        const newAvatarUrl = updatedUser.avatar_link || updatedUser.avatar || '/schoolimg.jpg';
        setAvatarPreview(newAvatarUrl);
        
        setIsEditing(false);
        setAvatarFile(null);
        console.log("User info updated successfully");
        
        // Optional: Show success message
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error("Error updating user data:", error);
      alert('Error updating profile. Please try again.');
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

  // Get the current avatar URL to display
  const getCurrentAvatarUrl = () => {
    if (isEditing) {
      return avatarPreview; // Use preview in edit mode (could be new file or original)
    } else {
      return userData?.avatar_link || userData?.avatar || '/schoolimg.jpg'; // Use original data in view mode
    }
  }

  useEffect(() => {
    getUserData();
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-0">
      <NavigationBar />
      <div
        className="flex flex-col lg:flex-row gap-[2%] max-w-[95vw] mx-auto relative min-h-[80vh]"
        style={{ top: '10vh' }}
      >
        {/* Student Info Column */}
        {userData && editedData && (
          <div className="w-full lg:w-[26%] mb-[2%] lg:mb-0 flex flex-col h-full">
            <div className="flex-1 bg-white bg-opacity-80 rounded-lg shadow-lg p-[6%] flex flex-col justify-between h-full">
              {/* Profile Header */}
              <div className="text-center mb-[6%]">
                <div className="relative inline-block mb-[4%]">
                  <div 
                    className={`w-[60%] aspect-square max-w-[160px] min-w-[80px] bg-gray-800 rounded-full flex items-center justify-center overflow-hidden mx-auto relative ${
                      isEditing ? 'cursor-pointer hover:opacity-80' : ''
                    }`}
                    onClick={handleAvatarClick}
                  >
                    <Image
                      src={getCurrentAvatarUrl()}
                      alt="User Avatar"
                      className="w-full h-full object-cover rounded-full"
                      width={160}
                      height={160}
                      onError={(e) => {
                        // Fallback if image fails to load
                        (e.target as HTMLImageElement).src = '/schoolimg.jpg';
                      }}
                    />
                    {isEditing && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Camera size={24} className="text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  
                  {isEditing && (
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg"
                      size="sm"
                    >
                      <Upload size={16} />
                    </Button>
                  )}
                </div>

                {/* Editable Username */}
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="text-[2vw] min-text-xl font-bold text-gray-900 mb-[2%] text-center bg-transparent border-b-2 border-blue-300 focus:border-blue-500 outline-none w-full"
                  />
                ) : (
                  <h1 className="text-[2vw] min-text-xl font-bold text-gray-900 mb-[2%]">{userData.username}</h1>
                )}

                <div className="flex items-center justify-center gap-[2%] mb-[4%] flex-wrap">
                  <Button
                  onClick={createFriendRequest}
                  className="bg-green-500 hover:bg-green-600 text-white px-[8%] py-[2%] rounded-lg flex items-center gap-2 text-[1vw] min-text-xs">
                    <Edit3 size={16} />
                    Add Friend
                  </Button>
                </div>
                
                {/* Edit/Save/Cancel Buttons */}
                <div className="flex justify-center gap-2">
                  {isEditing ? (
                    <>
                      <Button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-[8%] py-[2%] rounded-lg flex items-center gap-2 text-[1vw] min-text-xs"
                      >
                        <Save size={16} />
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button 
                        onClick={handleCancel}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-[8%] py-[2%] rounded-lg flex items-center gap-2 text-[1vw] min-text-xs"
                      >
                        <X size={16} />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={handleEdit}
                      className="bg-green-500 hover:bg-green-600 text-white px-[8%] py-[2%] rounded-lg flex items-center gap-2 text-[1vw] min-text-xs"
                    >
                      <Edit3 size={16} />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-[3%] mb-[6%]">
                <div className="flex items-center gap-[3%] text-blue-600 text-[1vw] min-text-xs">
                  <Mail size={16} />
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="bg-transparent border-b border-blue-300 focus:border-blue-500 outline-none flex-1"
                    />
                  ) : (
                    <span>{userData.email}</span>
                  )}
                </div>
              </div>

              {/* Study Info */}
              <div className="mb-[6%]">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Faculty:</label>
                      <Select value={editedData.Faculty} onValueChange={(value) => handleInputChange('Faculty', value)}>
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
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Major:</label>
                      <Select value={editedData.Major} onValueChange={(value) => handleInputChange('Major', value)}>
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
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Year:</label>
                      <Select value={editedData.Year} onValueChange={(value) => handleInputChange('Year', value)}>
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
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="font-semibold text-gray-900 mb-[2%] text-[1.1vw] min-text-sm">Studying: {userData.Faculty}</h3>
                    <p className="text-gray-600 text-[1vw] min-text-xs">Major: {userData.Major}</p>
                    <h3 className="font-semibold text-gray-900 mb-[2%] text-[1.1vw] min-text-sm">{userData.Year}</h3>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Post Info Column */}
        <div className="w-full lg:w-[72%] h-full flex flex-col">
          {/* Posts Header */}
          <div className="bg-white bg-opacity-80 rounded-lg shadow-lg p-[4%] mb-[2%] flex items-center justify-between">
            <h2 className="text-[1.3vw] min-text-base font-semibold text-gray-900">POSTS</h2>
            <Button className="bg-green-500 hover:bg-green-600 text-white font-semibold flex items-center gap-2 text-[1vw] min-text-xs px-[6%] py-[2%]">
              + Post
            </Button>
          </div>
          {/* Posts List */}
          <div className="space-y-[2%] flex-1">
            {/* Post 1 */}
            <div className="bg-white rounded-lg shadow-sm p-[4%]">
              <div className="flex items-start justify-between mb-[4%]">
                <div className="flex items-center gap-[3%]">
                   <Image
                      src="/schoolimg.jpg"
                      alt="Post thumbnail"
                      width={60}
                      height={60}
                      className="text-gray-600"
                    />
                  <h3 className="text-[1.1vw] min-text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
                    Look at this image of Exeter Cathedral!!!!!!!!
                  </h3>
                </div>
                <div className="flex items-center gap-[2%] text-[0.9vw] min-text-xs text-gray-500">
                  <span>11-03-21</span>
                  <div className="flex items-center gap-1">
                    <Globe size={14} />
                    <span>Public</span>
                  </div>
                </div>
              </div>
            <p className="text-gray-700 text-[1vw] min-text-xs">It&apos;s so cooooool</p>
            </div>
            {/* Post 2 */}
            <div className="bg-white rounded-lg shadow-sm p-[4%]">
              <div className="flex items-start justify-between mb-[4%]">
                <div className="flex items-center gap-[3%]">
                  <FileText className="text-gray-600" size={20} />
                  <h3 className="text-[1.1vw] min-text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
                    Note to self
                  </h3>
                </div>
                <div className="flex items-center gap-[2%] text-[0.9vw] min-text-xs text-gray-500">
                  <span>11-03-21</span>
                  <div className="flex items-center gap-1">
                    <Lock size={14} />
                    <span>Private</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 text-[1vw] min-text-xs">Remember to post that youtube link later!</p>
            </div>
           
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;