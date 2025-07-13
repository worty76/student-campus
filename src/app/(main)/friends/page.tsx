'use client';

import React, { useState, useEffect } from "react";
import NavigationBar from "@/app/(main)/layouts/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {BASEURL} from "@/app/constants/url";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import axios from "axios";
import { useWebSocket } from "@/app/context/websocket.contex";
import { useRouter } from 'next/navigation';

interface SuggestionFriend {
  _id: string;
  username: string;
  Faculty: string;
  Major: string;
  Year: string;
}

interface SearchFriend {
  _id: string;
  username: string;
  Faculty: string;
  Major: string;
  Year: string;
  type: string;
  rqid: string;
  status: string;
}

interface FilterOptions {
  faculty: string;
  year: string;
  class: string;
}

interface FriendRequest {
  _id: string;
  senderId: string;
  receiverId: string;
  username: string;
  avatar_link: string;
  status: string;
}

interface WebSocketMessage {
  type: 'init' |'file_to' |'friend_request' | 'message' | 'accept_request' |'deny_request'| 'likes_post'| 'unlike_post' | 'Comment'|'online_friend' | 'text_to'| 'create_group' | 'leave_group'| 'add_to_group';
  from?: string;
  to?: string;
  message?: string;
  fromName?: string;
  reqid?: string;
  postid?: string;
  context?: string;
  friends?: OnlineFriend[];
  chatid?: string;
  file?: FileData[];
  userIds?: Friends[];
  groupName?: string;
  isGroupChat?: boolean;
}

interface FileData {
  name: string;
  type: string;
  size: number;
  url: string;
}

interface OnlineFriend {
  _id: string;
  username: string;
  avatar_link: string;
  online?: boolean;
}

interface Friends {
  _id: string;
  username: string;
  avatar_link?: string;
}

const FriendsNCommunitys = () => {
  const [searchrs, setSearchrs] = useState(false);
  const [suggestionFriends, setSuggestionFriends] = useState<SuggestionFriend[]>([]);
  const [searcchdata, setSearchsData] = useState<SearchFriend[]>([]);
  const [filteredData, setFilteredData] = useState<SearchFriend[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    faculty: '',
    year: '',
    class: ''
  });
  const [friend_request, setFriendRequests] = useState<FriendRequest[]>([]);
  const { sendMessage, addMessageHandler } = useWebSocket();
  const [queryerror, setQueryerror] = useState(false);
  const router = useRouter();
  
  const [acceptedRequests, setAcceptedRequests] = useState<Set<string>>(new Set());
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [friends, setFriends] = useState<string[]>([]);
  const [handledRequests, setHandledRequests] = useState<Record<string, 'accepted' | 'rejected'>>({});

  useEffect(() => {
    const storedFriends = localStorage.getItem('friends');
    if (storedFriends) {
      try {
        setFriends(JSON.parse(storedFriends));
      } catch {
        setFriends([]);
      }
    }
  }, []);

  useEffect(() => {
    const handler = (message: WebSocketMessage) => {
      if (
        message?.type === "friend_request" ||
        message?.type === "accept_request"
      ) {
        // console.log("Nhận được tin nhắn từ WebSocket:", message);
        getlistfriendrq();  
        getSuggestionsFriend();
      }
    };

    const removeHandler = addMessageHandler(handler);
    return removeHandler;
  }, [addMessageHandler]);
  
  useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
      }
    }, []);
  useEffect(() => {
    getSuggestionsFriend();
    getlistfriendrq();
  }, []);

  useEffect(() => {
    const filtered = searcchdata.filter(friend => {
      return (
        (!filters.faculty || friend.Faculty.toLowerCase().includes(filters.faculty.toLowerCase())) &&
        (!filters.year || friend.Year.toString() === filters.year)
      );
    });
    setFilteredData(filtered);
  }, [filters, searcchdata]);

  const getSuggestionsFriend = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!userId) return;

      const response = await axios.get(`${BASEURL}/api/get/hint/friend/${userId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        }
      });

      if (response.data?.suggestions) {
        setSuggestionFriends(response.data.suggestions);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchFriend = async () => {
    if (!query) {
      setQueryerror(true);
    } else {
      try {
        setQueryerror(false);
        setLoading(true);
        const token = localStorage.getItem('token');
        const id = localStorage.getItem('userId');
        const response = await axios.post(`http://localhost:3001/api/user/search`, { query: query, id: id }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // console.log(response.data);
        setSearchrs(true);
        setSearchsData(response.data.results);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFilterChange = (filterType: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      faculty: '',
      year: '',
      class: ''
    });
    setSearchrs(false);
    setSearchsData([]);
    setFilteredData([]);
    setQuery('');
    setAcceptedRequests(new Set());
  };

  const handleSendFriendRequest = async (receiverId: string) => {
    try {
      // console.log('WebSocket status:', status);
      const fromid = localStorage.getItem('userId');
      const toid = receiverId;
      sendMessage({
        type: 'friend_request',
        from: fromid || '123',
        to: toid || '123',
      });
      setSentRequests(prev => new Set(prev).add(receiverId));
    } catch (err) {
      console.error("Gửi kết bạn thất bại:", err);
      alert("Lỗi khi gửi lời mời kết bạn.");
    }
  };

  const handleAcceptFriendRequest = async (receiverId: string, reqid: string) => {
    try {
      const fromid = localStorage.getItem('userId');
      const toid = receiverId;
      const rqid = reqid;
      sendMessage({
        type: 'accept_request',
        from: fromid || '123',
        to: toid || '123',
        reqid: rqid || '123'
      });
      setAcceptedRequests(prev => new Set(prev).add(receiverId));
      setHandledRequests(prev => ({ ...prev, [reqid]: 'accepted' }));
    } catch (err) {
      console.error("Gửi kết bạn thất bại:", err);
      alert("Lỗi khi chấp nhận kết bạn.");
    }
  };

  const handleRejectFriendRequest = async (friendId: string, reqid: string) => {
    try {
      const fromid = localStorage.getItem('userId');
      const toid = friendId;
      const rqid = reqid;
      sendMessage({
        type: 'deny_request',
        from: fromid || '123',
        to: toid || '123',
        reqid: rqid || '123'
      });
      setHandledRequests(prev => ({ ...prev, [reqid]: 'rejected' }));
      setSearchrs(false);
      setSearchsData([]);
    } catch (err) {
      console.error("Gửi kết bạn thất bại:", err);
      alert("Lỗi khi chấp nhận kết bạn.");
    }
  };
  
  const getlistfriendrq = async () => {
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!userId) return;

      const response = await axios.post(`${BASEURL}/api/get/list-friend`, {id: userId}, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        }
      });
      if (response) {
        // console.log(response.data.data)
        setFriendRequests(response.data.data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const isSearchFriend = (friend: SuggestionFriend | SearchFriend): friend is SearchFriend => {
    return 'type' in friend;
  };

  const renderFriendButton = (friend: SuggestionFriend | SearchFriend) => {
    if (friends.includes(friend._id)) {
      return (
        <Button
          disabled
          className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-2 sm:px-3 lg:px-5 py-1 sm:py-2 rounded-xl cursor-not-allowed text-xs sm:text-sm font-semibold shadow-lg"
          size="sm"
        >
          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="hidden sm:inline">Bạn Bè</span>
          <span className="sm:hidden">Bạn bè</span>
        </Button>
      );
    } 
    if (searchrs && isSearchFriend(friend)) {
      if (acceptedRequests.has(friend._id)) {
        return (
          <Button
            disabled
            className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-2 sm:px-3 lg:px-5 py-1 sm:py-2 rounded-xl cursor-not-allowed text-xs sm:text-sm font-semibold shadow-lg"
            size="sm"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="hidden sm:inline">Đã chấp nhận</span>
            <span className="sm:hidden">Đã OK</span>
          </Button>
        );
      }

      if (friend.type === 'sender' && friend.status === "pending") {
        return (
          <Button
            disabled
            className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-2 sm:px-3 lg:px-5 py-1 sm:py-2 rounded-xl cursor-not-allowed text-xs sm:text-sm font-semibold shadow-lg"
            size="sm"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">Đã gửi lời mời</span>
            <span className="sm:hidden">Đã gửi</span>
          </Button>
        );
      } else if (friend.type === 'receiver') {
        return (
          <div className="flex space-x-1 sm:space-x-2 lg:space-x-3">
            <Button
              onClick={() => handleAcceptFriendRequest(friend._id, friend.rqid)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 px-2 sm:px-3 lg:px-4 py-1 sm:py-2 rounded-xl text-xs sm:text-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
              size="sm"
              disabled={acceptedRequests.has(friend._id)}
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {acceptedRequests.has(friend._id) ? (
                <>
                  <span className="hidden sm:inline">Đã chấp nhận</span>
                  <span className="sm:hidden">OK</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Chấp nhận</span>
                  <span className="sm:hidden">OK</span>
                </>
              )}
            </Button>
            <Button
              onClick={() => handleRejectFriendRequest(friend._id, friend.rqid)}
              className="bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 px-2 sm:px-3 lg:px-4 py-1 sm:py-2 rounded-xl text-xs sm:text-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
              size="sm"
              disabled={acceptedRequests.has(friend._id)}
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="hidden sm:inline">Từ chối</span>
              <span className="sm:hidden">Từ chối</span>
            </Button>
          </div>
        );
      } else if (friend.status === "accepted" && friend.type === 'sender') {
        return (
          <Button
            disabled
            className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-2 sm:px-3 lg:px-5 py-1 sm:py-2 rounded-xl cursor-not-allowed text-xs sm:text-sm font-semibold shadow-lg"
            size="sm"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="hidden sm:inline">Bạn Bè</span>
            <span className="sm:hidden">Bạn bè</span>
          </Button>
        );
      } else if (sentRequests.has(friend._id)) {
        return (
          <Button
            disabled
            className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-2 sm:px-3 lg:px-5 py-1 sm:py-2 rounded-xl cursor-not-allowed text-xs sm:text-sm font-semibold shadow-lg"
            size="sm"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">Đã gửi lời mời</span>
            <span className="sm:hidden">Đã gửi</span>
          </Button>
        );
      } else {
        return (
          <Button
            onClick={() => handleSendFriendRequest(friend._id)}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 px-2 sm:px-3 lg:px-5 py-1 sm:py-2 rounded-xl text-xs sm:text-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            size="sm"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span className="hidden sm:inline">Kết bạn</span>
            <span className="sm:hidden">Kết bạn</span>
          </Button>
        );
      }
    } else {
      if (sentRequests.has(friend._id)) {
        return (
          <Button
            disabled
            className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-2 sm:px-3 lg:px-5 py-1 sm:py-2 rounded-xl cursor-not-allowed text-xs sm:text-sm font-semibold shadow-lg"
            size="sm"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">Đã gửi lời mời</span>
            <span className="sm:hidden">Đã gửi</span>
          </Button>
        );
      }
      return (
        <Button
          onClick={() => handleSendFriendRequest(friend._id)}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 px-2 sm:px-3 lg:px-5 py-1 sm:py-2 rounded-xl text-xs sm:text-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
          size="sm"
        >
          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <span className="hidden sm:inline">Kết bạn</span>
          <span className="sm:hidden">Kết bạn</span>
        </Button>
      );
    }
  };

  const displayData = searchrs ? filteredData : suggestionFriends;

  return (
    <div className="min-h-screen bg-[#F1F1E6]">
      <NavigationBar />
      <div className="container mx-auto relative top-[3vh] sm:top-[5vh] max-w-7xl py-4 sm:py-8 px-2 sm:px-4 lg:px-6">
        <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 lg:gap-8 items-start">
          {/* Sidebar - Bộ lọc */}
          <div className="w-full xl:w-80 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-0 h-auto xl:h-[700px] xl:sticky xl:top-24 flex flex-col mb-4 xl:mb-0 overflow-hidden">
            {/* Header Search */}
            <div className="rounded-t-2xl px-3 sm:px-6 py-3 sm:py-5 bg-[#0694FA] text-white">
              <h3 className="text-lg sm:text-xl font-bold mb-0 flex items-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-white drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden sm:inline">Tìm kiếm bạn bè</span>
                <span className="sm:hidden">Tìm kiếm</span>
              </h3>
            </div>
            <div className="px-3 sm:px-6 py-4 sm:py-6">
              <Input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleSearchFriend();
                  }
                }}
                placeholder="Nhập tên để tìm kiếm..."
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-sm sm:text-base mb-3 sm:mb-4 bg-gray-50/80 border-2 transition-all duration-300 focus:scale-[1.02] focus:shadow-lg
                  ${queryerror ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:bg-white'}`}
              />
              {queryerror && (
                <div className="text-red-500 text-xs sm:text-sm mt-2 flex items-center bg-red-50 p-2 sm:p-3 rounded-lg border border-red-200">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Vui lòng nhập từ khóa tìm kiếm
                </div>
              )}
              <Button
                onClick={handleSearchFriend}
                className="w-full bg-[#0694FA] hover:bg-[#1E293B] text-white py-2 sm:py-3 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-sm sm:text-base"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent mr-1 sm:mr-2"></div>
                    <span className="hidden sm:inline">Đang tìm...</span>
                    <span className="sm:hidden">Tìm...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Tìm kiếm
                  </div>
                )}
              </Button>
            </div>

            {/* Header Bộ lọc */}
            <div className="px-3 sm:px-6 py-3 sm:py-5 bg-[#1E293B] text-white border-t border-white/20">
              <h3 className="text-lg sm:text-xl font-bold mb-0 flex items-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-white drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Bộ lọc
              </h3>
            </div>
            <div className="px-3 sm:px-6 py-4 sm:py-6 flex-1 overflow-y-auto xl:max-h-[400px]">
              <div className="space-y-4 sm:space-y-6">
                <div className="group">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3  transition-colors">Khoa</label>
                  <Select
                    value={filters.faculty || 'all'}
                    onValueChange={value => handleFilterChange('faculty', value === 'all' ? '' : value)}
                  >
                    <SelectTrigger className="w-full border-gray-200 bg-gray-50/80 hover:bg-white transition-all duration-300 rounded-xl border-2 hover:border-purple-300 focus:border-purple-500 focus:shadow-lg">
                      <SelectValue placeholder="Chọn khoa" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-gray-200 rounded-xl shadow-xl">
                      <SelectItem value="all" className="hover:bg-purple-50">Tất cả khoa</SelectItem>
                      <SelectItem value="Software Engineering" className="hover:bg-purple-50">Software Engineering</SelectItem>
                      <SelectItem value="Artificial Intelligence" className="hover:bg-purple-50">Artificial Intelligence</SelectItem>
                      <SelectItem value="Business Administration" className="hover:bg-purple-50">Business Administration</SelectItem>
                      <SelectItem value="Graphic Design" className="hover:bg-purple-50">Graphic Design</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="group">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3  transition-colors">Chuyên ngành</label>
                  <Select
                    value={filters.class || 'all'}
                    onValueChange={value => handleFilterChange('class', value === 'all' ? '' : value)}
                  >
                    <SelectTrigger className="w-full border-gray-200 bg-gray-50/80 hover:bg-white transition-all duration-300 rounded-xl border-2 hover:border-purple-300 focus:border-purple-500 focus:shadow-lg">
                      <SelectValue placeholder="Chọn chuyên ngành" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-gray-200 rounded-xl shadow-xl">
                      <SelectItem value="all" className="hover:bg-purple-50">Tất cả chuyên ngành</SelectItem>
                      <SelectItem value="Web Development" className="hover:bg-purple-50">Web Development</SelectItem>
                      <SelectItem value="Mobile Development" className="hover:bg-purple-50">Mobile Development</SelectItem>
                      <SelectItem value="Marketing" className="hover:bg-purple-50">Marketing</SelectItem>
                      <SelectItem value="Animation" className="hover:bg-purple-50">Animation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="group">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3  transition-colors">Năm học</label>
                  <Select
                    value={filters.year || 'all'}
                    onValueChange={value => handleFilterChange('year', value === 'all' ? '' : value)}
                  >
                    <SelectTrigger className="w-full border-gray-200 bg-gray-50/80 hover:bg-white transition-all duration-300 rounded-xl border-2 hover:border-purple-300 focus:border-purple-500 focus:shadow-lg">
                      <SelectValue placeholder="Chọn năm học" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-gray-200 rounded-xl shadow-xl">
                      <SelectItem value="all" className="hover:bg-purple-50">Tất cả năm</SelectItem>
                      <SelectItem value="First Year" className="hover:bg-purple-50">First Year</SelectItem>
                      <SelectItem value="Second Year" className="hover:bg-purple-50">Second Year</SelectItem>
                      <SelectItem value="Third Year" className="hover:bg-purple-50">Third Year</SelectItem>
                      <SelectItem value="Fourth Year" className="hover:bg-purple-50">Fourth Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={resetFilters}
                variant="outline"
                className="w-full border-2 border-gray-300 text-gray-700 hover:bg-[#F1F1E6] hover:border-[#1E293B] py-2 sm:py-3 rounded-xl transition-all duration-300 mt-4 sm:mt-6 font-semibold transform hover:scale-[1.02] text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">Đặt lại bộ lọc</span>
                <span className="sm:hidden">Đặt lại</span>
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col gap-4 sm:gap-6 lg:gap-8 h-auto xl:h-[700px]">
            {/* Lời mời kết bạn */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-3 sm:p-4 lg:p-6 flex-1 max-h-[400px] sm:max-h-[350px] xl:max-h-[340px] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1E293B] flex items-center">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 mr-2 sm:mr-3 bg-[#0694FA] rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="hidden sm:inline">Lời mời kết bạn</span>
                  <span className="sm:hidden">Lời mời</span>
                  {friend_request.length > 0 && (
                    <span className="ml-2 sm:ml-3 bg-[#0694FA] text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-semibold shadow-lg animate-pulse">
                      {friend_request.length}
                    </span>
                  )}
                </h2>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                {friend_request.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-gray-500">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">Không có lời mời kết bạn nào</p>
                    <p className="text-xs sm:text-sm text-gray-500">Các lời mời kết bạn sẽ xuất hiện ở đây</p>
                  </div>
                ) : (
                  friend_request.map((req) => (
                    <div
                      key={req._id}
                      className="group flex items-center bg-[#F1F1E6] backdrop-blur-sm rounded-2xl p-3 sm:p-4 lg:p-5 hover:bg-[#F5F9FF] transition-all duration-300 cursor-pointer border border-gray-200 hover:border-[#0694FA] transform hover:scale-[1.02] hover:shadow-lg"
                      onClick={() => router.push(`/user/profile/${req._id}`)}
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-[#0694FA] flex items-center justify-center text-white font-bold text-sm sm:text-lg lg:text-xl mr-3 sm:mr-4 lg:mr-5 shadow-lg group-hover:shadow-xl transform group-hover:scale-110 transition-all duration-300">
                        {req.username?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-gray-800 text-sm sm:text-base lg:text-lg block mb-1 truncate">{req.username}</span>
                        <p className="text-xs sm:text-sm text-gray-600 flex items-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-pink-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span className="hidden sm:inline">Muốn kết bạn với bạn</span>
                          <span className="sm:hidden">Muốn kết bạn</span>
                        </p>
                      </div>
                      <div className="flex gap-2 sm:gap-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
                        {handledRequests[req._id] === 'accepted' ? (
                          <Button disabled className="bg-gray-400 text-white px-3 sm:px-4 lg:px-5 py-1 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold" size="sm">
                            <span className="hidden sm:inline">Đã chấp nhận</span>
                            <span className="sm:hidden">Đã OK</span>
                          </Button>
                        ) : handledRequests[req._id] === 'rejected' ? (
                          <Button disabled className="bg-gray-400 text-white px-3 sm:px-4 lg:px-5 py-1 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold" size="sm">
                            <span className="hidden sm:inline">Đã từ chối</span>
                            <span className="sm:hidden">Đã từ chối</span>
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={() => handleAcceptFriendRequest(req.senderId, req._id)}
                              className="bg-[#0694FA] text-white hover:bg-[#1E293B] px-2 sm:px-3 lg:px-5 py-1 sm:py-2 rounded-xl text-xs sm:text-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                              size="sm"
                            >
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="hidden sm:inline">Chấp nhận</span>
                              <span className="sm:hidden">OK</span>
                            </Button>
                            <Button
                              onClick={() => handleRejectFriendRequest(req.senderId, req._id)}
                              className="bg-gray-500 text-white hover:bg-[#1E293B] px-2 sm:px-3 lg:px-5 py-1 sm:py-2 rounded-xl text-xs sm:text-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                              size="sm"
                            >
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span className="hidden sm:inline">Từ chối</span>
                              <span className="sm:hidden">Từ chối</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Gợi ý kết bạn */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-3 sm:p-4 lg:p-6 flex-1 max-h-[400px] sm:max-h-[350px] xl:max-h-[340px] overflow-y-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1E293B] flex items-center">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 mr-2 sm:mr-3 bg-[#0694FA] rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <span className="hidden sm:inline">{searchrs ? 'Kết quả tìm kiếm' : 'Gợi ý kết bạn'}</span>
                  <span className="sm:hidden">{searchrs ? 'Kết quả' : 'Gợi ý'}</span>
                  {searchrs && (
                    <span className="ml-2 sm:ml-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-semibold shadow-lg">
                      {filteredData.length}
                    </span>
                  )}
                </h2>
                {searchrs && (
                  <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-2 sm:gap-3 flex-wrap">
                    {filters.faculty && (
                      <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full font-medium border border-blue-200 text-xs sm:text-sm">
                        <span className="hidden sm:inline">Khoa: </span>{filters.faculty}
                      </span>
                    )}
                    {filters.year && (
                      <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full font-medium border border-blue-200 text-xs sm:text-sm">
                        <span className="hidden sm:inline">Năm: </span>{filters.year}
                      </span>
                    )}
                    {filters.class && (
                      <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full font-medium border border-blue-200 text-xs sm:text-sm">
                        <span className="hidden sm:inline">Lớp: </span>{filters.class}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                {loading ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6">
                      <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-gray-600 text-base sm:text-lg font-semibold">Đang tải...</p>
                    <p className="text-gray-500 text-xs sm:text-sm mt-2">Vui lòng chờ trong giây lát</p>
                  </div>
                ) : (
                  (query
                    ? displayData.filter(friend =>
                        friend.username.toLowerCase().includes(query.toLowerCase())
                      )
                    : displayData
                  ).length > 0 ? (
                    (query
                      ? displayData.filter(friend =>
                          friend.username.toLowerCase().includes(query.toLowerCase())
                        )
                      : displayData
                    ).map((friend) => (
                      <div
                        key={friend._id}
                        className="group flex items-center bg-[#F1F1E6] backdrop-blur-sm rounded-2xl p-3 sm:p-4 lg:p-5 hover:bg-[#F5F9FF] transition-all duration-300 cursor-pointer border border-gray-200 hover:border-[#0694FA] transform hover:scale-[1.02] hover:shadow-lg"
                        onClick={() => {
                          localStorage.setItem('profileData', JSON.stringify(friend));
                          router.push(`/user/profile/${friend._id}`);
                        }}
                      >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-[#0694FA] flex items-center justify-center text-white font-bold text-sm sm:text-lg lg:text-xl mr-3 sm:mr-4 lg:mr-5 shadow-lg group-hover:shadow-xl transform group-hover:scale-110 transition-all duration-300">
                          {friend.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-gray-800 text-sm sm:text-base lg:text-lg block mb-2 truncate">{friend.username}</span>
                          <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 sm:gap-2 flex-wrap">
                            <span className="bg-gray-200 px-2 sm:px-3 py-1 rounded-full text-xs font-medium border border-gray-200 truncate max-w-[80px] sm:max-w-none">
                              {friend.Faculty}
                            </span>
                            <span className="bg-gray-200 px-2 sm:px-3 py-1 rounded-full text-xs font-medium border border-gray-200 truncate max-w-[80px] sm:max-w-none">
                              {friend.Major}
                            </span>
                            <span className="bg-gradient-to-r from-gray-100 to-gray-200 px-2 sm:px-3 py-1 rounded-full text-xs font-medium border border-gray-200">
                              <span className="hidden sm:inline">Năm </span>{friend.Year}
                            </span>
                          </div>
                        </div>
                        <div className="ml-auto flex-shrink-0" onClick={e => e.stopPropagation()}>
                          {renderFriendButton(friend)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 sm:py-12 text-gray-500">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <p className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
                        {searchrs ? 'Không tìm thấy kết quả phù hợp' : 'Không có gợi ý nào'}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {searchrs ? 'Thử thay đổi từ khóa hoặc bộ lọc' : 'Các gợi ý kết bạn sẽ xuất hiện ở đây'}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendsNCommunitys;