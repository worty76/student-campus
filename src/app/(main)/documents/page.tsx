'use client';
import React, { useState, useMemo, useEffect } from "react";
import { Search, UploadCloud, Download, Filter, FileText, TrendingUp, Book, User, GraduationCap, Calendar, Star, Trash2 } from "lucide-react";
import NavigationBar from "@/app/(main)/layouts/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import axios from "axios";
import { BASEURL } from "@/app/constants/url";
import downloadFileFromObject from "@/app/api/file_handler";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from "@/components/ui/pagination";


interface FileMeta3 {
  url: string;
  name: string;
  type: string;
  size: number;
}
function getFileIcon(type: string) {
    switch (type) {
        case "pdf": return "📄";
        case "docx": return "📝";
        case "pptx": return "📊";
        default: return "📎";
    }
}

interface DocumentFile {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Document {
  _id: string;
  title: string;
  subject: string;
  lecturer: string;
  faculty: string;
  academicYear: string;
  downloads: number;
  file: DocumentFile;
  uploadedBy?: {
    username?: string;
    _id?: string;
  };
}

export default function DocumentsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [subject, setSubject] = useState("");
    const [lecturer, setLecturer] = useState("");
    const [faculty, setFaculty] = useState("");
    const [year, setYear] = useState("");
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [activeTab, setActiveTab] = useState<"all" | "hot">("all");
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        title: "",
        subject: "",
        lecturer: "",
        faculty: "",
        academicYear: "",
        file: null as File | null,
    });
    const [documents, setDocuments] = useState<Document[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const docsPerPage = 6;
    const [loading, setLoading] = useState(false); // Thêm state loading
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [deleting, setDeleting] = useState(false); // Thêm state này

    const filteredDocs = useMemo(() => {
        return documents.filter((doc) =>
            (searchTerm === "" ||
                doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || // SỬA doc.name -> doc.title
                doc.subject.toLowerCase().includes(searchTerm.toLowerCase())
            ) &&
            (!subject || subject === "all" || doc.subject === subject) &&
            (!lecturer || lecturer === "all" || doc.lecturer === lecturer) &&
            (!faculty || faculty === "all" || doc.faculty === faculty) &&
            (!year || doc.academicYear === year)
        );
    }, [searchTerm, subject, lecturer, faculty, year, documents]);

    // Hot documents: chỉ lấy những tài liệu có downloads > 100
    const hotDocs = useMemo(
        () => documents.filter(doc => doc.downloads > 100).sort((a, b) => b.downloads - a.downloads),
        [documents]
    );
    const updateDownload = async (documentId:string) =>{
        try {

            await axios.put(`${BASEURL}/api/update/document/${documentId}`, {}, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            });
        } catch (error) {
            console.error("Error updating download count:", error);
        }
    }

    const handleDelete = async (docId: string) => {
        setDeleting(true); // Bắt đầu xoá
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found");    
                setDeleting(false);
                return;
            }
            const userId = localStorage.getItem("userId");
            const response = await axios.delete(`${BASEURL}/api/delete/doc/${docId}`, {
                data: { userId },
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            if (response.status === 200) {
                setDocuments(documents.filter(doc => doc._id !== docId));
                setDeleteSuccess(true); // Hiện dialog thành công
            } else {
                alert("Không thể xóa tài liệu này.");
            }
        } catch (error) {
            console.error("Error deleting document:", error);
        } finally {
            setDeleting(false); // Kết thúc xoá
        }
    }

    // Tính toán phân trang
    const paginatedDocs = useMemo(() => {
        const start = (currentPage - 1) * docsPerPage;
        return filteredDocs.slice(start, start + docsPerPage);
    }, [filteredDocs, currentPage]);

    const totalPages = Math.ceil(filteredDocs.length / docsPerPage);

    const clearFilters = () => {
        setSubject("");
        setLecturer("");
        setFaculty("");
        setYear("");
        setSearchTerm("");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, file: e.target.files?.[0] || null });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.file) return;
        setLoading(true); // Bắt đầu loading
        try {
            const userId = localStorage.getItem("userId");
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append("userId", userId || "");
            formData.append("title", form.title);
            formData.append("subject", form.subject);
            formData.append("lecturer", form.lecturer);
            formData.append("faculty", form.faculty);
            formData.append("academicYear", form.academicYear);
            formData.append("file", form.file);

            const response = await axios.post(`${BASEURL}/api/upload/document`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`,
                },  
            });

            setUploadedFiles([...uploadedFiles, response.data]);
            setOpen(false);
            setForm({
                title: "",
                subject: "",
                lecturer: "",
                faculty: "",
                academicYear: "",
                file: null,
            });
            await FetchDocument(); // Thêm dòng này để reload lại danh sách tài liệu
        } catch (error) {
            console.error("Error uploading file:", error);
        } finally {
            setLoading(false); // Kết thúc loading
        }
    };

    const FetchDocument = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {   
                console.error("No token found");
                return;
            }
            const response = await axios.get(`${BASEURL}/api/get/documents`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            setDocuments(response.data); // <-- Lưu danh sách document từ API
        } catch (error) {
            console.error("Error fetching document:", error);
            return null;
        }

    }
    useEffect(() => {
        FetchDocument();
    }, []);
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/login";
        }
      }, []);

    // Lấy danh sách duy nhất từ documents
    const subjects = useMemo(
      () => Array.from(new Set(documents.map(doc => doc.subject))).filter(Boolean),
      [documents]
    );
    const lecturers = useMemo(
      () => Array.from(new Set(documents.map(doc => doc.lecturer))).filter(Boolean),
      [documents]
    );
    const faculties = useMemo(
      () => Array.from(new Set(documents.map(doc => doc.faculty))).filter(Boolean),
      [documents]
    );
    const currentYear = new Date().getFullYear();

const years = useMemo(
  () =>
    Array.from(new Set(documents.map(doc => doc.academicYear)))
      .filter(Boolean)
      .filter(y => {
        const n = Number(y);
        return !isNaN(n) && n <= currentYear;
      }),
  [documents, currentYear]
);

    return (
        <div>
            <div className="max-w-6xl mx-auto px-4 py-8 pt-[7vh] ">
                <NavigationBar />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sidebar Filters */}
                    <div className="md:col-span-1">
                        <div className="bg-[#F8FAFC] rounded-2xl shadow-xl p-6 sticky top-8 w-full">
                            {/* Upload Button */}
                            <div className="mb-6">
                                <Button
                                    onClick={() => setOpen(true)}
                                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg flex items-center justify-center space-x-2"
                                >
                                    <UploadCloud size={20} />
                                    <span>Tải Lên Tài Liệu</span>
                                </Button>
                            </div>
                            
                            {/* Filter Header */}
                            <div className="flex items-center justify-between mb-6 bg-[#E0F2FE] px-4 py-2 rounded-xl">
                                <h2 className="text-xl font-bold text-[#1D4ED8] flex items-center">
                                    <Filter className="mr-2 text-[#1D4ED8]" size={24} />
                                    Bộ Lọc
                                </h2>
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-[#1D4ED8] hover:text-[#7C3AED] font-medium"
                                >
                                    Xóa bộ lọc
                                </button>
                            </div>
                            <div className="space-y-6 min-w-0">
                                {/* Search */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#1D4ED8] mb-2 whitespace-nowrap">
                                        Tìm kiếm
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7C3AED]" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Tìm tài liệu..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border-2 border-[#E2E8F0] rounded-xl focus:border-[#1D4ED8] focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                                {/* Subject Filter */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#1D4ED8] mb-2 flex items-center whitespace-nowrap">
                                        <Book className="mr-2 text-[#1D4ED8]" size={16} />
                                        Môn học
                                    </label>
                                    <Select value={subject || "all"} onValueChange={val => setSubject(val === "all" ? "" : val)}>
                                        <SelectTrigger className="w-full border-gray-200 bg-gray-50 hover:bg-white rounded-xl px-4 py-3 min-h-[48px]">
                                            <SelectValue placeholder="Tất cả môn học" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl shadow-lg border border-gray-200 bg-white py-2 max-h-48 overflow-y-auto">
                                            <SelectItem value="all" className="px-4 py-2 cursor-pointer hover:bg-blue-50 rounded-lg transition-colors">
                                                Tất cả môn học
                                            </SelectItem>
                                            {subjects.map(s => (
                                                <SelectItem key={s} value={s} className="px-4 py-2 cursor-pointer hover:bg-blue-50 rounded-lg transition-colors">
                                                  {s}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* Lecturer Filter */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#1D4ED8] mb-2 flex items-center whitespace-nowrap">
                                        <User className="mr-2 text-purple-500" size={16} />
                                        Giảng viên
                                    </label>
                                    <Select value={lecturer || "all"} onValueChange={val => setLecturer(val === "all" ? "" : val)}>
                                        <SelectTrigger className="w-full border-gray-200 bg-gray-50 hover:bg-white rounded-xl px-4 py-3 min-h-[48px]">
                                            <SelectValue placeholder="Tất cả giảng viên" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl shadow-lg border border-gray-200 bg-white py-2 max-h-48 overflow-y-auto">
                                            <SelectItem value="all" className="px-4 py-2 cursor-pointer hover:bg-blue-50 rounded-lg transition-colors">
                                                Tất cả giảng viên
                                            </SelectItem>
                                            {lecturers.map(l => (
                                                <SelectItem key={l} value={l} className="px-4 py-2 cursor-pointer hover:bg-blue-50 rounded-lg transition-colors">
                                                  {l}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* Faculty Filter */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#1D4ED8] mb-2 flex items-center whitespace-nowrap">
                                        <GraduationCap className="mr-2 text-green-500" size={16} />
                                        Khoa/Năm học
                                    </label>
                                    <Select value={faculty || "all"} onValueChange={val => setFaculty(val === "all" ? "" : val)}>
                                        <SelectTrigger className="w-full border-gray-200 bg-gray-50 hover:bg-white rounded-xl px-4 py-3 min-h-[48px]">
                                            <SelectValue placeholder="Tất cả khoa/năm" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl shadow-lg border border-gray-200 bg-white py-2 max-h-48 overflow-y-auto">
                                            <SelectItem value="all" className="px-4 py-2 cursor-pointer hover:bg-blue-50 rounded-lg transition-colors">
                                                Tất cả khoa/năm
                                            </SelectItem>
                                            {faculties.map(f => (
                                                <SelectItem key={f} value={f} className="px-4 py-2 cursor-pointer hover:bg-blue-50 rounded-lg transition-colors">
                                                  {f}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* Year Filter */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#1D4ED8] mb-2 flex items-center whitespace-nowrap">
                                        <Calendar className="mr-2 text-orange-500" size={16} />
                                        Năm học
                                    </label>
                                    <Select value={year || "all"} onValueChange={val => setYear(val === "all" ? "" : val)}>
                                        <SelectTrigger className="w-full border-gray-200 bg-gray-50 hover:bg-white rounded-xl px-4 py-3 min-h-[48px]">
                                            <SelectValue placeholder="Tất cả năm học" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl shadow-lg border border-gray-200 bg-white py-2 max-h-48 overflow-y-auto">
                                            <SelectItem value="all" className="px-4 py-2 cursor-pointer hover:bg-blue-50 rounded-lg transition-colors">
                                                Tất cả năm học
                                            </SelectItem>
                                            {years.map(y => (
                                                <SelectItem key={y} value={y} className="px-4 py-2 cursor-pointer hover:bg-blue-50 rounded-lg transition-colors">
                                                  {y}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Main Content */}
                    <div className="md:col-span-3">
                        {/* Upload Button on top right */}
                      
                        
                        {/* Tabs */}
                        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-xl">
                            <button
                                onClick={() => setActiveTab("all")}
                                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                                    activeTab === "all"
                                        ? "bg-white text-blue-600 shadow-md"
                                        : "text-gray-600 hover:text-gray-800"
                                }`}
                            >
                                <FileText className="inline mr-2" size={18} />
                                Tất Cả Tài Liệu ({filteredDocs.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("hot")}
                                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                                    activeTab === "hot"
                                        ? "bg-white text-red-600 shadow-md"
                                        : "text-gray-600 hover:text-gray-800"
                                }`}
                            >
                                <TrendingUp className="inline mr-2" size={18} />
                                Tài Liệu Hot ({hotDocs.length})
                            </button>
                        </div>
                        
                        {/* Documents Grid */}
                        {activeTab === "all" && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {paginatedDocs.length === 0 && (
                                        <div className="text-gray-500 col-span-2">Không có tài liệu phù hợp.</div>
                                    )}
                                    {paginatedDocs.map((doc) => (
                                        <div key={doc._id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                                            <div className="p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="text-3xl">
                                                            {/* Hiển thị icon theo loại file */}
                                                            {doc.file.type.includes("pdf") && "📄"}
                                                            {doc.file.type.includes("doc") && "📝"}
                                                            {doc.file.type.includes("ppt") && "📊"}
                                                            {!["pdf", "doc", "ppt"].some(t => doc.file.type.includes(t)) && "📎"}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-gray-800 text-lg leading-tight">{doc.title}</h3>
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                {(doc.file.size / 1024 / 1024).toFixed(2)} MB
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                                                        {doc.file.type.split("/").pop()?.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="space-y-2 mb-4">
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Book size={14} className="mr-2 text-blue-500" />
                                                        <span className="font-medium">{doc.subject}</span>
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <User size={14} className="mr-2 text-purple-500" />
                                                        <span>Giảng viên :{doc.lecturer}</span>
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <GraduationCap size={14} className="mr-2 text-green-500" />
                                                        <span>Khoa :{doc.faculty}</span>
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Calendar size={14} className="mr-2 text-orange-500" />
                                                        <span>Năm học :{doc.academicYear}</span>
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <span className="mr-2">Uploader:</span>
                                                        <span>{doc.uploadedBy?.username || "Unknown"}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <span className="flex items-center">
                                                            <Download size={14} className="mr-1" />
                                                            {doc.downloads}
                                                        </span>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        {/* Download button */}
                                                        <button
                                                            type="button"
                                                            className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Tải về"
                                                            onClick={async () => {
                                                                await updateDownload(doc._id);
                                                                const file: FileMeta3 = {
                                                                    name: doc.file.name,
                                                                    url: doc.file.url,
                                                                    type: doc.file.type,
                                                                    size: doc.file.size
                                                                };
                                                                await downloadFileFromObject({ file });
                                                                FetchDocument();
                                                            }}
                                                        >
                                                            <Download size={18} />
                                                        </button>
                                                        {/* Delete button */}
                                                        <button
                                                            type="button"
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Xoá tài liệu"
                                                            onClick={() => handleDelete(doc._id)}
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center mt-8">
                                        <Pagination>
                                            <PaginationContent>
                                                <PaginationItem>
                                                    <PaginationPrevious
                                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                                        aria-disabled={currentPage === 1}
                                                    />
                                                </PaginationItem>
                                                {Array.from({ length: totalPages }, (_, i) => (
                                                    <PaginationItem key={i + 1}>
                                                        <PaginationLink
                                                            isActive={currentPage === i + 1}
                                                            onClick={() => setCurrentPage(i + 1)}
                                                        >
                                                            {i + 1}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                ))}
                                                <PaginationItem>
                                                    <PaginationNext
                                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                                        aria-disabled={currentPage === totalPages}
                                                    />
                                                </PaginationItem>
                                            </PaginationContent>
                                        </Pagination>
                                    </div>
                                )}
                            </>
                        )}
                        
                        {/* Hot Documents */}
                        {activeTab === "hot" && (
                            <div className="space-y-4">
                                {hotDocs.length === 0 && (
                                    <div className="text-gray-500">No hot documents.</div>
                                )}
                                {hotDocs.map((doc, idx) => (
                                    <div key={doc._id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-bold text-lg">
                                                    #{idx + 1}
                                                </div>
                                                <div className="text-2xl">{getFileIcon(doc.file?.type)}</div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800 text-lg">{doc.title}</h3>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                                        <span>📚 {doc.subject}</span>
                                                        <span>👨‍🏫 {doc.lecturer}</span>
                                                        <span>🏛️ {doc.faculty}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-6">
                                                <div className="text-right">
                                                    <div className="flex items-center text-red-500 font-bold text-lg">
                                                        <TrendingUp size={20} className="mr-1" />
                                                        {doc.downloads}
                                                    </div>
                                                    <span className="text-sm text-gray-500">downloads</span>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        type="button"
                                                        className="p-3 text-green-500 hover:bg-green-50 rounded-xl transition-colors"
                                                        title="Download"
                                                        onClick={async () => {
                                                            await updateDownload(doc._id);
                                                            const file: FileMeta3 = {
                                                                name: doc.file.name,
                                                                url: doc.file.url,
                                                                type: doc.file.type,
                                                                size: doc.file.size
                                                            };
                                                            await downloadFileFromObject({ file });
                                                            FetchDocument();
                                                        }}
                                                    >
                                                        <Download size={20} />
                                                    </button>
                                                    {/* Delete button */}
                                                    <button
                                                        type="button"
                                                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                        title="Xoá tài liệu"
                                                        onClick={() => handleDelete(doc._id)}
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Upload Status */}
                        {uploadedFiles.length > 0 && (
                            <Dialog open={uploadedFiles.length > 0} onOpenChange={() => setUploadedFiles([])}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center">
                                            <UploadCloud className="mr-2 text-green-500" />
                                            Tải lên thành công!
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-3 mt-4">
                                        {uploadedFiles.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                                                <div className="flex items-center space-x-3">
                                                    <div className="text-2xl">{getFileIcon(file.type)}</div>
                                                    <div>
                                                        <p className="font-semibold text-black-800">{file.name}</p>
                                                        <p className="text-sm text-gray-600">{file.size}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center text-green-600 font-semibold">
                                                    <Star size={16} className="mr-1" />
                                                    Thành công
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={() => setUploadedFiles([])} className="w-full">
                                            Đóng
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Modal Upload */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Document</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            name="title"
                            placeholder="Title"
                            value={form.title}
                            onChange={handleChange}
                            required
                        />
                        {/* Subject Select */}
                        <Select value={form.subject} onValueChange={val => setForm({ ...form, subject: val })} required>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Subject" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Advanced Mathematics">Advanced Mathematics</SelectItem>
                                <SelectItem value="Web Programming">Web Programming</SelectItem>
                                <SelectItem value="Microeconomics">Microeconomics</SelectItem>
                                <SelectItem value="2D Graphic Design">2D Graphic Design</SelectItem>
                                <SelectItem value="English for Specific Purposes">English for Specific Purposes</SelectItem>
                                <SelectItem value="Basic Artificial Intelligence">Basic Artificial Intelligence</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            name="lecturer"
                            placeholder="Lecturer"
                            value={form.lecturer}
                            onChange={handleChange}
                            required
                        />
                        {/* Faculty Select */}
                        <Select value={form.faculty} onValueChange={val => setForm({ ...form, faculty: val })} required>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Faculty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                                <SelectItem value="Artificial Intelligence">Artificial Intelligence</SelectItem>
                                <SelectItem value="Business Administration">Business Administration</SelectItem>
                                <SelectItem value="Graphic Design">Graphic Design</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            name="academicYear"
                            placeholder="Year"
                            value={form.academicYear}
                            onChange={handleChange}
                            required
                            type="number"
                            min="1900"
                            max={new Date().getFullYear()}
                        />
                        <Input
                            type="file"
                            accept=".pdf,.docx,.pptx"
                            onChange={handleFile}
                            required
                        />
                        <DialogFooter>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Đang tải..." : "Upload"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            {/* Dialog đang xoá */}
            <Dialog open={deleting}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center text-blue-600">
                            <Trash2 className="mr-2" /> Đang xoá tài liệu...
                        </DialogTitle>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
            {/* Dialog thông báo xoá thành công */}
            <Dialog open={deleteSuccess} onOpenChange={setDeleteSuccess}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center text-green-600">
                            <Trash2 className="mr-2" /> Đã xoá tài liệu thành công!
                        </DialogTitle>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setDeleteSuccess(false)} className="w-full">
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}