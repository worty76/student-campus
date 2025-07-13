'use client';
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Plus, MessageCircle, Search, ChevronDown, CheckCircle, XCircle } from "lucide-react";
import NavigationBar from "../layouts/navbar";
import axios from "axios";
import { BASEURL } from "@/app/constants/url";
import PostAddGroup from "@/components/home/postaddgroup";
import RenderPost from "@/components/home/post";

interface Comments {
  userinfo: userInfo;
  context: string;
}
interface userInfo {
  _id:string;
  username:string;
  avatar_link:string;
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
}
interface Attachment {
  file?: FileAttachment;
  url?: string;
  filename?: string;
  mimetype?: string;
  filetype?: string;
}
// Available icons for group selection
const availableIcons = [
    "📚", "🔢", "☕", "🇺🇸", "📊", "⚛️", "📱", "🎨", "💰", "🖥️",
    "🧮", "🏛️", "🌍", "🔬", "🎵", "🎭", "🏃", "🍳", "📖", "✍️",
    "🎯", "💡", "🚀", "🌟", "🔥", "💎", "🎪", "🎲", "🎸", "🎤",
    "📷", "🎬", "🎮", "🏆", "🎈", "🎊", "🌈", "🦄", "🐱", "🐶"
];

// Interface for ExploreGroup (update: icon is optional)
interface ExploreGroup {
    _id: string;
    name: string;
    creater: string;
    icon?: string;
    desc?: string;
    members: string[];
    posts: string[];
    createAt: string | Date;
    tags: string[];
}

// Thêm interface cho nhóm của user nếu cần
interface UserGroup {
    _id: string;
    name: string;
    creater: string;
    icon?: string;
    desc?: string;
    members: string[];
    posts: string[];
    createAt: string | Date;
    tags: string[];
}

// Thêm interface mới
interface PostWithGroup extends Post {
    groupName: string;
    userInfo?: userInfo | null;
}

interface userInfo {

     _id: string;
    username: string;
    avatar_link: string;
                              
}
export default function CommunityGroupsPage() {
    const [selectedGroup, setSelectedGroup] = useState("all");
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [groupDesc, setGroupDesc] = useState("");
    const [selectedIcon, setSelectedIcon] = useState("📚");
    const [showIconSelector, setShowIconSelector] = useState(false);
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [mainTab, setMainTab] = useState<"posts" | "groups">("posts");
    const [exploreTab, setExploreTab] = useState<"explore" | "joined">("joined");
    const [exGroups, setExploreGroups] = useState<ExploreGroup[]>([]);
    const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
    const [isAddmodalopen,setisAddmodalopen] = useState(false)
    const [userId, setUserId] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<userInfo>() || null;
    const [currentGroup, setCurrentGroup] = useState('')
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isSuccessType, setIsSuccessType] = useState(true); // true = success, false = error

    // Auto close success dialog after 3 seconds
    useEffect(() => {
        if (showSuccessDialog && isSuccessType) {
            const timer = setTimeout(() => {
                setShowSuccessDialog(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessDialog, isSuccessType]);
    
    // Sửa type mới cho state
const [allGroupPosts, setAllGroupPosts] = useState<PostWithGroup[]>([]);
    
    const filteredExploreGroups = exGroups.filter(group =>
        group.name.toLowerCase().includes(search.toLowerCase()) ||
        (group.desc?.toLowerCase().includes(search.toLowerCase()) ?? false)
    );

    // Sửa filteredPosts để lấy đúng dữ liệu khi ở mục "Tất cả nhóm"
const filteredPosts = selectedGroup === "all"
    ? allGroupPosts
    : allGroupPosts.filter(post => post.groupName === selectedGroup);


    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/login";
        }
      }, []);
    useEffect(() =>{
    const token = localStorage.getItem('token');
     const id = localStorage.getItem('userId');
        const data = localStorage.getItem('userdata');

        setUserId(id);

        if (data) {
            try {
            const parsedData = JSON.parse(data);
            setUserInfo(parsedData);
        } catch (e) {
            console.error("Failed to parse userdata from localStorage:", e);
            }
        }
     
    if (token) {
        getGroup();
        getUsersGroupData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [])
    
  

    const createNewGroup = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            if (!groupName.trim() || !userId) {
                setSuccessMessage('Vui lòng nhập tên nhóm và đảm bảo bạn đã đăng nhập.');
                setIsSuccessType(false);
                setShowSuccessDialog(true);
                return;
            }
            const group = {
                name: groupName.trim(),
                creater: userId,
                desc: groupDesc.trim(),
                icon: selectedIcon,
                members: [userId],
                tags,
            };
            await axios.post(
                `${BASEURL}/api/create/group`,
                { group },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            // Hiển thị dialog thành công
            setSuccessMessage('Tạo nhóm thành công!');
            setIsSuccessType(true);
            setShowSuccessDialog(true);
            
            setGroupName('');
            setGroupDesc('');
            setSelectedIcon('📚');
            setTags([]);
            setShowCreateGroup(false);
            
            // Refresh data sau khi tạo nhóm thành công
            await getGroup();
            await getUsersGroupData();
        } catch (error) {
            console.log(error);
            setSuccessMessage('Có lỗi xảy ra khi tạo nhóm. Vui lòng thử lại.');
            setIsSuccessType(false);
            setShowSuccessDialog(true);
        }
    };

    const getGroup = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${BASEURL}/api/get/group`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (res && res.data) {
                // Set explore groups from API response
                setExploreGroups(res.data as ExploreGroup[]);
            }
        } catch (error) {
            console.error('Error in getGroup:', error);
          
        }
    };

    

const loadAllGroupsPosts = async (groups: UserGroup[]) => {
    try {
        const token = localStorage.getItem('token');
      
let allPosts: PostWithGroup[] = [];
        for (const group of groups) {
            const res = await axios.get(`${BASEURL}/api/get/group/post/${group._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (res && res.data) {
                console.log(res.data)
                // Sử dụng type mới cho allPosts
                allPosts = allPosts.concat(res.data.posts.map((post: Post) => ({
                    ...post,
                    groupName: group.name 
                })));
            }
        }
        setAllGroupPosts(allPosts);
    } catch (error) {
        console.error('Error loading all group posts:', error);
    }
};

    
const getUsersGroupData = async () => {
    try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const res = await axios.get(`${BASEURL}/api/get/user/group/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (res && res.data) {
            setUserGroups(res.data as UserGroup[]);
         
            loadAllGroupsPosts(res.data as UserGroup[]);
        }
    } catch (error) {
        console.error('Error in getUsersGroupData:', error);
           
        }
    };

    
    const joinedGroups = async (groupId: string) => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            if (!token || !userId) {
                setSuccessMessage('Bạn cần đăng nhập để tham gia nhóm.');
                setIsSuccessType(false);
                setShowSuccessDialog(true);
                return;
            }
            await axios.put(
                `${BASEURL}/api/join/group`,
                { groupId, userId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            // Hiển thị dialog thành công
            setSuccessMessage('Tham gia nhóm thành công!');
            setIsSuccessType(true);
            setShowSuccessDialog(true);
            
            // Refresh data sau khi tham gia nhóm thành công
            await getGroup();
            await getUsersGroupData();
        } catch (error) {
            console.log(error);
            setSuccessMessage('Có lỗi xảy ra khi tham gia nhóm. Vui lòng thử lại.');
            setIsSuccessType(false);
            setShowSuccessDialog(true);
        }
    };

    // Hàm refresh data sau khi đăng bài
    const refreshPostData = async () => {
        try {
            await getUsersGroupData(); // Sẽ tự động gọi loadAllGroupsPosts
        } catch (error) {
            console.error('Error refreshing post data:', error);
        }
    };

    // Hàm refresh data cho nhóm cụ thể (tối ưu hơn)
    const refreshCurrentGroupPosts = async () => {
        try {
            if (currentGroup) {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${BASEURL}/api/get/group/post/${currentGroup}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                
                if (res && res.data) {
                    // Cập nhật lại bài đăng cho nhóm hiện tại
                    const updatedGroupPosts = res.data.posts.map((post: Post) => ({
                        ...post,
                        groupName: selectedGroup 
                    }));
                    
                    // Cập nhật allGroupPosts, thay thế posts của nhóm hiện tại
                    setAllGroupPosts(prevPosts => {
                        const otherGroupPosts = prevPosts.filter(post => post.groupName !== selectedGroup);
                        return [...otherGroupPosts, ...updatedGroupPosts];
                    });
                }
            } else {
                // Nếu không có nhóm cụ thể, refresh toàn bộ
                await refreshPostData();
            }
        } catch (error) {
            console.error('Error refreshing current group posts:', error);
            // Fallback to full refresh if specific refresh fails
            await refreshPostData();
        }
    };

 

  
    const filteredUserGroups = userGroups.filter(group =>
        group.name.toLowerCase().includes(search.toLowerCase()) ||
        (group.desc?.toLowerCase().includes(search.toLowerCase()) ?? false)
    );

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#f1f1e6' }}>
            <NavigationBar />
            
            <div className="max-w-7xl mx-auto px-4 pt-20 pb-8 ">
                {/* Main Navigation Tabs */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Button
                            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                mainTab === "posts" 
                                    ? "bg-[#1e293b] text-white shadow-lg transform scale-105" 
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                            onClick={() => setMainTab("posts")}
                        >
                            <MessageCircle size={20} className="mr-2" />
                            Bài đăng
                        </Button>
                        <Button
                            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                mainTab === "groups" && exploreTab === "joined"
                                    ? "bg-[#1e293b] text-white shadow-lg transform scale-105" 
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                            onClick={() => {
                                setMainTab("groups");
                                setExploreTab("joined");
                            }}
                        >
                            <Users size={20} className="mr-2" />
                            Nhóm của tôi
                        </Button>
                        <Button
                            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                mainTab === "groups" && exploreTab === "explore"
                                    ? "bg-[#1e293b] text-white shadow-lg transform scale-105" 
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                            onClick={() => {
                                setMainTab("groups");
                                setExploreTab("explore");
                            }}
                        >
                            <Search size={20} className="mr-2" />
                            Khám phá
                        </Button>
                        <Button
                            className="px-8 py-3 rounded-xl font-semibold bg-green-500 text-white hover:bg-green-600 transition-all duration-300 hover:scale-105 shadow-lg"
                            onClick={() => setShowCreateGroup(!showCreateGroup)}
                        >
                            <Plus size={20} className="mr-2" />
                            Tạo nhóm
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Search Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Search className="text-[#0694FA]" size={20} />
                                </div>
                                <h3 className="font-semibold text-gray-800">Tìm kiếm</h3>
                            </div>
                            <div className="relative">
                                <Input
                                    placeholder="Tìm kiếm nhóm..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="border-gray-200 focus:border-[#0694FA] focus:ring-2 focus:ring-blue-100 pl-10 rounded-xl"
                                />
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                {search && (
                                    <button
                                        onClick={() => setSearch("")}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Quick Groups Access */}
                        {mainTab === "posts" && (
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                <div className="bg-[#1e293b] p-4">
                                    <div className="flex items-center gap-3 text-white">
                                        <Users size={20} />
                                        <h3 className="font-semibold">Nhóm của bạn</h3>
                                    </div>
                                </div>
                                <div className="p-4 max-h-96 overflow-y-auto">
                                    <button
                                        onClick={() => setSelectedGroup("all")}
                                        className={`w-full text-left p-3 rounded-xl mb-2 transition-all duration-200 ${
                                            selectedGroup === "all" 
                                                ? "bg-blue-50 border-2 border-[#0694FA] shadow-md" 
                                                : "hover:bg-gray-50 border border-gray-200"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">📚</span>
                                            <div>
                                                <div className="font-medium text-gray-800">Tất cả nhóm</div>
                                                <div className="text-sm text-gray-500">Xem tất cả bài đăng</div>
                                            </div>
                                        </div>
                                    </button>
                                    {filteredUserGroups.slice(0, 5).map((group) => (
                                        <button
                                            key={group._id}
                                            onClick={() => {
                                                setSelectedGroup(group.name);
                                                setCurrentGroup(group._id);
                                            }}
                                            className={`w-full text-left p-3 rounded-xl mb-2 transition-all duration-200 ${
                                                selectedGroup === group.name 
                                                    ? "bg-blue-50 border-2 border-[#0694FA] shadow-md" 
                                                    : "hover:bg-gray-50 border border-gray-200"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{group.icon || "📚"}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-gray-800 truncate">{group.name}</div>
                                                    <div className="text-sm text-gray-500">{group.members.length} thành viên</div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            {/* Header */}
                            <div className="bg-[#1e293b] p-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        {mainTab === "posts" ? (
                                            <>
                                                <MessageCircle size={24} />
                                                {selectedGroup === "all" ? "Tất cả bài đăng" : `${selectedGroup}`}
                                            </>
                                        ) : (
                                            <>
                                                <Users size={24} />
                                                {exploreTab === "joined" ? "Nhóm đã tham gia" : "Khám phá nhóm mới"}
                                            </>
                                        )}
                                    </h2>
                                    {mainTab === "posts" && selectedGroup !== "all" && (
                                        <Button
                                            className="bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl px-6 py-2 transition-all duration-200"
                                            onClick={() => setisAddmodalopen(true)}
                                        >
                                            <Plus size={18} className="mr-2" />
                                            Đăng bài
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 min-h-[600px] max-h-[800px] overflow-y-auto">
                                {mainTab === "posts" ? (
                                    <div className="space-y-6">
                                        {filteredPosts.length === 0 ? (
                                            <div className="text-center py-16">
                                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <MessageCircle size={40} className="text-gray-400" />
                                                </div>
                                                <h3 className="text-xl font-semibold text-gray-600 mb-2">Chưa có bài đăng nào</h3>
                                                <p className="text-gray-500">Hãy là người đầu tiên chia sẻ điều gì đó!</p>
                                            </div>
                                        ) : (
                                            filteredPosts.map((post, index) => (
                                                <div 
                                                    key={post._id} 
                                                    className="animate-in slide-in-from-bottom duration-300"
                                                    style={{ animationDelay: `${index * 100}ms` }}
                                                >
                                                    <RenderPost post={post} userData={post.userInfo || null} />
                                                </div>
                                            ))
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {(exploreTab === "joined" ? filteredUserGroups : filteredExploreGroups).map((group, index) => (
                                            <div 
                                                key={group._id}
                                                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-105"
                                                style={{ animationDelay: `${index * 100}ms` }}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="p-3 bg-blue-100 rounded-xl">
                                                        <span className="text-2xl">{group.icon || "📚"}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <h3 className="font-bold text-lg text-gray-800">{group.name}</h3>
                                                            {exploreTab === "explore" && (
                                                                typeof window !== "undefined" && 
                                                                localStorage.getItem("userId") && 
                                                                group.members.includes(localStorage.getItem("userId")!) ? (
                                                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                                                        ✓ Đã tham gia
                                                                    </span>
                                                                ) : exploreTab === "explore" ? (
                                                                    <Button
                                                                        onClick={() => joinedGroups(group._id)}
                                                                        size="sm"
                                                                        className="bg-[#0694FA] hover:bg-[#1E293B] text-white rounded-lg px-4 py-2"
                                                                    >
                                                                        <Plus size={14} className="mr-1" />
                                                                        Tham gia
                                                                    </Button>
                                                                ) : null
                                                            )}
                                                        </div>
                                                        <p className="text-gray-600 mb-4 line-clamp-2">{group.desc}</p>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                                <Users size={16} />
                                                                <span>{group.members.length} thành viên</span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1">
                                                                {group.tags?.slice(0, 2).map((tag, idx) => (
                                                                    <span
                                                                        key={idx}
                                                                        className="bg-blue-100 text-[#0694FA] px-2 py-1 rounded-lg text-xs font-medium"
                                                                    >
                                                                        #{tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {(exploreTab === "joined" ? filteredUserGroups : filteredExploreGroups).length === 0 && (
                                            <div className="col-span-full text-center py-16">
                                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Users size={40} className="text-gray-400" />
                                                </div>
                                                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                                    {exploreTab === "joined" ? "Chưa tham gia nhóm nào" : "Không tìm thấy nhóm"}
                                                </h3>
                                                <p className="text-gray-500">
                                                    {exploreTab === "joined" 
                                                        ? "Khám phá và tham gia các nhóm để kết nối!" 
                                                        : "Thử tìm kiếm với từ khóa khác"
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Group Modal */}
            {showCreateGroup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
                    <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                                <div className="p-2 bg-[#1e293b] rounded-xl">
                                    <Plus className="text-white" size={24} />
                                </div>
                                Tạo nhóm mới
                            </h2>
                            <button
                                onClick={() => setShowCreateGroup(false)}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <span className="text-2xl text-gray-500">×</span>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Tên nhóm *</label>
                                <Input
                                    placeholder="Nhập tên nhóm..."
                                    value={groupName}
                                    onChange={e => setGroupName(e.target.value)}
                                    className="border-gray-200 focus:border-[#0694FA] focus:ring-2 focus:ring-blue-100 rounded-xl py-3 px-4 text-lg"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Mô tả nhóm</label>
                                <textarea
                                    placeholder="Mô tả về nhóm của bạn..."
                                    value={groupDesc}
                                    onChange={e => setGroupDesc(e.target.value)}
                                    className="w-full border border-gray-200 focus:border-[#0694FA] focus:ring-2 focus:ring-blue-100 rounded-xl py-3 px-4 min-h-[100px] resize-none"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Chọn biểu tượng</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowIconSelector(!showIconSelector)}
                                        className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0694FA] transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <span className="text-2xl">{selectedIcon}</span>
                                            </div>
                                            <span className="text-gray-700 font-medium">Chọn biểu tượng</span>
                                        </div>
                                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showIconSelector ? 'rotate-180' : ''}`} />
                                    </button>
                                    
                                    {showIconSelector && (
                                        <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-64 overflow-y-auto">
                                            <div className="grid grid-cols-8 gap-2 p-4">
                                                {availableIcons.map((icon, index) => (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedIcon(icon);
                                                            setShowIconSelector(false);
                                                        }}
                                                        className={`p-3 text-2xl hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110 ${
                                                            selectedIcon === icon ? 'bg-blue-100 ring-2 ring-[#0694FA] scale-110' : ''
                                                        }`}
                                                    >
                                                        {icon}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Thẻ tag</label>
                                <div className="flex gap-2 mb-3">
                                    <Input
                                        placeholder="Thêm tag mới..."
                                        value={tagInput}
                                        onChange={e => setTagInput(e.target.value)}
                                        className="border-gray-200 focus:border-[#0694FA] focus:ring-2 focus:ring-blue-100 rounded-xl"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                                                    setTags([...tags, tagInput.trim()]);
                                                    setTagInput("");
                                                }
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                                                setTags([...tags, tagInput.trim()]);
                                                setTagInput("");
                                            }
                                        }}
                                        className="bg-[#1e293b] text-white rounded-xl px-6 hover:bg-gray-700 transition-all"
                                    >
                                        Thêm
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag, idx) => (
                                        <span
                                            key={idx}
                                            className="bg-blue-100 text-[#0694FA] px-4 py-2 rounded-full text-sm flex items-center gap-2 font-medium"
                                        >
                                            #{tag}
                                            <button
                                                type="button"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full w-5 h-5 flex items-center justify-center text-sm transition-all"
                                                onClick={() => setTags(tags.filter((t) => t !== tag))}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    onClick={() => setShowCreateGroup(false)}
                                    variant="outline"
                                    className="flex-1 py-3 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    onClick={createNewGroup}
                                    disabled={!groupName.trim()}
                                    className="flex-1 py-3 bg-[#1e293b] text-white rounded-xl hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                >
                                    <Plus size={20} className="mr-2" />
                                    Tạo nhóm
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Post Modal */}
            {isAddmodalopen === true && userId && selectedGroup !== "all" && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="animate-in zoom-in-95 duration-300">
                        <PostAddGroup
                            groupid={currentGroup}
                            groupname={selectedGroup}
                            _id={userId!}
                            name={userInfo?.username || 'bull'}
                            avatar={userInfo?.avatar_link || ''}
                            onClose={() => setisAddmodalopen(false)}
                            onPostSuccess={refreshCurrentGroupPosts}
                        />
                    </div>
                </div>
            )}

            {/* Success/Error Dialog */}
            {showSuccessDialog && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="text-center">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                                isSuccessType ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                                {isSuccessType ? (
                                    <CheckCircle className="text-green-500" size={40} />
                                ) : (
                                    <XCircle className="text-red-500" size={40} />
                                )}
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                {isSuccessType ? 'Thành công!' : 'Lỗi!'}
                            </h3>
                            <p className="text-gray-600 mb-6">{successMessage}</p>
                            <Button
                                onClick={() => setShowSuccessDialog(false)}
                                className={`w-full py-3 text-white rounded-xl transition-all font-medium ${
                                    isSuccessType 
                                        ? 'bg-green-500 hover:bg-green-600' 
                                        : 'bg-red-500 hover:bg-red-600'
                                }`}
                            >
                                Đóng
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}