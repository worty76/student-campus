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
          className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed text-sm"
          size="sm"
        >
          Bạn Bè
        </Button>
      );
    } 
    if (searchrs && isSearchFriend(friend)) {
      if (acceptedRequests.has(friend._id)) {
        return (
          <Button
            disabled
            className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed text-sm"
            size="sm"
          >
            Đã chấp nhận
          </Button>
        );
      }

      if (friend.type === 'sender' && friend.status === "pending") {
        return (
          <Button
            disabled
            className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed text-sm"
            size="sm"
          >
            Đã gửi lời mời
          </Button>
        );
      } else if (friend.type === 'receiver') {
        return (
          <div className="flex space-x-2">
            <Button
              onClick={() => handleAcceptFriendRequest(friend._id, friend.rqid)}
              className="bg-green-500 text-white hover:bg-green-600 px-3 py-2 rounded-lg text-sm transition-colors"
              size="sm"
              disabled={acceptedRequests.has(friend._id)}
            >
              {acceptedRequests.has(friend._id) ? 'Đã chấp nhận' : 'Chấp nhận'}
            </Button>
            <Button
              onClick={() => handleRejectFriendRequest(friend._id, friend.rqid)}
              className="bg-red-500 text-white hover:bg-red-600 px-3 py-2 rounded-lg text-sm transition-colors"
              size="sm"
              disabled={acceptedRequests.has(friend._id)}
            >
              Từ chối
            </Button>
          </div>
        );
      } else if (friend.status === "accepted" && friend.type === 'sender') {
        return (
          <Button
            disabled
            className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed text-sm"
            size="sm"
          >
            Bạn Bè
          </Button>
        );
      } else if (sentRequests.has(friend._id)) {
        return (
          <Button
            disabled
            className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed text-sm"
            size="sm"
          >
            Đã gửi lời mời
          </Button>
        );
      } else {
        return (
          <Button
            onClick={() => handleSendFriendRequest(friend._id)}
            className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-lg text-sm transition-colors"
            size="sm"
          >
            Kết bạn
          </Button>
        );
      }
    } else {
      if (sentRequests.has(friend._id)) {
        return (
          <Button
            disabled
            className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed text-sm"
            size="sm"
          >
            Đã gửi lời mời
          </Button>
        );
      }
      return (
        <Button
          onClick={() => handleSendFriendRequest(friend._id)}
          className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-lg text-sm transition-colors"
          size="sm"
        >
          Kết bạn
        </Button>
      );
    }
  };

  const displayData = searchrs ? filteredData : suggestionFriends;

  return (
    <div>
      <NavigationBar />
      <div className="container mx-auto relative top-[5vh] max-w-7xl py-8 px-2 sm:px-4">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Sidebar - Bộ lọc */}
          <div className="w-full lg:w-80 bg-[#F8FAFC] rounded-xl shadow-lg p-0 h-[500px] lg:h-[700px] sticky top-24 flex flex-col mb-6 lg:mb-0">
            {/* Header Search */}
            <div className="rounded-t-xl px-6 py-4 bg-[#E2E8F0]">
              <h3 className="text-lg font-semibold text-[#1D4ED8] mb-0 flex items-center">
                <svg className="w-5 h-5 mr-2 text-[#1D4ED8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Tìm kiếm bạn bè
              </h3>
            </div>
            <div className="px-6 py-4">
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
                className={`w-full px-4 py-3 rounded-lg text-base mb-3 bg-gray-50 border-2 transition-colors
                  ${queryerror ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-blue-300 focus:border-blue-500'}`}
              />
              {queryerror && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Vui lòng nhập từ khóa tìm kiếm
                </p>
              )}
              <Button
                onClick={handleSearchFriend}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors"
                disabled={loading}
              >
                {loading ? 'Đang tìm...' : 'Tìm kiếm'}
              </Button>
            </div>

            {/* Header Bộ lọc */}
            <div className="rounded-t-xl px-6 py-4 bg-[#E0F2FE] border-t border-blue-100">
              <h3 className="text-lg font-semibold text-[#7C3AED] mb-0 flex items-center">
                <svg className="w-5 h-5 mr-2 text-[#7C3AED]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Bộ lọc
              </h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Khoa</label>
                  <Select
                    value={filters.faculty || 'all'}
                    onValueChange={value => handleFilterChange('faculty', value === 'all' ? '' : value)}
                  >
                    <SelectTrigger className="w-full border-gray-200 bg-gray-50 hover:bg-white transition-colors">
                      <SelectValue placeholder="Chọn khoa" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">Tất cả khoa</SelectItem>
                      <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                      <SelectItem value="Artificial Intelligence">Artificial Intelligence</SelectItem>
                      <SelectItem value="Business Administration">Business Administration</SelectItem>
                      <SelectItem value="Graphic Design">Graphic Design</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chuyên ngành</label>
                  <Select
                    value={filters.class || 'all'}
                    onValueChange={value => handleFilterChange('class', value === 'all' ? '' : value)}
                  >
                    <SelectTrigger className="w-full border-gray-200 bg-gray-50 hover:bg-white transition-colors">
                      <SelectValue placeholder="Chọn chuyên ngành" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">Tất cả chuyên ngành</SelectItem>
                      <SelectItem value="Web Development">Web Development</SelectItem>
                      <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Animation">Animation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Năm học</label>
                  <Select
                    value={filters.year || 'all'}
                    onValueChange={value => handleFilterChange('year', value === 'all' ? '' : value)}
                  >
                    <SelectTrigger className="w-full border-gray-200 bg-gray-50 hover:bg-white transition-colors">
                      <SelectValue placeholder="Chọn năm học" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">Tất cả năm</SelectItem>
                      <SelectItem value="First Year">First Year</SelectItem>
                      <SelectItem value="Second Year">Second Year</SelectItem>
                      <SelectItem value="Third Year">Third Year</SelectItem>
                      <SelectItem value="Fourth Year">Fourth Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={resetFilters}
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-2 rounded-lg transition-colors mt-4"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Đặt lại bộ lọc
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col gap-6 h-auto lg:h-[700px]">
            {/* Lời mời kết bạn */}
            <div className="bg-[var(--color-card)] rounded-xl shadow-lg p-4 sm:p-6 flex-1 max-h-[200px] lg:max-h-[220px] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Lời mời kết bạn
                  {friend_request.length > 0 && (
                    <span className="ml-2 bg-pink-100 text-pink-800 text-sm px-2 py-1 rounded-full">
                      {friend_request.length}
                    </span>
                  )}
                </h2>
              </div>
              
              <div className="space-y-3">
                {friend_request.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-lg">Không có lời mời kết bạn nào</p>
                    <p className="text-sm">Các lời mời kết bạn sẽ xuất hiện ở đây</p>
                  </div>
                ) : (
                  friend_request.map((req) => (
                    <div
                      key={req._id}
                      className="flex items-center bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 hover:from-pink-100 hover:to-purple-100 transition-all duration-200 cursor-pointer border border-pink-100"
                      onClick={() => router.push(`/user/profile/${req._id}`)}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg mr-4 shadow-md">
                        {req.username?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-gray-800 text-lg">{req.username}</span>
                        <p className="text-sm text-gray-600">Muốn kết bạn với bạn</p>
                      </div>
                      <div className="flex gap-3" onClick={e => e.stopPropagation()}>
                        {handledRequests[req._id] === 'accepted' ? (
                          <Button disabled className="bg-gray-400 text-white px-4 py-2 rounded-lg text-sm" size="sm">
                            Đã chấp nhận
                          </Button>
                        ) : handledRequests[req._id] === 'rejected' ? (
                          <Button disabled className="bg-gray-400 text-white px-4 py-2 rounded-lg text-sm" size="sm">
                            Đã từ chối
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={() => handleAcceptFriendRequest(req.senderId, req._id)}
                              className="bg-green-500 text-white hover:bg-green-600 px-4 py-2 rounded-lg text-sm transition-colors shadow-md hover:shadow-lg"
                              size="sm"
                            >
                              Chấp nhận
                            </Button>
                            <Button
                              onClick={() => handleRejectFriendRequest(req.senderId, req._id)}
                              className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-lg text-sm transition-colors shadow-md hover:shadow-lg"
                              size="sm"
                            >
                              Từ chối
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
            <div className="bg-[var(--color-card)] rounded-xl shadow-lg p-4 sm:p-6 flex-1 max-h-[320px] lg:max-h-[440px] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  {searchrs ? 'Kết quả tìm kiếm' : 'Gợi ý kết bạn'}
                  {searchrs && (
                    <span className="ml-2 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                      {filteredData.length} kết quả
                    </span>
                  )}
                </h2>
                {searchrs && (
                  <div className="text-sm text-gray-600 flex items-center gap-4">
                    {filters.faculty && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Khoa: {filters.faculty}</span>}
                    {filters.year && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Năm: {filters.year}</span>}
                    {filters.class && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Lớp: {filters.class}</span>}
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Đang tải...</p>
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
                        className="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 cursor-pointer border border-blue-100"
                        onClick={() => {
                          localStorage.setItem('profileData', JSON.stringify(friend));
                          router.push(`/user/profile/${friend._id}`);
                        }}
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg mr-4 shadow-md">
                          {friend.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold text-gray-800 text-lg">{friend.username}</span>
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">{friend.Faculty}</span>
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">{friend.Major}</span>
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">Năm {friend.Year}</span>
                          </div>
                        </div>
                        <div className="ml-auto" onClick={e => e.stopPropagation()}>
                          {renderFriendButton(friend)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-lg">
                        {searchrs ? 'Không tìm thấy kết quả phù hợp' : 'Không có gợi ý nào'}
                      </p>
                      <p className="text-sm">
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