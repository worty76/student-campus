import React, { useRef, useState } from "react";
import { X, Image as ImageIcon, Users, Smile, MapPin, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
const user = {
  name: "Lê Khánh",
  avatar: "/schoolimg.jpg",
  privacy: "Bạn bè ngoại trừ...",
};

interface PostAddProps {
  name: string;
  onClose: () => void;
}

const PostAdd: React.FC<PostAddProps> = ({ name, onClose }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handlePost = () => {
    // handle post logic here
    setContent("");
    setImage(null);
    setFile(null);
    onClose();
  };

  return (
    <div className="bg-white top-[10vh] rounded-xl w-full max-w-md mx-auto p-0 relative shadow">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2 border-b border-blue-100">
        <span className="text-lg font-semibold text-blue-900">Tạo bài viết</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-blue-400 hover:text-blue-600"
        >
          <X size={24} />
        </Button>
      </div>
      {/* User info */}
      <div className="flex items-center gap-3 px-5 pt-4">
        <Image src={user.avatar} alt="avatar" width={80} height={80} className="w-10 h-10 rounded-full object-cover" />
        <div>
          <div className="text-blue-900 font-semibold">{name}</div>
          <div className="bg-blue-100 text-xs text-blue-700 px-2 py-1 rounded flex items-center gap-1 w-fit mt-1">
            <Users size={14} /> {user.privacy}
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="px-5 pt-2">
        <Textarea
          className="w-full bg-transparent text-lg text-blue-900 outline-none resize-none placeholder-blue-400"
          rows={4}
          placeholder="Lê ơi, bạn đang nghĩ gì thế?"
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        {/* Preview image/file */}
        {image && (
          <div className="mt-2">
              <Image
              src={URL.createObjectURL(image)}
              alt="preview"
              width={320}
              height={160}
              className="max-h-40 rounded-lg object-cover"
            />
          </div>
        )}
        {file && (
          <div className="mt-2 flex items-center gap-2 text-blue-800">
            <FileText size={20} />
            <span>{file.name}</span>
          </div>
        )}
      </div>
      {/* Actions */}
      <div className="px-5 pt-2 pb-4">
        <div className="bg-blue-50 rounded-lg flex items-center px-2 py-2 gap-2 mb-3">
          <span className="text-blue-700 text-sm px-2">Thêm vào bài viết của bạn</span>
          <Button
            variant="ghost"
            size="icon"
            className="p-2 rounded hover:bg-blue-100"
            onClick={() => imageInputRef.current?.click()}
            title="Hình ảnh"
            type="button"
          >
            <ImageIcon className="text-green-500" size={22} />
            <Input
              type="file"
              accept="image/*"
              className="hidden"
              ref={imageInputRef}
              onChange={handleImageChange}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="p-2 rounded hover:bg-blue-100"
            onClick={() => fileInputRef.current?.click()}
            title="Tài liệu"
            type="button"
          >
            <FileText className="text-blue-500" size={22} />
            <Input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="p-2 rounded hover:bg-blue-100"
            title="Gắn thẻ bạn bè"
            type="button"
          >
            <Users className="text-blue-500" size={22} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="p-2 rounded hover:bg-blue-100"
            title="Cảm xúc/hoạt động"
            type="button"
          >
            <Smile className="text-yellow-400" size={22} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="p-2 rounded hover:bg-blue-100"
            title="Check in"
            type="button"
          >
            <MapPin className="text-red-400" size={22} />
          </Button>
        </div>
        <Button
          className={`w-full py-2 rounded-lg font-semibold text-white ${
            content.trim() || image || file
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-blue-200 cursor-not-allowed"
          }`}
          disabled={!(content.trim() || image || file)}
          onClick={handlePost}
        >
          Đăng
        </Button>
      </div>
    </div>
  );
};

export default PostAdd;