import React, { useRef, useState, useEffect } from "react";
import { X, ImageIcon, Users, Smile, MapPin, FileText } from "lucide-react";
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

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log(content, files);
    setPostContent(content || "");
    setPostFiles(files || []);
  }, [content, files]);

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
    <div className="bg-white top-[10vh] rounded-xl w-full max-w-md mx-auto p-0 relative shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2 border-b border-blue-100">
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
      <div className="flex items-center gap-3 px-5 pt-4">
        <Image
          src={userData?.avatar_link || "/api/placeholder/80/80"}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover bg-blue-100"
          width={80}
          height={80}
        />
        <div>
          <div className="text-blue-900 font-semibold">Lê Khánh</div>
          <div className="bg-blue-100 text-xs text-blue-700 px-2 py-1 rounded flex items-center gap-1 w-fit mt-1">
            <Users size={14} /> Bạn bè ngoại trừ...
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-2">
        <textarea
          className="w-full bg-transparent text-lg text-blue-900 outline-none resize-none placeholder-blue-400 border-none"
          rows={4}
          placeholder="Lê ơi, bạn đang nghĩ gì thế?"
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
                      className="w-12 h-12 object-cover rounded"
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
      <div className="px-5 pt-2 pb-4">
        <div className="bg-blue-50 rounded-lg flex items-center px-2 py-2 gap-2 mb-3">
          <span className="text-blue-700 text-sm px-2">Thêm vào bài viết của bạn</span>

          <button
            className="p-2 rounded hover:bg-blue-100 disabled:opacity-50"
            onClick={() => imageInputRef.current?.click()}
            title="Hình ảnh"
            type="button"
            disabled={isLoading}
          >
            <ImageIcon className="text-green-500" size={22} />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={imageInputRef}
              onChange={handleImageChange}
              multiple
            />
          </button>

          <button
            className="p-2 rounded hover:bg-blue-100 disabled:opacity-50"
            onClick={() => fileInputRef.current?.click()}
            title="Tài liệu"
            type="button"
            disabled={isLoading}
          >
            <FileText className="text-blue-500" size={22} />
            <input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
            />
          </button>

          <button
            className="p-2 rounded hover:bg-blue-100 disabled:opacity-50"
            title="Gắn thẻ bạn bè"
            type="button"
            disabled={isLoading}
          >
            <Users className="text-blue-500" size={22} />
          </button>

          <button
            className="p-2 rounded hover:bg-blue-100 disabled:opacity-50"
            title="Cảm xúc/hoạt động"
            type="button"
            disabled={isLoading}
          >
            <Smile className="text-yellow-400" size={22} />
          </button>

          <button
            className="p-2 rounded hover:bg-blue-100 disabled:opacity-50"
            title="Check in"
            type="button"
            disabled={isLoading}
          >
            <MapPin className="text-red-400" size={22} />
          </button>
        </div>

        <button
          className={`w-full py-2 rounded-lg font-semibold text-white transition-colors ${
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