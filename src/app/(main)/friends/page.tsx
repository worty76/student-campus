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
import { useWebSocket } from "@/app/constants/websocket.contex";
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
  status:string;
}

interface FilterOptions {
 
  faculty: string;
  year: string;
  class: string;
}
interface FriendRequest {
    _id: string;
    username: string;
    Faculty: string;
    Major: string;
    Year: string;
    rqid: string;
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
  const [tab, setTab] = useState<'suggest' | 'requests'>('suggest');
  const [friend_request,setFriendRequests] =useState<FriendRequest[]>([]);
  const { sendMessage, status } = useWebSocket();
  const [queryerror, setQueryerror] = useState(false);
  const router = useRouter();
  // Thêm state để theo dõi các lời mời đã được chấp nhận
  const [acceptedRequests, setAcceptedRequests] = useState<Set<string>>(new Set());

  useEffect(() => {
    getSuggestionsFriend();
  }, []);

  // Filter data khi filters hoặc searcchdata thay đổi
  useEffect(() => {
  const filtered = searcchdata.filter(friend => {
    return (
      (!filters.faculty || friend.Faculty.toLowerCase().includes(filters.faculty.toLowerCase())) &&
      (!filters.year || friend.Year.toString() === filters.year)
    );
  });
  setFilteredData(filtered);

  getlistfriendrq();
}, [filters, searcchdata]);

  const getSuggestionsFriend = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!userId) return;

      const response = await axios.get(`
        ${BASEURL}/api/get/hint/friend/${userId}`, {
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

        console.log(response.data);
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
    // Reset accepted requests khi reset filters
    setAcceptedRequests(new Set());
  };

  const handleSendFriendRequest = async (receiverId: string) => {
    try {
      
      
      console.log('WebSocket status:', status);
      const fromid = localStorage.getItem('userId');
      const toid = receiverId;
      sendMessage({
        type: 'friend_request',
        from: fromid || '123',
        to: toid || '123',
      });
    } catch (err) {
      console.error("Gửi kết bạn thất bại:", err);
      alert("Lỗi khi gửi lời mời kết bạn.");
    }
  };

  const handleAcceptFriendRequest = async (receiverId: string , reqid: string) => {
     try {
      
      
      console.log('WebSocket status:', status);
      const fromid = localStorage.getItem('userId');
      const toid = receiverId;
      const rqid = reqid;
      sendMessage({
        type: 'accept_request',
        from: fromid || '123',
        to: toid || '123',
        reqid: rqid || '123'
      });
      
      // Thêm userId vào danh sách đã chấp nhận
      setAcceptedRequests(prev => new Set(prev).add(receiverId));
    } catch (err) {
      console.error("Gửi kết bạn thất bại:", err);
      alert("Lỗi khi chấp nhận kết bạn.");
    }
  };

  const handleRejectFriendRequest = async (friendId: string,reqid: string) => {
     try {
      
      
      console.log('WebSocket status:', status);
      const fromid = localStorage.getItem('userId');
      const toid = friendId;
      const rqid = reqid;
      sendMessage({
        type: 'deny_request',
        from: fromid || '123',
        to: toid || '123',
        reqid: rqid || '123'
      });
       setSearchrs(false);
       setSearchsData([]);
      
    } catch (err) {
      console.error("Gửi kết bạn thất bại:", err);
      alert("Lỗi khi chấp nhận kết bạn.");
    }
  };
  
  const getlistfriendrq = async () =>{
    try {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!userId) return;

      const response = await axios.post(`${BASEURL}/api/get/list-friend`, {id:userId},{
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        }
    });
    if(response){
        console.log(response)
        setFriendRequests(response.data.data)
    }
    } catch (error) {
        console.log(error)
    }
  }
  // Helper function to check if an item is a SearchFriend
  const isSearchFriend = (friend: SuggestionFriend | SearchFriend): friend is SearchFriend => {
    return 'type' in friend;
  };

  // Render button based on friend type and search state
  const renderFriendButton = (friend: SuggestionFriend | SearchFriend) => {
    if (searchrs && isSearchFriend(friend)) {
      // Kiểm tra nếu đã chấp nhận lời mời này
      if (acceptedRequests.has(friend._id)) {
        return (
          <Button
            disabled
            className="bg-gray-400 text-white px-4 py-1 rounded cursor-not-allowed"
            size="sm"
          >
            Đã chấp nhận lời mời
          </Button>
        );
      }
      
      // Logic cho kết quả search
      if (friend.type === 'sender' && friend.status === "pending") {
        return (
          <Button
            disabled
            className="bg-gray-400 text-white px-4 py-1 rounded cursor-not-allowed"
            size="sm"
          >
            Đã gửi lời mời
          </Button>
        );
      } else if (friend.type === 'receiver') {
        return (
          <div className="flex space-x-2">
            <Button
              onClick={() => handleAcceptFriendRequest(friend._id,friend.rqid)}
              className="bg-green-500 text-white hover:bg-green-600 px-3 py-1 rounded"
              size="sm"
            >
              Chấp nhận
            </Button>
            <Button
              onClick={() => handleRejectFriendRequest(friend._id,friend.rqid)}
              className="bg-red-500 text-white hover:bg-red-600 px-3 py-1 rounded"
              size="sm"
            >
              Từ chối
            </Button>
          </div>
        );
      }else if (friend.status === "accepted" && friend.type === 'sender') {
        return (
          <Button
            disabled
            className="bg-gray-400 text-white px-4 py-1 rounded cursor-not-allowed"
            size="sm"
          >
            Bạn Bè
          </Button>
        );
      } else {
        return (
          <Button
            onClick={() => handleSendFriendRequest(friend._id)}
            className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-1 rounded"
            size="sm"
          >
            Kết bạn
          </Button>
        );
      }
    } else {
      // Logic cho suggestions
      return (
        <Button
          onClick={() => handleSendFriendRequest(friend._id)}
          className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-1 rounded"
          size="sm"
        >
          Kết bạn
        </Button>
      );
    }
  };

  // Data để hiển thị (filtered nếu có search, suggestions nếu không)
   const displayData = searchrs ? filteredData : suggestionFriends;

    return (
    <div className="bg-gradient-to-br from-blue-100 to-blue-300 min-h-screen">
      <NavigationBar />
      <div className="relative top-[10vh] max-w-5xl mx-auto py-8 px-4">
      {/* Tab Buttons - full width, same as search/filter */}
        <div className="flex gap-2 mb-6 w-full">
          <Button
            className={`flex-1 bg-blue-100 text-blue-700 font-semibold px-4 py-2 rounded shadow-none border-none ${tab === 'suggest' ? 'ring-2 ring-blue-400' : ''}`}
            onClick={() => setTab('suggest')}
            variant="ghost"
          >
            Gợi ý kết bạn
          </Button>
          <Button
            className={`flex-1 bg-blue-100 text-blue-700 font-semibold px-4 py-2 rounded shadow-none border-none ${tab === 'requests' ? 'ring-2 ring-blue-400' : ''}`}
            onClick={() => setTab('requests')}
            variant="ghost"
          >
            Lời mời kết bạn
          </Button>
        </div>
        {/* Search Input and Filters (only show in "suggest" tab) */}
        {tab === 'suggest' && (
          <>
            <Input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Tìm kiếm bạn bè hoặc cộng đồng..."
              className={`w-full px-3 py-2 rounded text-base mb-4 bg-white text-blue-700 placeholder-blue-400
                ${queryerror === true ? 'border-red-500' : 'border-blue-300'}`}
            />
            {queryerror === true && (
              <p className="text-red-500 text-sm mt-1">Vui lòng nhập từ khóa tìm kiếm.</p>
            )}

            <div className="flex gap-4 mb-4">
              {/* ...Select filters... */}
              <Select value={filters.faculty || 'all'} onValueChange={(value) => handleFilterChange('faculty', value === 'all' ? '' : value)}>
                <SelectTrigger className="w-40 border-blue-300 bg-white text-blue-700">
                  <SelectValue placeholder="Theo khoa" />
                </SelectTrigger>
                <SelectContent className="bg-white text-blue-700">
                  <SelectItem value="all">Tất cả khoa</SelectItem>
                  <SelectItem value="Software Engineer">Công nghệ thông tin</SelectItem>
                  <SelectItem value="Kinh tế">Kinh tế</SelectItem>
                  <SelectItem value="Y tế">Y tế</SelectItem>
                  <SelectItem value="Kỹ thuật">Kỹ thuật</SelectItem>
                  <SelectItem value="Luật">Luật</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.year || 'all'} onValueChange={(value) => handleFilterChange('year', value === 'all' ? '' : value)}>
                <SelectTrigger className="w-40 border-blue-300 bg-white text-blue-700">
                  <SelectValue placeholder="Năm học" />
                </SelectTrigger>
                <SelectContent className="bg-white text-blue-700">
                  <SelectItem value="all">Tất cả năm</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.class || 'all'} onValueChange={(value) => handleFilterChange('class', value === 'all' ? '' : value)}>
                <SelectTrigger className="w-40 border-blue-300 bg-white text-blue-700">
                  <SelectValue placeholder="Lớp" />
                </SelectTrigger>
                <SelectContent className="bg-white text-blue-700">
                  <SelectItem value="all">Tất cả lớp</SelectItem>
                  <SelectItem value="lop1">Lớp 1</SelectItem>
                  <SelectItem value="lop2">Lớp 2</SelectItem>
                  <SelectItem value="lop3">Lớp 3</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2 ml-auto">
                <Button
                  onClick={handleSearchFriend}
                  variant="outline"
                  className="border-blue-500 text-blue-700 hover:bg-blue-50"
                >
                  Tìm kiếm
                </Button>
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  className="border-blue-500 text-blue-700 hover:bg-blue-50"
                >
                  Reset
                </Button>
              </div>
            </div>
          </>
        )}

        

        <hr className="my-4 border-blue-200" />

        {/* Content */}
        <div className="mt-8">
          {tab === 'suggest' ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-blue-700">
                  {searchrs ? `Kết quả tìm kiếm (${filteredData.length})` : 'Gợi ý bạn bè'}
                </h2>
                {searchrs && (
                    <div className="text-sm text-blue-600 flex items-center gap-2">
                    {filters.faculty && <span className="mr-2">Khoa: {filters.faculty}</span>}
                    {filters.year && <span className="mr-2">Năm: {filters.year}</span>}
                    {filters.class && <span className="mr-2">Lớp: {filters.class}</span>}
                    </div>
                )}
              </div>
              <hr className="border-gray-200" />
              <ul className="space-y-3">
                {loading ? (
                  <p className="text-gray-500 text-sm">Đang tải...</p>
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
                      <li
                        key={friend._id}
                        className="flex items-center bg-blue-50 rounded-lg p-3 hover:bg-blue-100 transition-colors cursor-pointer"
                       onClick={() => {
                          localStorage.setItem('profileData', JSON.stringify(friend));
                          router.push(`/user/profile/${friend._id}`);
                      }}
                      >
                        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold mr-3">
                          {friend.username?.charAt(0).toUpperCase() || "U"}
                        </span>
                        <div>
                          <span className="font-medium text-blue-800">{friend.username}</span>
                          <div className="text-xs text-gray-500">
                            {friend.Faculty} / {friend.Major} / Năm {friend.Year}
                          </div>
                        </div>
                        <div className="ml-auto" onClick={e => e.stopPropagation()}>
                          
                          {renderFriendButton(friend)}
                        </div>
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-blue-600">
                      {searchrs ? 'Không tìm thấy kết quả phù hợp.' : 'Không có gợi ý nào.'}
                    </p>
                  )
                )}
              </ul>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-blue-700">
                  Lời mời kết bạn
                </h2>
              </div>
              <hr className="border-gray-200" />
              <ul className="space-y-3">
                {friend_request.length === 0 ? (
                  <p className="text-sm text-blue-600">Không có lời mời kết bạn nào.</p>
                ) : (
                  friend_request.map((req) => (
                    <li
                      key={req._id}
                      className="flex items-center bg-blue-50 rounded-lg p-3 hover:bg-blue-100 transition-colors cursor-pointer"
                      onClick={() => router.push(`/user/profile/${req._id}`)}
                    >
                      <span className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-blue-500 flex items-center justify-center text-white font-bold mr-3">
                        {req.username?.charAt(0).toUpperCase() || "U"}
                      </span>
                      <div>
                        <span className="font-medium text-blue-800">{req.username}</span>
                        <div className="text-xs text-gray-500">
                          {req.Faculty} / {req.Major} / Năm {req.Year}
                        </div>
                      </div>
                      <div className="ml-auto flex gap-2" onClick={e => e.stopPropagation()}>
                        <Button
                          onClick={() => handleAcceptFriendRequest(req._id, req.rqid)}
                          className="bg-green-500 text-white hover:bg-green-600 px-3 py-1 rounded"
                          size="sm"
                        >
                          Chấp nhận
                        </Button>
                        <Button
                          onClick={() => handleRejectFriendRequest(req._id, req.rqid)}
                          className="bg-red-500 text-white hover:bg-red-600 px-3 py-1 rounded"
                          size="sm"
                        >
                          Từ chối
                        </Button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendsNCommunitys;