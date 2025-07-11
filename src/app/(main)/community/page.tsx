'use client';
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Plus, MessageCircle, Search, ChevronDown } from "lucide-react";
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
                alert('Vui lòng nhập tên nhóm và đảm bảo bạn đã đăng nhập.');
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
            alert('Tạo nhóm thành công!');
            setGroupName('');
            setGroupDesc('');
            setSelectedIcon('📚');
            setTags([]);
            setShowCreateGroup(false);
        } catch (error) {
              console.log(error)
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
                alert('Bạn cần đăng nhập để tham gia nhóm.');
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
            alert('Tham gia nhóm thành công!');
            getGroup();
            getUsersGroupData();
        } catch (error) {
            console.log(error)
        }
    };

 

  
    const filteredUserGroups = userGroups.filter(group =>
        group.name.toLowerCase().includes(search.toLowerCase()) ||
        (group.desc?.toLowerCase().includes(search.toLowerCase()) ?? false)
    );

    return (
        <div className="min-h-screen ">
            <NavigationBar />
            <div className="max-w-7xl mx-auto px-4 pt-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-6rem)]">
                    {/* Left Container - Search and Groups Management */}
                    <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-2">
                        {/* Search Section */}
                        <Card className="border-blue-200 bg-[#F8FAFC]">
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Search className="text-[#1D4ED8]" size={18} />
                                    <span className="font-medium text-[#1D4ED8]">Tìm kiếm</span>
                                </div>
                                <Input
                                    placeholder="Tìm kiếm nhóm..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="border-blue-200 focus:border-blue-400"
                                />
                            </CardContent>
                        </Card>

                        {/* Navigation Toggle Section */}
                        <Card className="border-blue-200 bg-[#F8FAFC]">
                            <div className="rounded-t-lg px-4 py-2 bg-[#E2E8F0]">
                                <span className="font-semibold text-[#1D4ED8] flex items-center gap-2 text-base">
                                    <Users size={18} className="text-[#1D4ED8]" />
                                    Quản lý nhóm
                                </span>
                            </div>
                            <CardContent className="pt-4 pb-2">
                                <div className="flex gap-2 mb-2">
                                    <Button
                                        className={`flex-1 ${exploreTab === "joined" ? "bg-blue-600 text-white" : "bg-gray-100 text-blue-700"}`}
                                        onClick={() => {
                                            setExploreTab("joined");
                                            setMainTab("groups");
                                        }}
                                    >
                                        Nhóm của bạn
                                    </Button>
                                    <Button
                                        className={`flex-1 ${exploreTab === "explore" ? "bg-green-600 text-white" : "bg-gray-100 text-green-700"}`}
                                        onClick={() => {
                                            setExploreTab("explore");
                                            setMainTab("groups");
                                        }}
                                    >
                                        Khám phá nhóm
                                    </Button>
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                                    onClick={() => setMainTab("posts")}
                                >
                                    <MessageCircle size={16} className="mr-2" />
                                    Xem bài đăng
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Create Group Section */}
                        <Card className="border-blue-200 bg-[#F8FAFC]">
                            <div className="rounded-t-lg px-4 py-2 bg-[#E0F2FE]">
                                <span className="font-semibold text-[#7C3AED] flex items-center gap-2 text-base">
                                    <Plus size={18} className="text-[#7C3AED]" />
                                    Tạo nhóm mới
                                </span>
                            </div>
                            {showCreateGroup && (
                                <CardContent className="space-y-4">
                                    <Input
                                        placeholder="Tên nhóm"
                                        value={groupName}
                                        onChange={e => setGroupName(e.target.value)}
                                    />
                                    <Input
                                        placeholder="Mô tả nhóm"
                                        value={groupDesc}
                                        onChange={e => setGroupDesc(e.target.value)}
                                    />
                                    
                                    {/* Icon Selector */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Chọn icon cho nhóm</label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setShowIconSelector(!showIconSelector)}
                                                className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{selectedIcon}</span>
                                                    <span className="text-gray-700">Chọn icon</span>
                                                </div>
                                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showIconSelector ? 'rotate-180' : ''}`} />
                                            </button>
                                            
                                            {showIconSelector && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                    <div className="grid grid-cols-8 gap-1 p-2">
                                                        {availableIcons.map((icon, index) => (
                                                            <button
                                                                key={index}
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedIcon(icon);
                                                                    setShowIconSelector(false);
                                                                }}
                                                                className={`p-2 text-xl hover:bg-blue-50 rounded transition-colors ${
                                                                    selectedIcon === icon ? 'bg-blue-100 ring-2 ring-blue-300' : ''
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

                                    <div>
                                        <div className="flex gap-2 mb-2">
                                            <Input
                                                placeholder="Thêm tag mới"
                                                value={tagInput}
                                                onChange={e => setTagInput(e.target.value)}
                                            />
                                            <Button
                                                type="button"
                                                onClick={() => {
                                                    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                                                        setTags([...tags, tagInput.trim()]);
                                                        setTagInput("");
                                                    }
                                                }}
                                            >
                                                + Tag
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map((tag, idx) => (
                                                <span
                                                    key={idx}
                                                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1"
                                                >
                                                    #{tag}
                                                    <button
                                                        type="button"
                                                        className="ml-1 text-red-500"
                                                        onClick={() =>
                                                            setTags(tags.filter((t) => t !== tag))
                                                        }
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <Button
                                        onClick={createNewGroup}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                        <Plus size={16} className="mr-2" />
                                        Tạo nhóm
                                    </Button>
                                </CardContent>
                            )}
                        </Card>

                        {/* Quick Access to Joined Groups */}
                        {mainTab === "posts" && (
                            <Card className="border-blue-200 bg-[#F8FAFC]">
                                <div className="rounded-t-lg px-4 py-2 bg-[#E2E8F0]">
                                    <span className="font-semibold text-[#1D4ED8] flex items-center gap-2 text-base">
                                        <Users size={18} className="text-[#1D4ED8]" />
                                        Nhóm của bạn
                                    </span>
                                </div>
                                <CardContent>
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => setSelectedGroup("all")}
                                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                                                selectedGroup === "all" 
                                                    ? "bg-blue-100 border-2 border-blue-300" 
                                                    : "bg-gray-50 hover:bg-blue-50 border border-gray-200"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">📚</span>
                                                    <div>
                                                        <div className="font-medium text-blue-800">Tất cả nhóm</div>
                                                        <div className="text-sm text-gray-500">Xem tất cả bài đăng</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                        {filteredUserGroups.map((group) => (
                                            <button
                                                key={group._id}
                                                onClick={() => {
                                                    setSelectedGroup(group.name)
                                                    
                                                    setCurrentGroup(group._id)
                                                }}
                                                className={`w-full text-left p-3 rounded-lg transition-colors ${
                                                    selectedGroup === group.name 
                                                        ? "bg-blue-100 border-2 border-blue-300" 
                                                        : "bg-gray-50 hover:bg-blue-50 border border-gray-200"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl">{group.icon || "📚"}</span>
                                                        <div>
                                                            <div className="font-medium text-blue-800">{group.name}</div>
                                                            <div className="text-sm text-gray-500">{group.members.length} thành viên</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Container - Posts/Groups with Fixed Height */}
                    <div className="lg:col-span-2 h-full">
                        <Card className="h-full border-blue-200">
                            <CardContent className="p-0 h-full flex flex-col">
                                {/* Header Section */}
                                <div className="p-6 border-b border-blue-200 bg-gradient-to-r from-blue-50 to-white">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-semibold text-blue-700 flex items-center gap-2">
                                            {mainTab === "posts" ? (
                                                <>
                                                    <MessageCircle className="text-blue-600" size={20} />
                                                    {selectedGroup === "all" ? "Tất cả bài đăng" : `Bài đăng từ ${selectedGroup}`}
                                                </>
                                            ) : (
                                                <>
                                                    <Users className={exploreTab === "joined" ? "text-blue-600" : "text-green-600"} size={20} />
                                                    <span className={exploreTab === "joined" ? "text-blue-700" : "text-green-700"}>
                                                        {exploreTab === "joined" ? "Nhóm đã tham gia" : "Khám phá các nhóm mới"}
                                                    </span>
                                                </>
                                            )}
                                        </h2>
                                        {mainTab === "posts" && selectedGroup !== "all" && (
                                            <Button
                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                                onClick={() => setisAddmodalopen(true)}
                                            >
                                                + Đăng bài
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Scrollable Content Section */}
                                <div className="flex-1 overflow-y-auto p-6">
                                    {mainTab === "posts" ? (
                                        /* Posts Feed */
                                        <div className="space-y-4">
                                            {filteredPosts.length === 0 && (
                                                <div className="text-center py-8 text-gray-500">
                                                    Chưa có bài đăng nào trong nhóm này.
                                                </div>
                                            )}

                                            {filteredPosts.map((post) => (
                                                <RenderPost key={post._id || ''} post={post} userData={post.userInfo  || null} />
                                            ))}
                                        </div>
                                    ) : (
                                        /* Groups Display */
                                        <div className="space-y-4">
                                            {exploreTab === "joined" ? (
                                                <div className="grid grid-cols-1 gap-4">
                                                    {filteredUserGroups.map((group) => (
                                                        <Card key={group._id} className="border-blue-100 hover:shadow-md transition-shadow">
                                                            <CardContent className="pt-6">
                                                                <div className="flex items-start gap-4">
                                                                    <span className="text-4xl">{group.icon || "📚"}</span>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <h3 className="font-semibold text-blue-800 text-lg">{group.name}</h3>
                                                                        </div>
                                                                        <p className="text-gray-600 text-sm mb-3">{group.desc}</p>
                                                                        <div className="flex items-center justify-between">
                                                                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                                                                <Users size={14} />
                                                                                {group.members.length} thành viên
                                                                            </span>
                                                                            <div className="flex flex-wrap gap-1">
                                                                                {group.tags?.slice(0, 3).map((tag, idx) => (
                                                                                    <span
                                                                                        key={idx}
                                                                                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                                                                                    >
                                                                                        #{tag}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-4">
                                                    {filteredExploreGroups.map((group) => {
                                                        // Lấy userId hiện tại
                                                        const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
                                                        const isJoined = userId && group.members.includes(userId);

                                                        return (
                                                            <Card key={group._id} className="border-green-100 hover:shadow-md transition-shadow">
                                                                <CardContent className="pt-6">
                                                                    <div className="flex items-start gap-4">
                                                                        <span className="text-4xl">{group.icon || "📚"}</span>
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center justify-between mb-2">
                                                                                <h3 className="font-semibold text-green-800 text-lg">{group.name}</h3>
                                                                                {isJoined ? (
                                                                                    <Button
                                                                                        size="sm"
                                                                                        className="bg-gray-300 text-gray-600 cursor-default"
                                                                                        disabled
                                                                                    >
                                                                                        Đã tham gia
                                                                                    </Button>
                                                                                ) : (
                                                                                    <Button
                                                                                        onClick={() => joinedGroups(group._id)}
                                                                                        size="sm"
                                                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                                                    >
                                                                                        Tham gia
                                                                                    </Button>
                                                                                )}
                                                                            </div>
                                                                            <p className="text-gray-600 text-sm mb-3">{group.desc}</p>
                                                                            <div className="flex items-center justify-between">
                                                                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                                                                    <Users size={14} />
                                                                                    {group.members.length} thành viên
                                                                                </span>
                                                                                <div className="flex flex-wrap gap-1">
                                                                                    {group.tags?.slice(0, 3).map((tag, idx) => (
                                                                                        <span
                                                                                            key={idx}
                                                                                            className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs"
                                                                                        >
                                                                                            #{tag}
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            
                                            {((exploreTab === "joined" && filteredUserGroups.length === 0) ||
                                            (exploreTab === "explore" && filteredExploreGroups.length === 0)) && (
                                                <div className="text-center py-8 text-gray-500">
                                                    Không tìm thấy nhóm nào phù hợp với từ khóa tìm kiếm.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isAddmodalopen === true && userId && selectedGroup !== "all" && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <PostAddGroup
                        groupid={currentGroup}
                        groupname={selectedGroup}
                        _id={userId}
                        name={userInfo?.username || 'bull'}
                        avatar={userInfo?.avatar_link || ''}
                        onClose={() => setisAddmodalopen(false)}
                    />
                </div>
            )}
        </div>
    );
}