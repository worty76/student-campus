'use client'
import React, { useState, useEffect, useCallback, useRef } from "react";
import NavigationBar from "@/app/(main)/layouts/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation'
import { Send, Paperclip, X, FileImage, File, Download, Smile } from "lucide-react";
import { useWebSocket } from '@/app/context/websocket.contex';
import axios from "axios";
import { BASEURL } from "@/app/constants/url";
import downloadFileFromObject  from '@/app/api/file_handler';
import Image from "next/image";
import CreateGroupModal from "@/components/chat/CreateGroup";
import { Users } from "lucide-react"; 
interface OnlineFriend {
  _id: string;
  username: string;
  avatar_link: string;
  online?: boolean;
}

interface WebSocketMessage {
  type: 'init' |'file_to' |'friend_request' | 'message' | 'accept_request' |'deny_request'| 'likes_post'| 'unlike_post' | 'Comment'|'online_friend' | 'text_to'| 'create_group' | 'leave_group'| 'add_to_group';
  from?: string;
  to?: string;
  message?: string;
  fromName?: string; // Thêm tên người gửi
  reqid?:string;
  postid?:string;
  context?: string;
  friends?: OnlineFriend[];
  chatid?:string,
  file?: file[]
  userIds?: Friends[],
  groupName?: string
  isGroupChat?: boolean; 
  

}
interface Friends {
  _id: string;
  username: string;
  avatar_link?: string;
}

interface file{
    name: string;
    type: string;
    size: number;
    url: string;
}

interface Participant {
  _id: string;
  username: string;
  avatar_link: string;
  messagePrivacy?: string
}

interface Text {
  text: string;
  userid: string;
  _id: string;
  timestamp: string;
  files?: file[]
}

interface Chat {
  _id: string;
  participants: Participant[][] | Participant[];
  isGroupChat: boolean;
  chatContext: Text[];
  lasttext?: Text;
  updatedAt?: string;
  GroupName?:string;
}

interface AttachedFile {
  file: File;
  preview?: string;
}

interface UserdataProps {
  id?: string,
  username: string,
  Year: string,
  Major: string,
  email: string,
  Faculty: string,
  avatar?: string,
  avatar_link?: string,
  friends?: OnlineFriend[]
}

export default function MessagesPage() {
  const [input, setInput] = useState("");
  const [tab, setTab] = useState<"messages" | "friends">("messages");
  const { sendMessage, addMessageHandler } = useWebSocket();
  const router = useRouter();

  const [friends, setFriends] = useState<OnlineFriend[]>([]);
  const [userData, setUserData] = useState<UserdataProps>({} as UserdataProps);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatKey, setChatKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedFriendToAdd, setSelectedFriendToAdd] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  // File attachment states
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedChatRef = useRef<Chat | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const dragCounter = useRef(0);

  // Emoji list for quick reactions
  const quickEmojis = [
    '😀', '😂', '🤣', '😊', '😍', '🥰', '😘', '🤗',
    '🤔', '😎', '😴', '🤯', '😱', '🥱', '😇', '🙃',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '👏',
    '🔥', '💯', '✨', '⚡', '💫', '🌟', '⭐', '🌈',
    '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🎯', '💎'
  ];

  const handleEmojiSelect = (emoji: string) => {
    setInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current && chatContainerRef.current) {
      // Scroll chỉ trong chat container, không ảnh hưởng đến scroll của trình duyệt
      const container = chatContainerRef.current;
      const element = messagesEndRef.current;
      
      // Tính toán vị trí scroll trong container
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const scrollTop = container.scrollTop;
      const targetScrollTop = scrollTop + (elementRect.top - containerRect.top);
      
      // Smooth scroll trong container
      container.scrollTo({
        top: targetScrollTop,
        behavior: "smooth"
      });
    }
  }, []);

  const reloadChatInterface = useCallback(() => {
    setChatKey(prev => prev + 1);
  }, []);


  const isValidChat = useCallback((chat: Chat) => {
    const flatParticipants = flattenParticipants(chat.participants);
    return (
      chat &&
      chat._id &&
      flatParticipants.some(p => p && p._id && p.username)
    );
  }, []);

  useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
      }
    }, []);
  const getUserMessage = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const userId = localStorage.getItem('userId');

      if (!userId) {
        console.error('No userId found');
        return;
      }

      const response = await axios.get(`${BASEURL}/api/get/user/chat/${userId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        }
      });

      if (response) {
        // console.log(response.data);
      }

      let chatData = [];
      if (response.data) chatData = response.data;
      else if (response.data.chats) chatData = response.data.chats;
      else if (Array.isArray(response.data)) chatData = response.data;

      const validChats = Array.isArray(chatData) ? chatData.filter(chat => isValidChat(chat)) : [];
      setChats(validChats);

      if (selectedChat) {
        const updatedSelectedChat = validChats.find(chat => chat._id === selectedChat._id);
        if (updatedSelectedChat) {
          setSelectedChat(updatedSelectedChat);
        }
      }

    } catch (error) {
      console.error("Error fetching user messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isValidChat, selectedChat]);

  // File handling functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFiles(Array.from(files));
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} quá lớn. Kích thước tối đa là 10MB.`);
        return false;
      }
      return true;
    });

    const newAttachedFiles: AttachedFile[] = validFiles.map(file => {
      const attachedFile: AttachedFile = { file };
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachedFiles(prev => prev.map(af => 
            af.file === file ? { ...af, preview: e.target?.result as string } : af
          ));
        };
        reader.readAsDataURL(file);
      }
      
      return attachedFile;
    });

    setAttachedFiles(prev => [...prev, ...newAttachedFiles]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const response = await axios.post(`${BASEURL}/api/chat/file/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      console.log(response.data.file.url)
      return response.data.file.url || response.data.url;
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error('Không thể tải file lên');
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;  

    if (dragCounter.current === 1) {
      setIsDragOver(true);  
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const items = Array.from(e.dataTransfer.items);
    const hasValidFiles = items.some(item => item.kind === 'file');
    
    if (hasValidFiles) {
      e.dataTransfer.dropEffect = 'copy';
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;

    if (dragCounter.current === 0) {
      setIsDragOver(false);  
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragCounter.current = 0;
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  useEffect(() => {
    return () => {
      dragCounter.current = 0;
    };
  }, []);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showEmojiPicker) {
        const target = event.target as HTMLElement;
        if (!target.closest('.emoji-picker-container')) {
          setShowEmojiPicker(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <FileImage size={16} className="text-blue-600" />;
    }
    return <File size={16} className="text-gray-600" />;
  };

  const renderFileMessage = (message: Text) => {
    if (!message.files || !Array.isArray(message.files)) return null;

    return (
      <div className="mt-2 space-y-2">
        {message.files.map((file, index) => {
          const isImage = file.type?.startsWith('image/');

          return isImage ? (
            <Image 
              width={480}
              height={480}
              key={index}
              src={file.url} 
              alt={file.name || "image"}
              className="max-w-xs rounded-lg cursor-pointer hover:opacity-90"
              onClick={() => window.open(file.url, '_blank')}
            />
          ) : (
            <div 
              key={index}
              className="bg-white bg-opacity-20 rounded-lg p-3 max-w-xs"
            >
              <div className="flex items-center gap-2">
                {getFileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{color:'black'}}>{file.name}</div>
                  <div className="text-xs opacity-75" style={{color:'black'}}>{formatFileSize(file.size)}</div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  style={{color: 'black'}}
                  onClick={() =>
                    downloadFileFromObject({
                      file: {
                        url: file.url,
                        name: file.name,
                        type: file.type,
                      },
                    })
                  }
                >
                  <Download size={14} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const handleGetOnlineFriends = async () => {
    try {
      if (userData && typeof window !== 'undefined') {
        const friends = userData.friends;
        const id = localStorage.getItem('userId');
        sendMessage({ type: 'online_friend', from: id || '123', friends: friends || [] });
      }
    } catch (error) {
      console.error('Error getting online friends:', error);
    }
  };

  const getUserData = async () => {
    if (typeof window === 'undefined') return;
    
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        console.error('No userId found');
        return;
      }

      const response = await axios.get(`${BASEURL}/api/get/userinfo/${userId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        }
      });
      
      if (response.status === 200) {
        setUserData(response.data.resUser);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const flattenParticipants = (participants: Participant[][] | Participant[]): Participant[] => {
    if (!participants || !Array.isArray(participants)) return [];
    if (participants.length > 0 && Array.isArray(participants[0])) {
      return (participants as Participant[][]).flat();
    }
    return participants as Participant[];
  };

  const getChatPartnerName = (chat: Chat) => {
    const flatParticipants = flattenParticipants(chat.participants);
    if (chat.isGroupChat) return chat.GroupName;
    const partner = flatParticipants.find(p => p._id !== currentUserId);
    return partner?.username || "Người dùng không xác định";
  };

  const getChatPartnerAvatar = (chat: Chat) => {
    const flatParticipants = flattenParticipants(chat.participants);
    if (chat.isGroupChat) return "/group-default.jpg";
    const partner = flatParticipants.find(p => p._id !== currentUserId);
    return partner?.avatar_link || "/schoolimg.jpg";
  };

  const handleSendMessage = async (chatid: string, to: string) => {
    if ((!input.trim() && attachedFiles.length === 0) || !selectedChat || !currentUserId) return;

    setIsUploading(true);
    
    try {
      const fileUrls: file[] = [];
      
      if (attachedFiles.length > 0) {
        for (const attachedFile of attachedFiles) {
          try {
            const fileUrl = await uploadFile(attachedFile.file);
            fileUrls.push({
              name: attachedFile.file.name,
              type: attachedFile.file.type,
              size: attachedFile.file.size,
              url: fileUrl
            });

            // console.log('fileURls:' , fileUrls)
          } catch (error) {
            console.error('Error uploading file:', error);
            alert(`Không thể tải file ${attachedFile.file.name}`);
          }
        }
      }

      const messageId = `${Date.now()}-${Math.random()}`;
      const newMessage: Text = {
        _id: messageId,
        userid: currentUserId,
        text: input.trim(),
        timestamp: new Date().toISOString(),
        ...(fileUrls.length > 0 && { files: fileUrls })
      };

      setSelectedChat(prev => prev && prev._id === chatid ? {
        ...prev,
        chatContext: [...(prev.chatContext || []), newMessage]
      } : prev);

      setChats(prevChats => prevChats.map(chat =>
        chat._id === chatid ? {
          ...chat,
          chatContext: [...(chat.chatContext || []), newMessage],
          lastMessage: newMessage,
          updatedAt: new Date().toISOString()
        } : chat
      ));

      const messageToSend = input.trim();
      setInput("");
      setAttachedFiles([]);

      if (fileUrls.length > 0) {
        sendMessage({
          type: 'file_to',
          chatid,
          from: currentUserId,
          to,
          context: messageToSend,
          file: fileUrls,
          isGroupChat: selectedChat.isGroupChat
        });
        // Không reload lại giao diện khi gửi file, chỉ reload khi nhận được phản hồi từ server
        // reloadChatInterface(); // <-- XÓA DÒNG NÀY nếu có
      } else {
        sendMessage({
          type: 'text_to',
          chatid,
          from: currentUserId,
          to,
          context: messageToSend,
          isGroupChat:selectedChat.isGroupChat
        });
        reloadChatInterface(); // Chỉ reload khi gửi text
      }
    } catch (error) {
      console.error("Send message error:", error);
    } finally {
      setIsUploading(false);
    }
  };

const isChatBlockedByPrivacy = (chat: Chat) => {
  if (chat.isGroupChat) return false;
  const flatParticipants = flattenParticipants(chat.participants);
  return flatParticipants.some(p => p.messagePrivacy === 'noone');
};

const renderselectedchat = () => {
  const chatBlocked = selectedChat && isChatBlockedByPrivacy(selectedChat);

  return (
    <div key={chatKey} className={`${
      selectedChat ? 'flex w-full' : 'hidden'
    } md:flex md:w-2/3 lg:w-2/4 flex-col h-full overflow-hidden relative`}>
      {selectedChat ? (
        <>
          <div className="p-2 sm:p-4 border-b font-semibold text-blue-700 flex items-center gap-2">
            {/* Back button for mobile */}
            <button 
              className="md:hidden mr-2 p-1 hover:bg-blue-100 rounded"
              onClick={() => setSelectedChat(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Chỉ hiển thị Image nếu không phải group chat */}
            {selectedChat.isGroupChat !== true && (
              <Image
                width={480}
                height={480}
                src={getChatPartnerAvatar(selectedChat)}
                alt={getChatPartnerName(selectedChat) || 'người dùng'}
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/schoolimg.jpg";
                }}
              />
            )}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base">{getChatPartnerName(selectedChat)}</span>
                {selectedChat.isGroupChat === true && (
                  <Users size={16} className="text-blue-600" />
                )}
              </div>
            </div>
          </div>

          <div
            ref={chatContainerRef}
            className="flex-1 p-2 sm:p-4 space-y-2 overflow-y-auto scrollbar-thin"
            style={{ 
              maxHeight: 'calc(100vh - 200px)',
              overflowAnchor: 'none',  // Tránh auto-scroll không mong muốn
              scrollBehavior: 'smooth' // Đảm bảo smooth scroll
            }}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isDragOver === true && dragCounter.current === 1 && (
              <div className="absolute inset-0 bg-opacity-20 z-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 text-center">
                  <Paperclip size={48} className="mx-auto mb-4 text-blue-600" />
                  <div className="text-lg font-medium text-blue-700">Thả file để đính kèm</div>
                  <div className="text-sm text-gray-600">Hỗ trợ tất cả loại file, tối đa 10MB</div>
                </div>
              </div>
            )}
            {selectedChat.chatContext && selectedChat.chatContext.length > 0 ? (
              <>
                {selectedChat.chatContext.map((message, index) => {
                  const userId = localStorage.getItem('userId');
                  const flatParticipants = flattenParticipants(selectedChat.participants);

                  // Xử lý logic cho group chat và individual chat
                  let isOtherUser;
                  if (selectedChat.isGroupChat === true) {
                    isOtherUser = message.userid !== userId;
                  } else {
                    const otherUser = flatParticipants.find(p => p._id !== userId);
                    isOtherUser = message.userid === otherUser?._id;
                  }

                  // Tìm thông tin người gửi tin nhắn để hiển thị avatar đúng
                  const messageSender = flatParticipants.find(p => p._id === message.userid);

                  return (
                    <div
                      key={`${message._id}-${index}-${chatKey}`}
                      className={`flex mb-4 ${isOtherUser ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`flex items-end max-w-xs lg:max-w-md ${isOtherUser ? 'flex-row' : 'flex-row-reverse'}`}>
                        {isOtherUser && (
                          <Image
                            width={480}
                            height={480}
                            src={selectedChat.isGroupChat === true ?
                              (messageSender?.avatar_link || "/schoolimg.jpg") :
                              getChatPartnerAvatar(selectedChat)
                            }
                            alt="Avatar"
                            className="w-8 h-8 rounded-full mr-2 mb-1 flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = "/schoolimg.jpg";
                            }}
                          />
                        )}

                        <div className="flex flex-col">
                          {/* Hiển thị tên người gửi trong group chat */}
                          {selectedChat.isGroupChat === true && isOtherUser && (
                            <div className="text-xs text-gray-600 mb-1 ml-2">
                              {messageSender?.username || messageSender?.username || 'Người dùng'}
                            </div>
                          )}

                          <div
                            className={`px-4 py-2 rounded-2xl max-w-xs lg:max-w-md break-words ${
                              isOtherUser
                                ? 'bg-gray-100 text-gray-900 rounded-bl-md'
                                : 'bg-blue-500 text-white rounded-br-md'
                            }`}
                          >
                            {message.text && (
                              <p className="text-sm leading-relaxed">{message.text}</p>
                            )}
                            {/* Đảm bảo renderFileMessage được gọi cho tất cả tin nhắn */}
                            {Array.isArray(message.files) && message.files.length > 0 && renderFileMessage(message)}
                          </div>

                          <p
                            className={`text-xs text-gray-500 mt-1 ${
                              isOtherUser ? 'text-left ml-2' : 'text-right mr-2'
                            }`}
                          >
                            {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400 text-center">
                  <div>Chưa có tin nhắn nào</div>
                  <div className="text-sm mt-2">
                    Bắt đầu cuộc trò chuyện với {getChatPartnerName(selectedChat)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* File preview area */}
          {attachedFiles.length > 0 && !chatBlocked && (
            <div className="p-2 sm:p-4 bg-gray-100 border-t">
              <div className="text-sm font-medium text-gray-700 mb-2">File đính kèm:</div>
              <div className="flex flex-wrap gap-2">
                {attachedFiles.map((attachedFile, index) => (
                  <div key={index} className="relative bg-white rounded-lg p-2 border flex items-center gap-2 max-w-full sm:max-w-xs">
                    {attachedFile.preview ? (
                      <Image
                        width={480}
                        height={480}
                        src={attachedFile.preview} alt="" className="w-8 h-8 rounded object-cover" />
                    ) : (
                      getFileIcon(attachedFile.file.type)
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs truncate">{attachedFile.file.name}</div>
                      <div className="text-xs text-gray-500">{formatFileSize(attachedFile.file.size)}</div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nếu bị chặn bởi messagePrivacy thì không render form gửi tin nhắn và các nút */}
          {chatBlocked ? (
            <div className="p-2 sm:p-4 border-t bg-gray-100 text-center text-gray-500 font-semibold text-sm sm:text-base">
              Không thể kết nối tới người này. Người dùng đã tắt chức năng nhận tin nhắn.
            </div>
          ) : (
            <form
              className="flex items-center gap-2 p-2 sm:p-4 border-t bg-white relative"
              onSubmit={handleSubmit}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              
              {/* File attachment button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="p-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip size={18} className="text-gray-600" />
              </Button>

              {/* Emoji picker button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="p-2 relative emoji-picker-container"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile size={18} className="text-gray-600" />
              </Button>

              {/* Emoji picker dropdown */}
              {showEmojiPicker && (
                <div className="absolute bottom-full left-12 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 w-80 emoji-picker-container">
                  <div className="text-sm font-medium text-gray-700 mb-2">Chọn emoji:</div>
                  <div className="grid grid-cols-8 gap-2 max-h-40 overflow-y-auto">
                    {quickEmojis.map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        className="text-xl hover:bg-gray-100 rounded p-1 transition-colors"
                        onClick={() => handleEmojiSelect(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <button
                      type="button"
                      className="text-xs text-gray-500 hover:text-gray-700"
                      onClick={() => setShowEmojiPicker(false)}
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              )}

              <Input
                className="flex-1 text-sm sm:text-base"
                placeholder="Nhập tin nhắn..."
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              
              <Button
                type="submit"
                className="bg-blue-600 text-white px-2 sm:px-4"
                disabled={(!input.trim() && attachedFiles.length === 0) || isUploading}
              >
                {isUploading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </Button>
            </form>
          )}
        </>
      ) : (
        <>
          <div className="p-2 sm:p-4 border-b font-semibold text-blue-700 flex items-center gap-2">
            <span className="text-sm sm:text-base" style={{ color: "#0694FA" }}>Chọn cuộc trò chuyện</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-blue-50 flex flex-col items-center justify-center">
            <div className="text-gray-400">Chọn một cuộc trò chuyện để bắt đầu</div>
          </div>
          <form
            className="flex items-center gap-2 p-4 border-t bg-white"
            onSubmit={e => {
              e.preventDefault();
              setInput("");
            }}
          >
            <Button type="button" variant="ghost" size="sm" className="p-2" disabled>
              <Paperclip size={18} className="text-gray-400" />
            </Button>
            <Button type="button" variant="ghost" size="sm" className="p-2" disabled>
              <Smile size={18} className="text-gray-400" />
            </Button>
            <Input
              className="flex-1"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled
            />
            <Button
              type="submit"
              className="bg-blue-600 text-white px-4"
              disabled
            >
              <Send size={18} />
            </Button>
          </form>
        </>
      )}
    </div>
  );
}

  useEffect(() => {
    // Chỉ scroll khi có tin nhắn mới và chat container đã được render
    if (selectedChat?.chatContext && selectedChat.chatContext.length > 0) {
      // Sử dụng setTimeout để đảm bảo DOM đã được cập nhật
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedChat?.chatContext, scrollToBottom, chatKey]);

 
  useEffect(() => {
  if (typeof window !== 'undefined') {
    const userId = (localStorage.getItem('userId') || "").trim();
    setCurrentUserId(userId);
    getUserData();

    const fetchUserMessage = async () => {
      try {
        setIsLoading(true);
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        const userId = localStorage.getItem('userId');

        if (!userId) {
          console.error('No userId found');
          return;
        }

        const response = await axios.get(`${BASEURL}/api/get/user/chat/${userId}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          }
        });

        let chatData = [];
        if (response.data) chatData = response.data;
        else if (response.data.chats) chatData = response.data.chats;
        else if (Array.isArray(response.data)) chatData = response.data;

        const validChats = Array.isArray(chatData) ? chatData.filter(chat => isValidChat(chat)) : [];
        setChats(validChats);

        // So sánh kỹ trước khi setSelectedChat để tránh vòng lặp
        if (selectedChat) {
          const updatedSelectedChat = validChats.find(chat => chat._id === selectedChat._id);
          // Chỉ update nếu context hoặc thông tin chat thực sự thay đổi
          if (
            updatedSelectedChat &&
            JSON.stringify(updatedSelectedChat.chatContext) !== JSON.stringify(selectedChat.chatContext)
          ) {
            setSelectedChat(updatedSelectedChat);
          }
        }

      } catch (error) {
        console.error("Error fetching user messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserMessage();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isValidChat, selectedChat?._id]);

 useEffect(() => {
  const handler = (message: WebSocketMessage) => {
    // console.log('Received WebSocket message:', message);
    
    if (message.type === 'online_friend') {
      if (Array.isArray(message.friends) && message.friends.length > 0 && typeof message.friends[0] === "object") {
        setFriends(message.friends as OnlineFriend[]);
      } else {
        setFriends([]);
      }
    }

    if (message.type === 'text_to' || message.type === 'file_to') {
        // console.log('Received message:', message);
        
        const newMessage: Text = {
          _id: `${Date.now()}-${Math.random()}`,
          userid: message.from || "",
          text: message.context || "",
          timestamp: new Date().toISOString(),
          ...(message.file && { file: message.file })
        };

      setChats(prevChats =>
        prevChats.map(chat =>
          chat._id === message.chatid ? {
            ...chat,
            chatContext: [
              ...(chat.chatContext || []),
              newMessage
            ],
            lastMessage: newMessage,
            updatedAt: new Date().toISOString()
          } : chat
        )
      );

      reloadChatInterface();
      
      setTimeout(() => {
        getUserMessage();
      }, 100);
    }

    if (message.type === 'create_group') {
      getUserMessage();
    }


    if (message.type === 'add_to_group') {
      getUserMessage();
      // Thêm thông báo vào UI chat hiện tại nếu có message
      if (typeof message.message === 'string' && message.message && message.chatid) {
        setChats(prevChats =>
          prevChats.map(chat =>
            chat._id === message.chatid
              ? {
                  ...chat,
                  chatContext: [
                    ...(chat.chatContext || []),
                    {
                      _id: `system-${Date.now()}`,
                      userid: 'system',
                      text: message.message || '',
                      timestamp: new Date().toISOString(),
                      files: [],
                    } as Text,
                  ],
                }
              : chat
          )
        );
      }
    }

     if (message.type === 'leave_group') {
      getUserMessage();
  
    }

  };

  const removeHandler = addMessageHandler(handler);
  return () => { 
    if (removeHandler) removeHandler(); 
  };
}, [addMessageHandler, getUserMessage, reloadChatInterface]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat || !currentUserId) return;
    
    const userId = localStorage.getItem('userId')?.trim();
    const flatParticipants = flattenParticipants(selectedChat.participants);
    const otherUser = flatParticipants.find(p => p._id !== userId);
    
    if (otherUser?._id) {
      handleSendMessage(selectedChat._id, otherUser._id);
    }
  };
  
  const handleSelectOnlineFriend = (friendId: string) => {
    const existingChat = chats.find(chat => {
      const flatParticipants = flattenParticipants(chat.participants);
      return !chat.isGroupChat && flatParticipants.some(p => p._id === friendId);
    });

    if (existingChat) {
      setSelectedChat(existingChat);
      setTab("messages");
    } else {
      console.log(`Chưa có cuộc trò chuyện với ${friendId}`);
    }
  }

  // Effect để scroll đến cuối khi chọn chat mới
  useEffect(() => {
    if (selectedChat && chatContainerRef.current) {
      // Đợi một chút để DOM được render hoàn toàn
      const timeoutId = setTimeout(() => {
        const container = chatContainerRef.current;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 150);
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedChat?._id]); // Chỉ trigger khi chọn chat khác

  return (
    <div className="min-h-screen bg-gradient-to-br bg-[#F1F1E6]">
      <NavigationBar />
      <div className="max-w-7xl mx-auto p-2 sm:p-4 h-[calc(100vh-6vh)] mt-[6vh] overflow-hidden">
        <div className="flex h-full bg-white rounded-xl shadow-lg border overflow-hidden">
        
          {/* Left: Messages/Friends List */}
          <div className={`${
            selectedChat ? 'hidden md:flex' : 'w-full'
          } md:w-1/3 lg:w-1/4 border-r border-gray-200 bg-gray-50 flex-col h-full overflow-hidden`}>
            
            {/* Header with tabs */}
            <div className="p-3 sm:p-4 bg-white border-b border-gray-200 shadow-sm">
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  className={`flex-1 py-2 px-3 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                    tab === "messages"
                      ? "bg-[#0694FA] text-white shadow-sm"
                      : "text-gray-600 hover:text-[#0694FA] hover:bg-white"
                  }`}
                  onClick={() => setTab("messages")}
                >
                  💬 Tin nhắn
                </button>
                <button
                  className={`flex-1 py-2 px-3 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                    tab === "friends" 
                      ? "bg-blue-600 text-white shadow-sm" 
                      : "text-gray-600 hover:text-blue-600 hover:bg-white"
                  }`}
                  onClick={() => {
                    setTab("friends");
                    handleGetOnlineFriends();
                  }}
                >
                  👥 Bạn bè
                </button>
              </div>
            </div>

            {/* List content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                  <span className="text-sm">Đang tải...</span>
                </div>
              ) : tab === "messages" ? (
                chats.length > 0 ? (
                  <div className="p-2">
                    {chats
                      .filter(chat => isValidChat(chat))
                      .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
                      .map((chat) => {
                        const partnerName = getChatPartnerName(chat);
                        const partnerAvatar = getChatPartnerAvatar(chat);
                        const lastMessage = chat.lasttext || chat.chatContext?.[chat.chatContext.length - 1];
                       
                        return (
                          <div 
                            key={`${chat._id}-${chatKey}`}
                            className={`flex items-center gap-3 p-3 mb-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                              selectedChat?._id === chat._id 
                                ? "bg-blue-100 border-2 border-blue-300 shadow-sm" 
                                : "bg-white hover:bg-blue-50 border border-gray-100"
                            }`}
                            onClick={() => setSelectedChat(chat)}
                          >
                            {chat.isGroupChat === true ? (
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm">
                                <Users className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                              </div>
                            ) : (
                              <div className="relative">
                                <Image
                                  src={partnerAvatar}
                                  alt={partnerName|| ' '}
                                  width={480}
                                  height={480}
                                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                  onError={(e) => {
                                    e.currentTarget.src = "/schoolimg.jpg";
                                  }}
                                />
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                                {partnerName}
                              </div>
                              {lastMessage && (
                                <div className="text-xs text-gray-500 truncate mt-0.5">
                                  {lastMessage.text || "📎 File đính kèm"}
                                </div>
                              )}
                            </div>
                            
                            {/* Time indicator */}
                            {chat.updatedAt && (
                              <div className="text-xs text-gray-400">
                                {new Date(chat.updatedAt).toLocaleTimeString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
                    <div className="text-4xl mb-3">💬</div>
                    <div className="text-center">
                      <div className="font-medium mb-1">Chưa có cuộc trò chuyện nào</div>
                      <div className="text-sm">Bắt đầu trò chuyện với bạn bè!</div>
                    </div>
                  </div>
                )
              ) : (
                friends.length > 0 ? (
                  <div className="p-2">
                    {friends
                      .filter(friend => friend.online) 
                      .map((friend) => (
                        <div 
                          key={friend._id} 
                          className="flex items-center gap-3 p-3 mb-2 bg-white rounded-xl cursor-pointer transition-all duration-200 hover:bg-green-50 hover:shadow-md border border-gray-100"
                          onClick={() => handleSelectOnlineFriend(friend._id)}
                        >
                          <div className="relative">
                            <Image
                              width={480}
                              height={480}
                              src={friend.avatar_link && friend.avatar_link !== "" ? friend.avatar_link : "/schoolimg.jpg"}
                              alt={friend.username}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white shadow-sm"
                              onError={(e) => {
                                e.currentTarget.src = "/schoolimg.jpg";
                              }}
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 text-sm sm:text-base">{friend.username}</div>
                            <div className="text-xs text-green-600 flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Đang hoạt động
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
                    <div className="text-4xl mb-3">👥</div>
                    <div className="text-center">
                      <div className="font-medium mb-1">Chưa có bạn bè hoạt động</div>
                      <div className="text-sm">Bạn bè sẽ xuất hiện khi online</div>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Create group button */}
            {tab === "messages" && (
              <div className="p-3 border-t border-gray-200 bg-white">
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-[#0694FA] hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium py-2.5 rounded-lg shadow-sm transition-all duration-200">
                   Tạo nhóm chat
                </Button>
              </div>
            )}
          </div>

          <CreateGroupModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
          />

          {/* Middle: Chat */}
          {renderselectedchat()}

          {/* Right: Info */}
          <div className="hidden lg:flex w-1/4 border-l border-gray-200 bg-gray-50 flex-col h-full overflow-hidden">
            <div className="p-4 bg-white border-b border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                ℹ️ Thông tin
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {selectedChat ? (
                <div className="space-y-4">
                  {/* Avatar and name */}
                  <div className="text-center">
                    {selectedChat.isGroupChat ? (
                      <div className="w-20 h-20 xl:w-24 xl:h-24 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                        <Users className="w-10 h-10 xl:w-12 xl:h-12 text-white" />
                      </div>
                    ) : (
                      <Image
                        width={480}
                        height={480}
                        src={getChatPartnerAvatar(selectedChat)}
                        alt={getChatPartnerName(selectedChat || " ") ?? "Người dùng"}
                        className="w-20 h-20 xl:w-24 xl:h-24 mx-auto rounded-full object-cover border-4 border-white shadow-lg mb-3"
                        onError={(e) => {
                          e.currentTarget.src = "/schoolimg.jpg";
                        }}
                      />
                    )}

                    <h4 className="font-bold text-gray-900 text-lg mb-2">
                      {selectedChat.isGroupChat
                        ? selectedChat.GroupName
                        : getChatPartnerName(selectedChat)}
                    </h4>

                    <p className="text-gray-500 text-sm">
                      {selectedChat.isGroupChat
                        ? `Nhóm có ${flattenParticipants(selectedChat.participants).length} thành viên`
                        : "Cuộc trò chuyện riêng tư"}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-3">
                    {selectedChat.isGroupChat ? (
                      <>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => setShowMembers(!showMembers)}
                        >
                          👥 {showMembers ? "Ẩn" : "Xem"} thành viên
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => setShowAddMemberModal(true)}
                        >
                          ➕ Thêm thành viên
                        </Button>

                        {showMembers && (
                          <div className="bg-white rounded-lg border p-3 max-h-48 overflow-y-auto">
                            <h5 className="font-medium text-gray-900 mb-2">Thành viên:</h5>
                            {flattenParticipants(selectedChat.participants).map((user) => (
                              <div key={user._id} className="flex items-center gap-2 py-2 text-sm">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                  👤
                                </div>
                                <span className="text-gray-700">{user.username}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <Button
                          variant="destructive"
                          className="w-full justify-start"
                          onClick={() => {
                            if (!selectedChat) return;
                            const userId = localStorage.getItem("userId");
                            sendMessage({
                              type: "leave_group",
                              chatid: selectedChat._id,
                              from: userId || undefined,
                              groupName: selectedChat.GroupName || "nhóm"
                            });
                          }}
                        >
                          🚪 Rời nhóm
                        </Button>
                      </>
                    ) : (
                      <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white justify-start"
                        onClick={() => {
                          const userId = localStorage.getItem("userId");
                          const flatParticipants = flattenParticipants(selectedChat.participants);
                          const otherUser = flatParticipants.find((p) => p._id !== userId);
                          router.push(`/user/profile/${otherUser?._id}`);
                        }}
                      >
                        👤 Xem hồ sơ
                      </Button>
                    )}
                  </div>

                  {/* Add member modal */}
                  {showAddMemberModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-lg text-gray-900">Thêm thành viên</h3>
                          <button
                            onClick={() => setShowAddMemberModal(false)}
                            className="text-gray-400 hover:text-gray-600 p-1"
                          >
                            <X size={20} />
                          </button>
                        </div>
                        
                        <div className="max-h-60 overflow-y-auto mb-4">
                          {userData.friends && userData.friends.length > 0 ? (
                            <div className="space-y-2">
                              {userData.friends
                                .filter(f => !flattenParticipants(selectedChat.participants).some(p => p._id === f._id))
                                .map(friend => (
                                  <div
                                    key={friend._id}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                      selectedFriendToAdd === friend._id 
                                        ? 'bg-blue-100 border-2 border-blue-300' 
                                        : 'bg-gray-50 hover:bg-blue-50 border border-gray-200'
                                    }`}
                                    onClick={() => setSelectedFriendToAdd(friend._id)}
                                  >
                                    <Image
                                      width={32}
                                      height={32}
                                      src={friend.avatar_link || "/schoolimg.jpg"}
                                      alt={friend.username}
                                      className="w-8 h-8 rounded-full object-cover border"
                                    />
                                    <span className="font-medium text-gray-900">{friend.username}</span>
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <div className="text-center text-gray-400 py-8">
                              <div className="text-3xl mb-2">👥</div>
                              <div>Không có bạn bè để thêm</div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              setShowAddMemberModal(false);
                              setSelectedFriendToAdd("");
                            }}
                          >
                            Hủy
                          </Button>
                          <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={!selectedFriendToAdd}
                            onClick={() => {
                              if (!selectedChat) return;
                              sendMessage({
                                type: "add_to_group",
                                chatid: selectedChat._id,
                                to: selectedFriendToAdd,
                                from: currentUserId
                              });
                              setShowAddMemberModal(false);
                              setSelectedFriendToAdd("");
                            }}
                          >
                            Thêm
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <div className="text-5xl mb-4">💬</div>
                  <div className="text-center">
                    <div className="font-medium mb-2" style={{ color: "#0694FA" }}>Chọn cuộc trò chuyện</div>
                    <div className="text-sm">Thông tin chi tiết sẽ hiển thị ở đây</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}