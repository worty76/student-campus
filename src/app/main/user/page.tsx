import React from 'react';
import { Calendar, Mail, User, Image, FileText, Users, MessageCircle, Heart, Share2, Award, Code, Waves, Brain, Lock, Globe, Flag, Edit3 } from 'lucide-react';
import NavigationBar from '@/app/components/navbar';
import { Button } from '@/components/ui/button';


const UserProfilePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white bg-opacity-80 rounded-lg shadow-lg p-6">
        
        {/* Left Sidebar - Profile Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            {/* Profile Header */}
            <div className="text-center mb-6">
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
                  {/* Pepe-style avatar */}
                  <div className="w-28 h-28 relative">
                    <div className="absolute inset-0 bg-green-500 rounded-full"></div>
                    <div className="absolute top-6 left-6 w-4 h-4 bg-white rounded-full"></div>
                    <div className="absolute top-6 right-6 w-4 h-4 bg-white rounded-full"></div>
                    <div className="absolute top-7 left-7 w-2 h-2 bg-black rounded-full"></div>
                    <div className="absolute top-7 right-7 w-2 h-2 bg-black rounded-full"></div>
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-orange-600 rounded"></div>
                    <div className="absolute top-4 left-2 w-6 h-3 bg-green-600 rounded-full transform rotate-12"></div>
                    <div className="absolute top-4 right-2 w-6 h-3 bg-green-600 rounded-full transform -rotate-12"></div>
                  </div>
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">First Student</h1>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm font-medium">@student1</span>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-sm">student</span>
                
              </div>
            <div className="flex justify-center">
                <Button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Edit3 size={16} />
                    Edit Profile
                </Button>
            </div>
              
         
            </div>

            {/* Basic Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-gray-700">
                <User size={16} />
                <span>Female</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Calendar size={16} />
                <span>2001-04-15 (19 years old)</span>
              </div>
              <div className="flex items-center gap-3 text-blue-600">
                <Mail size={16} />
                <span>student1@exeter.ac.uk</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Level 6</span>
                <span>(25/175)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{width: '14%'}}></div>
              </div>
            </div>

            {/* Study Info */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Studying: Computer Science BSc</h3>
              <p className="text-gray-600">Aspiring software engineer.</p>
            </div>

            {/* HOBBIES */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">HOBBIES</h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <Code size={14} />
                  Code
                </span>
                <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <Waves size={14} />
                  Swimming
                </span>
              </div>
            </div>

            {/* INTERESTS */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">INTERESTS</h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <Brain size={14} />
                  Artificial-Intelligence
                </span>
              </div>
            </div>

            {/* TOP ACHIEVEMENTS */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">TOP ACHIEVEMENTS</h3>
              <div className="flex gap-2 text-gray-400">
                <Award size={24} />
                <Users size={24} />
                <FileText size={24} />
                <MessageCircle size={24} />
                <Heart size={24} />
                <Share2 size={24} />
              </div>
            </div>

            {/* SOCIALS */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">SOCIALS</h3>
            </div>
          </div>
        </div>

        {/* Right Content - Posts */}
        <div className="lg:col-span-2">
          {/* Posts Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">POSTS</h2>
            <Button className="bg-green-500 hover:bg-green-600 text-white font-semibold flex items-center gap-2">
                + Post
            </Button>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            
            {/* Post 1 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Image className="text-gray-600" size={20} />
                  <h3 className="text-lg font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
                    Look at this image of Exeter Cathedral!!!!!!!!
                  </h3>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>11-03-21</span>
                  <div className="flex items-center gap-1">
                    <Globe size={14} />
                    <span>Public</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700">It's so cooooool</p>
            </div>

            {/* Post 2 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FileText className="text-gray-600" size={20} />
                  <h3 className="text-lg font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
                    Note to self
                  </h3>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>11-03-21</span>
                  <div className="flex items-center gap-1">
                    <Lock size={14} />
                    <span>Private</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700">Remember to post that youtube link later!</p>
            </div>

            {/* Post 3 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FileText className="text-gray-600" size={20} />
                  <h3 className="text-lg font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
                    My review of Exeter Cathedral
                  </h3>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>11-03-21</span>
                  <div className="flex items-center gap-1">
                    <Globe size={14} />
                    <span>Public</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700">
                Come here to say a little prayer every time I visit the town centre Very beautiful and tranquil place was bombed by 
                the Germans during World War Two but luckily the locals rebuilt a lot of the cathedral back to what it was. Great 
                evening out to que...
              </p>
            </div>

          </div>
        </div>
      </div>
      <NavigationBar />
    </div>
  );
};

export default UserProfilePage;
// ...existing code...