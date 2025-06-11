import React from 'react';
import { Calendar, Mail, User, FileText, Code, Waves, Brain, Lock, Globe, Edit3 } from 'lucide-react';
import NavigationBar from '@/app/layouts/navbar';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
const UserProfilePage = () => {
  return (
   <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-0">
      <NavigationBar />
      <div
        className="flex flex-col lg:flex-row gap-[2%] max-w-[95vw] mx-auto relative min-h-[80vh]"
        style={{ top: '10vh' }}
      >
        {/* Student Info Column */}
        <div className="w-full lg:w-[26%] mb-[2%] lg:mb-0 flex flex-col h-full">
          <div className="flex-1 bg-white bg-opacity-80 rounded-lg shadow-lg p-[6%] flex flex-col justify-between h-full">
            {/* Profile Header */}
            <div className="text-center mb-[6%]">
              <div className="relative inline-block mb-[4%]">
                <div className="w-[60%] aspect-square max-w-[160px] min-w-[80px] bg-gray-800 rounded-full flex items-center justify-center overflow-hidden mx-auto">
                  {/* Pepe-style avatar */}
                  <Image
                    src="/schoolimg.jpg"
                    alt="User Avatar"
                    className="w-[85%] h-[85%] object-cover rounded-full"
                    width={160}
                    height={160}
                  />
                </div>
              </div>
              <h1 className="text-[2vw] min-text-xl font-bold text-gray-900 mb-[2%]">First Student</h1>
              <div className="flex items-center justify-center gap-[2%] mb-[4%] flex-wrap">
                <span className="bg-blue-100 text-blue-600 px-[6%] py-[2%] rounded text-[1vw] min-text-xs font-medium">@student1</span>
                <span className="bg-gray-100 text-gray-600 px-[6%] py-[2%] rounded text-[1vw] min-text-xs">student</span>
              </div>
              <div className="flex justify-center">
                <Button className="bg-green-500 hover:bg-green-600 text-white px-[8%] py-[2%] rounded-lg flex items-center gap-2 text-[1vw] min-text-xs">
                  <Edit3 size={16} />
                  Edit Profile
                </Button>
              </div>
            </div>
            {/* Basic Info */}
            <div className="space-y-[3%] mb-[6%]">
              <div className="flex items-center gap-[3%] text-gray-700 text-[1vw] min-text-xs">
                <User size={16} />
                <span>Female</span>
              </div>
              <div className="flex items-center gap-[3%] text-gray-700 text-[1vw] min-text-xs">
                <Calendar size={16} />
                <span>2001-04-15 (19 years old)</span>
              </div>
              <div className="flex items-center gap-[3%] text-blue-600 text-[1vw] min-text-xs">
                <Mail size={16} />
                <span>student1@exeter.ac.uk</span>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mb-[6%]">
              <div className="flex justify-between text-[1vw] min-text-xs text-gray-600 mb-[2%]">
                <span>Level 6</span>
                <span>(25/175)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-[0.6vw] min-h-[8px]">
                <div className="bg-red-500 h-full rounded-full" style={{ width: '14%' }}></div>
              </div>
            </div>
            {/* Study Info */}
            <div className="mb-[6%]">
              <h3 className="font-semibold text-gray-900 mb-[2%] text-[1.1vw] min-text-sm">Studying: Computer Science BSc</h3>
              <p className="text-gray-600 text-[1vw] min-text-xs">Aspiring software engineer.</p>
            </div>
            {/* HOBBIES */}
            <div className="mb-[6%]">
              <h3 className="font-semibold text-gray-900 mb-[3%] text-[1.1vw] min-text-sm">HOBBIES</h3>
              <div className="flex flex-wrap gap-[2%]">
                <span className="bg-teal-500 text-white px-[6%] py-[2%] rounded-full text-[1vw] min-text-xs flex items-center gap-1">
                  <Code size={14} />
                  Code
                </span>
                <span className="bg-teal-500 text-white px-[6%] py-[2%] rounded-full text-[1vw] min-text-xs flex items-center gap-1">
                  <Waves size={14} />
                  Swimming
                </span>
              </div>
            </div>
            {/* INTERESTS */}
            <div className="mb-[6%]">
              <h3 className="font-semibold text-gray-900 mb-[3%] text-[1.1vw] min-text-sm">INTERESTS</h3>
              <div className="flex flex-wrap gap-[2%]">
                <span className="bg-purple-500 text-white px-[6%] py-[2%] rounded-full text-[1vw] min-text-xs flex items-center gap-1">
                  <Brain size={14} />
                  Artificial-Intelligence
                </span>
              </div>
            </div>
          </div>
        </div>
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
                      src="/schoolimg.jpg" // Đặt một ảnh mặc định hợp lệ
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