'use client';
import React from "react";
import NavigationBar from "@/app/layouts/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const FriendsNCommunitys = () => {
    return (
        <div className="bg-gradient-to-br from-blue-100 to-blue-300 min-h-screen">
            <NavigationBar />
            <div className="w-4/5 absolute top-[10vh] left-1/2 -translate-x-1/2">
                <Input
                    type="text"
                    placeholder="Search friends or communities..."
                    className="w-full px-3 py-2 rounded border border-blue-300 text-base mb-4 bg-white text-blue-700 placeholder-blue-400"
                />
                <div className="flex gap-4 mb-4">
                    <Select>
                        <SelectTrigger className="w-40 border-blue-300 bg-white text-blue-700">
                            <SelectValue placeholder="Theo khoa" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-blue-700">
                            <SelectItem value="cntt">Công nghệ thông tin</SelectItem>
                            <SelectItem value="kt">Kinh tế</SelectItem>
                            <SelectItem value="yt">Y tế</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select>
                        <SelectTrigger className="w-40 border-blue-300 bg-white text-blue-700">
                            <SelectValue placeholder="Năm học" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-blue-700">
                            <SelectItem value="2021">2021</SelectItem>
                            <SelectItem value="2022">2022</SelectItem>
                            <SelectItem value="2023">2023</SelectItem>
                            <SelectItem value="2024">2024</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select>
                        <SelectTrigger className="w-40 border-blue-300 bg-white text-blue-700">
                            <SelectValue placeholder="Lớp" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-blue-700">
                            <SelectItem value="lop1">Lớp 1</SelectItem>
                            <SelectItem value="lop2">Lớp 2</SelectItem>
                            <SelectItem value="lop3">Lớp 3</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        className="ml-auto border-blue-500 text-blue-700 hover:bg-blue-50"
                        type="button"
                    >
                        Reset
                    </Button>
                </div>
                <hr className="my-4 border-blue-200" />
                <div className="container mx-auto flex flex-row items-center justify-center gap-8">
                    <div className="flex-1 flex flex-col items-center">
                        <Button className="w-full mb-2 bg-blue-500 text-white hover:bg-blue-600" variant="default">
                            Friends
                        </Button>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                        <Button className="w-full mb-2 bg-blue-500 text-white hover:bg-blue-600" variant="default">
                            Communities
                        </Button>
                    </div>
                </div>
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-semibold text-blue-700">Search results:</h2>
                        <div className="flex items-center gap-2">
                        
                        </div>
                    </div>
                    <hr className="border-gray-200" />
                     <ul className="space-y-3">
                <li className="bg-blue-50 rounded-lg p-3 flex flex-col hover:bg-blue-100 transition-colors cursor-pointer">
                  <div className="flex items-center mb-1">
                    <span className="text-lg mr-2">🗨️</span>
                    <span className="font-semibold text-blue-800">IT Q&A</span>
                  </div>
                  <span className="text-xs text-gray-500">1.2k members • 32 new posts</span>
                  <span className="text-sm text-gray-700 mt-1">A place to discuss programming, software, hardware knowledge...</span>
                </li>
                <li className="bg-blue-50 rounded-lg p-3 flex flex-col hover:bg-blue-100 transition-colors cursor-pointer">
                  <div className="flex items-center mb-1">
                    <span className="text-lg mr-2">📚</span>
                    <span className="font-semibold text-blue-800">Study Materials</span>
                  </div>
                  <span className="text-xs text-gray-500">980 members • 12 new posts</span>
                  <span className="text-sm text-gray-700 mt-1">Share documents, books, and course outlines.</span>
                </li>
                <li className="bg-blue-50 rounded-lg p-3 flex flex-col hover:bg-blue-100 transition-colors cursor-pointer">
                  <div className="flex items-center mb-1">
                    <span className="text-lg mr-2">🎮</span>
                    <span className="font-semibold text-blue-800">Entertainment & Events</span>
                  </div>
                  <span className="text-xs text-gray-500">540 members • 5 new posts</span>
                  <span className="text-sm text-gray-700 mt-1">Updates on events, tournaments, and extracurricular activities.</span>
                </li>
                <li className="bg-blue-50 rounded-lg p-3 flex flex-col hover:bg-blue-100 transition-colors cursor-pointer">
                  <div className="flex items-center mb-1">
                    <span className="text-lg mr-2">💼</span>
                    <span className="font-semibold text-blue-800">Jobs & Internships</span>
                  </div>
                  <span className="text-xs text-gray-500">300 members • 2 new posts</span>
                  <span className="text-sm text-gray-700 mt-1">Recruitment info, internships, and interview experiences.</span>
                </li>
              </ul>
                </div>
                 
            </div>
         
                 
         
             
   
        </div>
    );
};

export default FriendsNCommunitys;