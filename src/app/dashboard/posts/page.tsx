"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { usePagination } from "@/hooks/usePagination";
import { BASEURL } from "@/app/constants/url";
import {
  FileText,
  Search,
  Trash2,
  Eye,
  AlertTriangle,
  Calendar,
  User,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Post {
  _id: string;
  userId: {
    _id: string;
    username: string;
    email: string;
    Faculty: string;
    Major: string;
    Year: string;
  } | null;
  text: string;
  attachments: Array<{
    file?: {
      url?: string;
      filename?: string;
      mimetype?: string;
      filetype?: string;
    };
  }>;
  createdAt: string;
  likes: string[];
  comments: string[];
}

export default function PostManagement() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Pagination for filtered posts
  const {
    currentPage,
    totalPages,
    currentData: paginatedPosts,
    totalItems,
    itemsPerPage,
    setCurrentPage,
  } = usePagination({
    data: filteredPosts,
    itemsPerPage: 8, // Show 8 posts per page (4 rows of 2 columns)
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${BASEURL}/api/premium/admin/posts`);
      const data = await response.json();

      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPosts = useCallback(() => {
    let filtered = posts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (post) =>
          post.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (post.userId &&
            post.userId.username &&
            post.userId.username
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (post.userId &&
            post.userId.Faculty &&
            post.userId.Faculty.toLowerCase().includes(
              searchTerm.toLowerCase()
            ))
      );
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter((post) => {
        if (filterType === "with_attachments") {
          return post.attachments && post.attachments.length > 0;
        } else if (filterType === "text_only") {
          return (
            (!post.attachments || post.attachments.length === 0) &&
            post.text.trim() !== ""
          );
        }
        return true;
      });
    }

    setFilteredPosts(filtered);
  }, [posts, searchTerm, filterType]);

  useEffect(() => {
    filterPosts();
  }, [filterPosts]);

  const deletePost = async (postId: string) => {
    if (
      !confirm(
        "Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${BASEURL}/api/premium/admin/posts/${postId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        fetchPosts(); // Refresh the list
        alert("Xóa bài viết thành công");
      } else {
        alert("Không thể xóa bài viết: " + data.message);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Không thể xóa bài viết");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getFileTypeIcon = (filetype: string) => {
    switch (filetype) {
      case "image":
        return "🖼️";
      case "video":
        return "🎥";
      case "pdf":
        return "📄";
      case "pptx":
        return "📊";
      case "txt":
        return "📝";
      case "document":
        return "📋";
      case "unknown":
      case undefined:
      case null:
        return "📎";
      default:
        return "📎";
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay Lại</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Quản Lý Bài Viết
                </h1>
                <p className="text-gray-600">
                  Kiểm duyệt và quản lý nội dung người dùng tạo
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <FileText className="w-4 h-4 mr-2" />
                {totalItems} Bài Viết
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất Cả Bài Viết</option>
                <option value="with_attachments">Có Tệp Đính Kèm</option>
                <option value="text_only">Chỉ Văn Bản</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {paginatedPosts.map((post) => (
            <Card key={post._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {post.userId?.username || "Người Dùng Không Xác Định"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {post.userId?.Faculty || "Khoa Không Xác Định"} -{" "}
                        {post.userId?.Major || "Ngành Không Xác Định"} (
                        {post.userId?.Year || "Năm Không Xác Định"})
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`/post/${post._id}`, "_blank")}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deletePost(post._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Post Content */}
                {post.text && (
                  <div className="mb-4">
                    <p className="text-gray-700">
                      {truncateText(post.text, 150)}
                    </p>
                  </div>
                )}

                {/* Attachments */}
                {post.attachments && post.attachments.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">
                      Tệp Đính Kèm:
                    </h4>
                    <div className="space-y-2">
                      {post.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 p-2 bg-gray-50 rounded"
                        >
                          <span className="text-lg">
                            {getFileTypeIcon(
                              attachment?.file?.filetype || "unknown"
                            )}
                          </span>
                          <span className="text-sm text-gray-600">
                            {attachment?.file?.filename || "Tệp không xác định"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Post Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>❤️ {post.likes?.length || 0}</span>
                    <span>💬 {post.comments?.length || 0}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                </div>

                {/* Warning for potentially inappropriate content */}
                {(post.text.includes("inappropriate") ||
                  post.text.includes("spam")) && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-yellow-800">
                        Có khả năng nội dung không phù hợp
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          showInfo={true}
        />

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không tìm thấy bài viết
              </h3>
              <p className="text-gray-500">
                {searchTerm || filterType !== "all"
                  ? "Hãy thử điều chỉnh tiêu chí tìm kiếm hoặc bộ lọc của bạn."
                  : "Hiện tại không có bài viết nào để hiển thị."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
