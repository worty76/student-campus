'use client'
import React, { useState, useEffect, useCallback, useRef } from "react";
import NavigationBar from "@/app/(main)/layouts/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation'
import { Send, Paperclip, X, FileImage, File, Download } from "lucide-react";
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

  

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    <div key={chatKey} className="w-2/4 flex flex-col h-full overflow-hidden relative">
      {selectedChat ? (
        <>
          <div className="p-4 border-b font-semibold text-blue-700 flex items-center gap-2">
            {/* Chỉ hiển thị Image nếu không phải group chat */}
            {selectedChat.isGroupChat !== true && (
              <Image
                width={480}
                height={480}
                src={getChatPartnerAvatar(selectedChat)}
                alt={getChatPartnerName(selectedChat) || 'người dùng'}
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/schoolimg.jpg";
                }}
              />
            )}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span>{getChatPartnerName(selectedChat)}</span>
                {/* Kiểm tra isGroupChat và hiển thị icon Users */}
                {selectedChat.isGroupChat === true && (
                  <Users size={16} className="text-blue-600" />
                )}
              </div>
            </div>
          </div>

          <div
            ref={chatContainerRef}
            className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin"
            style={{ maxHeight: 'calc(100vh - 200px)' }}
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
            <div className="p-4 bg-gray-100 border-t">
              <div className="text-sm font-medium text-gray-700 mb-2">File đính kèm:</div>
              <div className="flex flex-wrap gap-2">
                {attachedFiles.map((attachedFile, index) => (
                  <div key={index} className="relative bg-white rounded-lg p-2 border flex items-center gap-2 max-w-xs">
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
            <div className="p-4 border-t bg-gray-100 text-center text-gray-500 font-semibold">
              Không thể kết nối tới người này. Người dùng đã tắt chức năng nhận tin nhắn.
            </div>
          ) : (
            <form
              className="flex items-center gap-2 p-4 border-t bg-white"
              onSubmit={handleSubmit}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="p-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip size={18} className="text-gray-600" />
              </Button>
              <Input
                className="flex-1"
                placeholder="Nhập tin nhắn..."
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <Button
                type="submit"
                className="bg-blue-600 text-white px-4"
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
          <div className="p-4 border-b font-semibold text-blue-700 flex items-center gap-2">
            <span>Chọn cuộc trò chuyện</span>
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
    scrollToBottom();
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
  return (
    <div className="overflow-hidden">
      <NavigationBar />
      <div className="max-w-7xl mx-auto p-4 h-[90vh] mt-[6vh] overflow-hidden">
        <div className="flex h-full bg-white rounded-lg shadow border overflow-hidden">
        
          {/* Left: Messages/Friends List */}
          <div className="w-1/4 border-r bg-blue-50 flex flex-col h-full overflow-hidden">
            <div className="p-4 font-bold text-blue-700 text-lg border-b flex gap-2">
              <button
                className={`flex-1 py-1 rounded ${tab === "messages" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"}`}
                onClick={() => setTab("messages")}
              >
                Tin nhắn
              </button>
              <button
                className={`flex-1 py-1 rounded ${tab === "friends" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"}`}
                onClick={() => {
                  setTab("friends");
                  handleGetOnlineFriends();
                }}
              >
                Bạn bè hoạt động
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {isLoading ? (
                <div className="text-center text-gray-400 mt-8">Đang tải...</div>
              ) : tab === "messages" ? (
                chats.length > 0 ? (
                  chats
                    .filter(chat => isValidChat(chat))
                    .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
                    .map((chat) => {
                      const partnerName = getChatPartnerName(chat);
                      const partnerAvatar = getChatPartnerAvatar(chat);
                      const lastMessage = chat.lasttext || chat.chatContext?.[chat.chatContext.length - 1];
                     
                      return (
  <div 
    key={`${chat._id}-${chatKey}`}
    className={`flex items-center gap-3 p-3 hover:bg-blue-100 rounded cursor-pointer border-b border-blue-100 ${
      selectedChat?._id === chat._id ? "bg-blue-200" : ""
    }`}
    onClick={() => setSelectedChat(chat)}
  >
                          {chat.isGroupChat === true ? (
                            <div className="w-12 h-12 rounded-full bg-blue-300 flex items-center justify-center">
                              <Users className="text-white w-6 h-6" />
                            </div>
                          ) : (
                            <Image
                              src={partnerAvatar}
                              alt={partnerName|| ' '}
                              width={480}
                              height={480}
                              className="w-12 h-12 rounded-full object-cover border"
                              onError={(e) => {
                                e.currentTarget.src = "/schoolimg.jpg";
                              }}
                            />
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-blue-900 truncate">
                              {partnerName}
                            </div>
                            {lastMessage && (
                              <div className="text-xs text-gray-600 whitespace-pre-wrap break-all">
                                {lastMessage.text}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="text-center text-gray-400 mt-8">
                    <div>Chưa có cuộc trò chuyện nào</div>
                  </div>
                )
              ) : (
                friends.length > 0 ? (
                    friends
                      .filter(friend => friend.online) 
                      .map((friend) => (
                        <div 
                          key={friend._id} 
                          className="flex items-center gap-3 p-3 hover:bg-blue-100 rounded cursor-pointer border-b border-blue-100"
                          onClick={() => handleSelectOnlineFriend(friend._id)} // Thêm onClick handler
                        >
                          <div className="relative">
                            <Image
                              width={480}
                            height={480}
                              src={friend.avatar_link && friend.avatar_link !== "" ? friend.avatar_link : "/schoolimg.jpg"}
                              alt={friend.username}
                              className="w-10 h-10 rounded-full object-cover border"
                              onError={(e) => {
                                e.currentTarget.src = "/schoolimg.jpg";
                              }}
                            />
                            {/* Thêm indicator online */}
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-blue-900">{friend.username}</span>
                            <div className="text-xs text-green-600">Đang hoạt động</div>
                          </div>
                        </div>
                      ))
                 ) : (
                  <div className="text-center text-gray-400 mt-8">Chưa có bạn bè hoạt động</div>
                )
              )}
            </div>
            {tab === "messages" && (
              <Button
              onClick={() => setIsModalOpen(true)}
              className="m-4 bg-blue-600 text-white">Tạo nhóm chat</Button>
            )}
            
          </div>
           <CreateGroupModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
              />

          {/* Middle: Chat */}
          {renderselectedchat()}

          {/* Right: Info */}
         <div className="w-1/4 border-l bg-blue-50 flex flex-col items-center p-6 h-full overflow-hidden">
  {selectedChat ? (
    <>
      {selectedChat.isGroupChat ? (
        <div className="w-24 h-24 mb-4 rounded-full bg-blue-200 flex items-center justify-center">
          <Users className="w-12 h-12 text-blue-700" />
        </div>
      ) : (
        <Image
          width={480}
          height={480}
          src={getChatPartnerAvatar(selectedChat)}
          alt={getChatPartnerName(selectedChat || " ") ?? "Người dùng"}
          className="w-24 h-24 rounded-full object-cover border mb-4"
          onError={(e) => {
            e.currentTarget.src = "/schoolimg.jpg";
          }}
        />
      )}

      <div className="font-bold text-blue-900 text-lg mb-2">
        {selectedChat.isGroupChat
          ? selectedChat.GroupName
          : getChatPartnerName(selectedChat)}
      </div>

      <div className="text-gray-500 mb-4 text-sm text-center">
        {selectedChat.isGroupChat
          ? `Nhóm có ${flattenParticipants(selectedChat.participants).length} thành viên`
          : "Cuộc trò chuyện riêng tư"}
      </div>

      {selectedChat.isGroupChat && (
        <>
          <Button
            variant="secondary"
            className="w-full mb-2"
            onClick={() => setShowMembers(!showMembers)}
          >
            {showMembers ? "Ẩn thành viên" : "Thành viên"}
          </Button>

          {/* Nút thêm thành viên */}
          <Button
            variant="outline"
            className="w-full mb-2"
            onClick={() => setShowAddMemberModal(true)}
          >
            Thêm thành viên
          </Button>

          {showMembers && (
            <div className="w-full max-h-48 overflow-y-auto bg-white rounded border p-2 mb-2">
              {flattenParticipants(selectedChat.participants).map((user) => (
                <div key={user._id} className="text-sm text-gray-700 py-1 px-2 hover:bg-blue-100 rounded">
                  {user.username}
                </div>
              ))}
            </div>
          )}

          {/* Modal chọn bạn để thêm vào nhóm */}
          {showAddMemberModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="bg-white rounded-lg p-6 w-80">
                <div className="font-bold mb-2">Chọn bạn để thêm vào nhóm</div>
                <div className="max-h-48 overflow-y-auto">
                  {userData.friends && userData.friends.length > 0 ? (
                    userData.friends
                      .filter(f => !flattenParticipants(selectedChat.participants).some(p => p._id === f._id))
                      .map(friend => (
                        <div
                          key={friend._id}
                          className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-blue-100 ${selectedFriendToAdd === friend._id ? 'bg-blue-200' : ''}`}
                          onClick={() => setSelectedFriendToAdd(friend._id)}
                        >
                          <Image
                            width={32}
                            height={32}
                            src={friend.avatar_link || "/schoolimg.jpg"}
                            alt={friend.username}
                            className="w-8 h-8 rounded-full object-cover border"
                          />
                          <span className="font-medium text-blue-900">{friend.username}</span>
                        </div>
                      ))
                  ) : (
                    <div className="text-gray-400">Không có bạn bè để thêm</div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    className="flex-1 bg-blue-600 text-white"
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
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={() => {
                      setShowAddMemberModal(false);
                      setSelectedFriendToAdd("");
                    }}
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {selectedChat.isGroupChat ? (
        <Button
          variant="destructive"
          className="w-full mb-2"
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
          Rời nhóm
        </Button>
      ) : (
        <div>
        <Button
          className="bg-blue-600 text-white w-full mb-2"
          onClick={() => {
            const userId = localStorage.getItem("userId");
            const flatParticipants = flattenParticipants(selectedChat.participants);
            const otherUser = flatParticipants.find((p) => p._id !== userId);
            router.push(`/user/profile/${otherUser?._id}`);
          }}
        >
          Xem hồ sơ
        </Button>
        </div>
      )}

     
    </>
  ) : (
    <>
      <div className="w-24 h-24 rounded-full bg-blue-200 mb-4" />
      <div className="font-bold text-blue-900 text-lg mb-2">Thông tin</div>
      <div className="text-gray-500 mb-4 text-sm">
        Chọn một cuộc trò chuyện để xem chi tiết
      </div>
      <Button className="bg-blue-600 text-white w-full mb-2" disabled>
        Xem hồ sơ
      </Button>
      <Button className="bg-blue-600 text-white w-full mb-2" disabled>
        Tạo Nhóm
      </Button>
      <Button variant="outline" className="w-full" disabled>
        Chặn
      </Button>
    </>
  )}
</div>
        </div>
      </div>
    </div>
  );
}