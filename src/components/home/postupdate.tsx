import React, { useRef, useState, useEffect } from "react";
import { X, ImageIcon, Smile, FileText } from "lucide-react";
import axios from "axios";
import Image from "next/image";
import { BASEURL } from "@/app/constants/url";

interface FileAttachment {
  url: string;
  filename: string;
  mimetype: string;
  filetype: string;
  file?: File; // Add optional File object for new uploads
}

interface Attachment {
  file?: FileAttachment;
  url?: string;
  filename?: string;
  mimetype?: string;
  filetype?: string;
}

interface PostUpdateProps {
  _id: string; // post id
  userid: string;
  content?: string;
  files?: Attachment[];
  onClose: () => void;
  userData?: UserdataProps;
}

interface UserdataProps {
  id?: string;
  username: string;
  avatar_link?: string;

}

const PostUpdate: React.FC<PostUpdateProps> = ({ _id, userid, content, files, onClose, userData }) => {
  const [postContent, setPostContent] = useState(content || "");
  const [postFiles, setPostFiles] = useState<Attachment[]>(files || []);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiList = [
    "😀",
    "😂",
    "😍",
    "🥳",
    "😎",
    "😭",
    "👍",
    "🔥",
    "❤️",
    "🎉",
    "😃",
    "😅",
    "😆",
    "😉",
    "😊",
    "😋",
    "😜",
    "🤩",
    "😏",
    "😢",
  ];
  useEffect(() => {
    console.log(content, files);
    setPostContent(content || "");
    setPostFiles(files || []);
  }, [content, files]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Thêm file ảnh mới
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(file => {
        if (!file.type.startsWith('image/')) {
          alert('Vui lòng chọn file hình ảnh hợp lệ');
          return false;
        }
        if (file.size > 5 * 1024 * 1024) {
          alert('File hình ảnh phải nhỏ hơn 5MB');
          return false;
        }
        return true;
      });
      
      const newAttachments: Attachment[] = selectedFiles.map(file => ({
        file: {
          url: URL.createObjectURL(file),
          filename: file.name,
          mimetype: file.type,
          filetype: file.type.split('/')[0],
          file,
        }
      }));
      
      setPostFiles(prev => [...prev, ...newAttachments]);
      setUploadStatus("");
    }
  };

  // Thêm file tài liệu mới
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(file => {
        if (file.size > 10 * 1024 * 1024) {
          alert('File phải nhỏ hơn 10MB');
          return false;
        }
        return true;
      });
      
      const newAttachments: Attachment[] = selectedFiles.map(file => ({
        file: {
          url: URL.createObjectURL(file),
          filename: file.name,
          mimetype: file.type,
          filetype: file.type.split('/')[0],
          file,
        }
      }));
      
      setPostFiles(prev => [...prev, ...newAttachments]);
      setUploadStatus("");
    }
  };

  const removeFile = (idx: number) => {
    setPostFiles(prev => prev.filter((_, i) => i !== idx));
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setPostContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Các icon chức năng
  const postIcons = [
    {
      id: 'image',
      icon: <ImageIcon className="text-green-500" size={24} />,
      title: 'Hình ảnh',
      onClick: () => imageInputRef.current?.click(),
      component: (
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={imageInputRef}
          onChange={handleImageChange}
          multiple
        />
      )
    },
    {
      id: 'file',
      icon: <FileText className="text-blue-500" size={24} />,
      title: 'Tài liệu',
      onClick: () => fileInputRef.current?.click(),
      component: (
        <input
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
        />
      )
    },
    {
      id: 'emoji',
      icon: <Smile className="text-yellow-400" size={24} />,
      title: 'Cảm xúc/hoạt động',
      onClick: () => setShowEmojiPicker(!showEmojiPicker),
      component: null
    }
  ];

  const handleUpdate = async () => {
    if (!postContent.trim() && postFiles.length === 0) {
      alert('Vui lòng nhập nội dung hoặc chọn file');
      return;
    }

    setIsLoading(true);
    setUploadStatus("Đang cập nhật bài...");

    const formData = new FormData();
    formData.append("userId", userid);
    formData.append("text", postContent.trim());
    
    // Separate new files and existing attachments
    const newFiles: File[] = [];
    const existingAttachments: Attachment[] = [];
    
    postFiles.forEach((attachment) => {
      const fileObj = attachment.file?.file;
      if (fileObj && fileObj instanceof File) {
        // This is a new file upload
        newFiles.push(fileObj);
      } else {
        // This is an existing attachment (no changes)
        existingAttachments.push(attachment);
      }
    });
    
    // Add new files to FormData
    newFiles.forEach((file) => {
      formData.append("files", file, file.name);
    });
    
    // Add existing attachments as JSON if there are any
    if (existingAttachments.length > 0) {
      formData.append("existingAttachments", JSON.stringify(existingAttachments));
    }

    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const res = await axios.put(
        `${BASEURL}/api/update/post/${_id}`,
        formData,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res && (res.status === 200 || res.status === 201)) {
        setUploadStatus('Cập nhật bài thành công!');
        setTimeout(() => {
          setPostContent('');
          setPostFiles([]);
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error("Error:", error);
      setUploadStatus("Có lỗi xảy ra khi cập nhật bài. Vui lòng thử lại.");
      if (error instanceof Error) {
        console.error("Error message:", error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isPostEnabled = (postContent.trim() || postFiles.length > 0) && !isLoading;

  return (
    <div className="bg-white rounded-xl w-full max-w-2xl mx-auto p-0 relative shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-3 border-b border-blue-100">
        <span className="text-lg font-semibold text-blue-900">Chỉnh sửa bài viết</span>
        <button
          onClick={onClose}
          className="text-blue-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50"
          disabled={isLoading}
        >
          <X size={24} />
        </button>
      </div>

      {/* User info */}
      <div className="flex items-center gap-3 px-6 pt-5">
        <Image
          src={userData?.avatar_link ? userData.avatar_link : "/schoolimg.jpg"}
          alt="avatar"
          className="w-12 h-12 rounded-full object-cover bg-blue-100"
          width={80}
          height={80}
        />
        <div>
          <div className="text-blue-900 font-semibold text-lg">{userData?.username || "Lê Khánh"}</div>
          
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pt-3">
        <textarea
          className="w-full bg-transparent text-lg text-blue-900 outline-none resize-none placeholder-blue-400 border-none"
          rows={6}
          placeholder="Bạn đang nghĩ gì thế?"
          value={postContent}
          onChange={e => setPostContent(e.target.value)}
          disabled={isLoading}
        />

        {/* Preview files (images & docs) */}
        {postFiles.length > 0 && (
          <div className="mt-2 flex flex-col gap-2">
            {postFiles.map((attachment, idx) => {
              // Get file object from attachment
              const fileObj = attachment.file || {
                url: attachment.url || '',
                filename: attachment.filename || '',
                mimetype: attachment.mimetype || '',
                filetype: attachment.filetype || ''
              };
              
              const isImage = fileObj.mimetype?.startsWith("image/");
              
              return (
                <div key={idx} className="flex items-center gap-2 text-blue-800 bg-blue-50 p-3 rounded-lg">
                  {isImage ? (
                    <Image
                      src={fileObj.url || "/api/placeholder/80/80"}
                      alt="preview"
                      className="w-16 h-16 object-cover rounded"
                      width={80}
                      height={80}
                    />
                  ) : (
                    <a
                      href={fileObj.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <FileText size={32} />
                      <span className="underline">{fileObj.filename}</span>
                    </a>
                  )}
                 
                  <button
                    onClick={() => removeFile(idx)}
                    className="text-red-500 hover:text-red-700 p-1"
                    disabled={isLoading}
                  >
                    <X size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Upload status */}
        {uploadStatus && (
          <div className="mt-2 text-sm text-center text-blue-600 bg-blue-50 p-2 rounded">
            {uploadStatus}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 pt-3 pb-6">
        <div className="bg-blue-50 rounded-lg flex items-center justify-between px-4 py-3 mb-4">
          <span className="text-blue-700 text-sm font-medium">Thêm vào bài viết của bạn</span>
          
          <div className="flex items-center gap-2">
            {postIcons.map((iconItem) => (
              <div key={iconItem.id} className="relative">
                <button
                  className="p-2 rounded-full hover:bg-blue-100 disabled:opacity-50 transition-colors"
                  onClick={iconItem.onClick}
                  title={iconItem.title}
                  type="button"
                  disabled={isLoading}
                >
                  {iconItem.icon}
                </button>
                {iconItem.component}
                
                {/* Emoji Picker Dropdown */}
                {iconItem.id === 'emoji' && showEmojiPicker && (
                  <div 
                    ref={emojiPickerRef}
                    className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 w-64"
                  >
                    <div className="text-sm text-gray-600 mb-2 font-medium">Chọn emoji:</div>
                    <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
                      {emojiList.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => handleEmojiSelect(emoji)}
                          className="p-2 text-lg hover:bg-blue-50 rounded transition-colors"
                          type="button"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
            isPostEnabled
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-blue-200 cursor-not-allowed"
          }`}
          disabled={!isPostEnabled}
          onClick={handleUpdate}
        >
          {isLoading ? "Đang cập nhật..." : "Cập nhật"}
        </button>
      </div>
    </div>
  );
};

export default PostUpdate;