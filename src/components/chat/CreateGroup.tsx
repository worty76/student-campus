import React, { useState, useEffect } from "react";
import { Users, X, Search, MessageCircle, Plus } from "lucide-react";
import axios from "axios";
import { BASEURL } from "@/app/constants/url";
import { useWebSocket } from "@/app/constants/websocket.contex";
import Image from "next/image";

interface Friends {
  _id: string;
  username: string;
  avatar_link?: string;
}

interface UserDataProps {
  id?: string;
  username: string;
  Year: string;
  Major: string;
  email: string;
  Faculty: string;
  avatar?: string;
  avatar_link?: string;
  friends?: Friends[];
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateGroupModal = ({ isOpen, onClose }: CreateGroupModalProps) => {
  const [userData, setUserData] = useState<UserDataProps | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<Friends[]>([]);
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string>("");
  
  const { sendMessage } = useWebSocket();

  const getUserData = async () => {
    try {
      setError(""); // Clear previous errors
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        setError("Không tìm thấy thông tin người dùng");
        return;
      }

      const response = await axios.get(`${BASEURL}/api/get/userinfo/${userId}`, {
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
      setError("Không thể tải danh sách bạn bè");
    }
  };

  useEffect(() => {
    if (isOpen) {
      getUserData();
      
    }
  }, [isOpen]);

  const filteredFriends = userData?.friends?.filter(friend =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const toggleMember = (friend: Friends) => {
    const isSelected = selectedMembers.find(member => member._id === friend._id);
    if (isSelected) {
      setSelectedMembers(selectedMembers.filter(member => member._id !== friend._id));
    } else {
      setSelectedMembers([...selectedMembers, friend]);
    }
  };

  const handleCreateGroup = async () => {
    // Validate inputs first
    if (!groupName.trim()) {
      setError("Vui lòng nhập tên nhóm chat!");
      return;
    }
    
    if (selectedMembers.length === 0) {
      setError("Vui lòng chọn ít nhất một thành viên!");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      // Tạo mảng userIds bao gồm userData hiện tại và các thành viên đã chọn
      const userIds = [...selectedMembers];
      
      // Thêm userData hiện tại vào mảng userIds
      if (userData) {
        const currentUser = {
          _id: userData.id || localStorage.getItem('userId') || '',
          username: userData.username,
          avatar_link: userData.avatar_link
        };
        userIds.unshift(currentUser); // Thêm vào đầu mảng
      }

      // Send WebSocket message for group creation
      if (sendMessage) {
        sendMessage({
          type: 'create_group',
          groupName: groupName.trim(),
          userIds: userIds, 
    
        });
      }

      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log("Creating chat group:", {
        name: groupName,
        userIds: userIds
      });
      
      handleClose();
    } catch (error) {
      console.error("Error creating group:", error);
      setError("Không thể tạo nhóm chat. Vui lòng thử lại.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setGroupName("");
    setSelectedMembers([]);
    setSearchQuery("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Tạo nhóm chat</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-100">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Group Name Input */}
          <div className="p-4 border-b border-gray-100">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Nhập tên nhóm chat..."
              maxLength={50}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Selected Members Preview */}
          {selectedMembers.length > 0 && (
            <div className="p-4 bg-blue-50 border-b border-gray-100">
              <div className="text-xs text-blue-600 font-medium mb-2">
                Đã chọn {selectedMembers.length} thành viên
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedMembers.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                  >
                    <Image
                      width={480}
                      height={480}
                      src={member.avatar_link || '/schoolimg.jpg'}
                      alt={member.username}
                      className="w-4 h-4 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/schoolimg.jpg';
                      }}
                    />
                    <span className="max-w-16 truncate">{member.username}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMember(member);
                      }}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bạn bè..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
            </div>
          </div>

          {/* Friends List */}
          <div className="flex-1 overflow-y-auto">
            {userData === null ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-sm">Đang tải...</p>
              </div>
            ) : filteredFriends.length > 0 ? (
              <div className="p-2">
                {filteredFriends.map((friend) => {
                  const isSelected = selectedMembers.find(member => member._id === friend._id);
                  return (
                    <div
                      key={friend._id}
                      onClick={() => toggleMember(friend)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Image
                          width={480}
                          height={480}
                          src={friend.avatar_link || '/schoolimg.jpg'}
                          alt={friend.username}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/schoolimg.jpg';
                          }}
                        />
                        <span className="text-sm font-medium text-gray-800">{friend.username}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected 
                          ? 'bg-blue-600 border-blue-600' 
                          : 'border-gray-300'
                      }`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Users className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">
                  {searchQuery ? "Không tìm thấy bạn bè" : "Chưa có bạn bè nào"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              disabled={isCreating}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || selectedMembers.length === 0 || isCreating}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                !groupName.trim() || selectedMembers.length === 0 || isCreating
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang tạo...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Tạo nhóm
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;