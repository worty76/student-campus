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
        <div className="min-h-screen bg-[#F1F1E6]">
            <div className="max-w-7xl mx-auto px-4 py-8 pt-[7vh]">
                <NavigationBar />
                
                {/* Header Section */}
                <div className="mb-8">
                    <div className="text-center mb-6">
                     
                       
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-[#F5F9FF] rounded-xl p-4 shadow-lg border border-slate-300">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-[#F5F9FF] rounded-lg">
                                    <FileText className="w-6 h-6 text-[#0694FA]" />
                                </div>
                                <div>
                                    <p className="text-sm text-[#1E293B]">Tổng tài liệu</p>
                                    <p className="text-2xl font-bold text-[#1E293B]">{documents.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#F5F9FF] rounded-xl p-4 shadow-lg border border-slate-300">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-[#F5F9FF] rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-[#1E293B]" />
                                </div>
                                <div>
                                    <p className="text-sm text-[#1E293B]">Tài liệu hot</p>
                                    <p className="text-2xl font-bold text-[#1E293B]">{hotDocs.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#F5F9FF] rounded-xl p-4 shadow-lg border border-slate-300">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-[#F5F9FF] rounded-lg">
                                    <Book className="w-6 h-6 text-[#0694FA]" />
                                </div>
                                <div>
                                    <p className="text-sm text-[#1E293B]">Môn học</p>
                                    <p className="text-2xl font-bold text-[#1E293B]">{subjects.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#F5F9FF] rounded-xl p-4 shadow-lg border border-slate-300">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-[#F5F9FF] rounded-lg">
                                    <Download className="w-6 h-6 text-[#1E293B]" />
                                </div>
                                <div>
                                    <p className="text-sm text-[#1E293B]">Lượt tải</p>
                                    <p className="text-2xl font-bold text-[#1E293B]">
                                        {documents.reduce((sum, doc) => sum + doc.downloads, 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Filters */}
                    <div className="lg:col-span-1 order-2 lg:order-1">
                        <div className="bg-[#F5F9FF] backdrop-blur-lg rounded-2xl shadow-xl p-6 sticky top-8 w-full border border-slate-300">
                            {/* Upload Button */}
                            <div className="mb-6">
                                <Button
                                    onClick={() => setOpen(true)}
                                    className="w-full bg-[#0694FA] hover:bg-[#1E293B] text-white px-6 py-4 rounded-xl font-semibold shadow-lg flex items-center justify-center space-x-2 transform hover:scale-105 transition-all duration-200"
                                >
                                    <UploadCloud size={22} />
                                    <span>Tải Lên Tài Liệu</span>
                                </Button>
                            </div>
                            
                            {/* Filter Header */}
                            <div className="flex items-center justify-between mb-6 bg-[#F1F1E6] px-5 py-3 rounded-xl border border-slate-300">
                                <h2 className="text-xl font-bold text-[#1E293B] flex items-center">
                                    <Filter className="mr-2 text-[#0694FA]" size={24} />
                                    Bộ Lọc
                                </h2>
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-[#0694FA] hover:text-[#1E293B] font-medium bg-white px-3 py-1 rounded-lg hover:bg-[#F5F9FF] transition-all duration-200"
                                >
                                    Xóa bộ lọc
                                </button>
                            </div>
                            <div className="space-y-6 min-w-0">
                                {/* Search */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#1E293B] mb-3 whitespace-nowrap">
                                        🔍 Tìm kiếm
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1E293B]" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Tìm tài liệu theo tên hoặc môn học..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-slate-400 focus:outline-none transition-all duration-200 bg-[#F1F1E6] focus:bg-white"
                                        />
                                    </div>
                                </div>
                                {/* Subject Filter */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#1E293B] mb-3 flex items-center whitespace-nowrap">
                                        <Book className="mr-2 text-[#0694FA]" size={16} />
                                        Môn học
                                    </label>
                                    <Select value={subject || "all"} onValueChange={val => setSubject(val === "all" ? "" : val)}>
                                        <SelectTrigger className="w-full border-2 border-slate-200 bg-[#F1F1E6] hover:bg-white hover:border-slate-400 focus:border-slate-400 rounded-xl px-4 py-3 min-h-[48px] transition-all duration-200">
                                            <SelectValue placeholder="Tất cả môn học" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl shadow-lg border border-slate-200 bg-white py-2 max-h-48 overflow-y-auto">
                                            <SelectItem value="all" className="px-4 py-3 cursor-pointer hover:bg-[#F5F9FF] rounded-lg transition-colors">
                                                <span className="flex items-center">
                                                    <span className="mr-2">📚</span>
                                                    Tất cả môn học
                                                </span>
                                            </SelectItem>
                                            {subjects.map(s => (
                                                <SelectItem key={s} value={s} className="px-4 py-3 cursor-pointer hover:bg-[#F5F9FF] rounded-lg transition-colors">
                                                    <span className="flex items-center">
                                                        <span className="mr-2">📖</span>
                                                        {s}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* Lecturer Filter */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#1E293B] mb-3 flex items-center whitespace-nowrap">
                                        <User className="mr-2 text-[#0694FA]" size={16} />
                                        Giảng viên
                                    </label>
                                    <Select value={lecturer || "all"} onValueChange={val => setLecturer(val === "all" ? "" : val)}>
                                        <SelectTrigger className="w-full border-2 border-slate-200 bg-[#F1F1E6] hover:bg-white hover:border-slate-400 focus:border-slate-400 rounded-xl px-4 py-3 min-h-[48px] transition-all duration-200">
                                            <SelectValue placeholder="Tất cả giảng viên" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl shadow-lg border border-slate-200 bg-white py-2 max-h-48 overflow-y-auto">
                                            <SelectItem value="all" className="px-4 py-3 cursor-pointer hover:bg-[#F5F9FF] rounded-lg transition-colors">
                                                <span className="flex items-center">
                                                    <span className="mr-2">👨‍🏫</span>
                                                    Tất cả giảng viên
                                                </span>
                                            </SelectItem>
                                            {lecturers.map(l => (
                                                <SelectItem key={l} value={l} className="px-4 py-3 cursor-pointer hover:bg-[#F5F9FF] rounded-lg transition-colors">
                                                    <span className="flex items-center">
                                                        <span className="mr-2">👨‍🏫</span>
                                                        {l}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* Faculty Filter */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#1E293B] mb-3 flex items-center whitespace-nowrap">
                                        <GraduationCap className="mr-2 text-[#0694FA]" size={16} />
                                        Khoa/Năm học
                                    </label>
                                    <Select value={faculty || "all"} onValueChange={val => setFaculty(val === "all" ? "" : val)}>
                                        <SelectTrigger className="w-full border-2 border-slate-200 bg-[#F1F1E6] hover:bg-white hover:border-slate-400 focus:border-slate-400 rounded-xl px-4 py-3 min-h-[48px] transition-all duration-200">
                                            <SelectValue placeholder="Tất cả khoa/năm" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl shadow-lg border border-slate-200 bg-white py-2 max-h-48 overflow-y-auto">
                                            <SelectItem value="all" className="px-4 py-3 cursor-pointer hover:bg-[#F5F9FF] rounded-lg transition-colors">
                                                <span className="flex items-center">
                                                    <span className="mr-2">🏛️</span>
                                                    Tất cả khoa/năm
                                                </span>
                                            </SelectItem>
                                            {faculties.map(f => (
                                                <SelectItem key={f} value={f} className="px-4 py-3 cursor-pointer hover:bg-[#F5F9FF] rounded-lg transition-colors">
                                                    <span className="flex items-center">
                                                        <span className="mr-2">🏛️</span>
                                                        {f}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* Year Filter */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#1E293B] mb-3 flex items-center whitespace-nowrap">
                                        <Calendar className="mr-2 text-[#0694FA]" size={16} />
                                        Năm học
                                    </label>
                                    <Select value={year || "all"} onValueChange={val => setYear(val === "all" ? "" : val)}>
                                        <SelectTrigger className="w-full border-2 border-slate-200 bg-[#F1F1E6] hover:bg-white hover:border-slate-400 focus:border-slate-400 rounded-xl px-4 py-3 min-h-[48px] transition-all duration-200">
                                            <SelectValue placeholder="Tất cả năm học" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl shadow-lg border border-slate-200 bg-white py-2 max-h-48 overflow-y-auto">
                                            <SelectItem value="all" className="px-4 py-3 cursor-pointer hover:bg-[#F5F9FF] rounded-lg transition-colors">
                                                <span className="flex items-center">
                                                    <span className="mr-2">📅</span>
                                                    Tất cả năm học
                                                </span>
                                            </SelectItem>
                                            {years.map(y => (
                                                <SelectItem key={y} value={y} className="px-4 py-3 cursor-pointer hover:bg-[#F5F9FF] rounded-lg transition-colors">
                                                    <span className="flex items-center">
                                                        <span className="mr-2">📅</span>
                                                        {y}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Main Content */}
                    <div className="lg:col-span-3 order-1 lg:order-2">
                        {/* Tabs */}
                        <div className="flex space-x-2 mb-8 bg-[#F5F9FF] p-2 rounded-2xl shadow-lg border border-slate-300">
                            <button
                                onClick={() => setActiveTab("all")}
                                className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                                    activeTab === "all"
                                        ? "bg-[#0694FA] text-white shadow-lg"
                                        : "text-[#1E293B] hover:text-[#0694FA] hover:bg-[#F1F1E6]"
                                }`}
                            >
                                <FileText size={20} />
                                <span>Tất Cả Tài Liệu</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    activeTab === "all" 
                                        ? "bg-white/20 text-white" 
                                        : "bg-[#F1F1E6] text-[#0694FA]"
                                }`}>
                                    {filteredDocs.length}
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab("hot")}
                                className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                                    activeTab === "hot"
                                        ? "bg-[#1E293B] text-white shadow-lg"
                                        : "text-[#1E293B] hover:text-[#0694FA] hover:bg-[#F1F1E6]"
                                }`}
                            >
                                <TrendingUp size={20} />
                                <span>Tài Liệu Hot</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    activeTab === "hot" 
                                        ? "bg-white/20 text-white" 
                                        : "bg-[#F1F1E6] text-[#1E293B]"
                                }`}>
                                    {hotDocs.length}
                                </span>
                            </button>
                        </div>
                        
                        {/* Documents Grid */}
                        {activeTab === "all" && (
                            <>
                                {filteredDocs.length === 0 && (
                                    <div className="text-center py-16">
                                        <div className="text-[#1E293B] mb-4">
                                            <FileText size={64} className="mx-auto" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-[#1E293B] mb-2">Không tìm thấy tài liệu</h3>
                                        <p className="text-[#1E293B]">Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {paginatedDocs.map((doc) => (
                                        <div key={doc._id} className="group bg-[#F5F9FF] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-slate-300">
                                            <div className="p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="text-4xl p-3 bg-[#F1F1E6] rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                                            {doc.file.type.includes("pdf") && "📄"}
                                                            {doc.file.type.includes("doc") && "📝"}
                                                            {doc.file.type.includes("ppt") && "📊"}
                                                            {!["pdf", "doc", "ppt"].some(t => doc.file.type.includes(t)) && "📎"}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="font-bold text-[#1E293B] text-lg leading-tight mb-2 group-hover:text-[#0694FA] transition-colors duration-300">
                                                                {doc.title}
                                                            </h3>
                                                            <div className="flex items-center space-x-3">
                                                                <span className="bg-[#F1F1E6] text-[#1E293B] text-xs font-semibold px-3 py-1 rounded-full border border-slate-300">
                                                                    {doc.file.type.split("/").pop()?.toUpperCase()}
                                                                </span>
                                                                <span className="text-sm text-[#1E293B]">
                                                                    {(doc.file.size / 1024 / 1024).toFixed(2)} MB
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-3 mb-5">
                                                    <div className="grid grid-cols-1 gap-2">
                                                        <div className="flex items-center text-sm text-gray-700 bg-blue-50 px-3 py-2 rounded-lg">
                                                            <Book size={16} className="mr-2 text-blue-500" />
                                                            <span className="font-medium">{doc.subject}</span>
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-700 bg-purple-50 px-3 py-2 rounded-lg">
                                                            <User size={16} className="mr-2 text-purple-500" />
                                                            <span>GV: {doc.lecturer}</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="flex items-center text-sm text-gray-700 bg-green-50 px-3 py-2 rounded-lg">
                                                                <GraduationCap size={14} className="mr-1 text-green-500" />
                                                                <span className="truncate">{doc.faculty}</span>
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-700 bg-orange-50 px-3 py-2 rounded-lg">
                                                                <Calendar size={14} className="mr-1 text-orange-500" />
                                                                <span>{doc.academicYear}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                                                            <User size={14} className="mr-2 text-gray-500" />
                                                            <span>Uploader: {doc.uploadedBy?.username || "Unknown"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                        <div className="flex items-center bg-green-100 px-3 py-1 rounded-full">
                                                            <Download size={14} className="mr-1 text-green-600" />
                                                            <span className="font-semibold text-green-700">{doc.downloads}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            type="button"
                                                            className="p-3 text-green-600 bg-green-50 hover:bg-green-100 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
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
                                                        <button
                                                            type="button"
                                                            className="p-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
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
                                    <div className="flex justify-center mt-10">
                                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-2 border border-white/50">
                                            <Pagination>
                                                <PaginationContent className="gap-1">
                                                    <PaginationItem>
                                                        <PaginationPrevious
                                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                                            aria-disabled={currentPage === 1}
                                                            className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                                                                currentPage === 1 
                                                                    ? 'text-gray-400 cursor-not-allowed' 
                                                                    : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                                                            }`}
                                                        />
                                                    </PaginationItem>
                                                    {Array.from({ length: totalPages }, (_, i) => (
                                                        <PaginationItem key={i + 1}>
                                                            <PaginationLink
                                                                isActive={currentPage === i + 1}
                                                                onClick={() => setCurrentPage(i + 1)}
                                                                className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                                                                    currentPage === i + 1
                                                                        ? 'bg-[#0694FA] text-white shadow-lg'
                                                                        : 'text-[#1E293B] hover:bg-[#F5F9FF] hover:text-[#0694FA]'
                                                                }`}
                                                            >
                                                                {i + 1}
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                    ))}
                                                    <PaginationItem>
                                                        <PaginationNext
                                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                                            aria-disabled={currentPage === totalPages}
                                                            className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                                                                currentPage === totalPages 
                                                                    ? 'text-gray-400 cursor-not-allowed' 
                                                                    : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                                                            }`}
                                                        />
                                                    </PaginationItem>
                                                </PaginationContent>
                                            </Pagination>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                        
                        {/* Hot Documents */}
                        {activeTab === "hot" && (
                            <div className="space-y-6">
                                {hotDocs.length === 0 && (
                                    <div className="text-center py-16">
                                        <div className="text-gray-400 mb-4">
                                            <TrendingUp size={64} className="mx-auto" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-600 mb-2">Chưa có tài liệu hot</h3>
                                        <p className="text-gray-500">Tài liệu sẽ hiển thị ở đây khi có hơn 100 lượt tải</p>
                                    </div>
                                )}
                                {hotDocs.map((doc, idx) => (
                                    <div key={doc._id} className="group bg-[#F5F9FF] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-slate-300 transform hover:-translate-y-1">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-6">
                                                <div className="flex items-center justify-center w-16 h-16 bg-[#1E293B] text-white rounded-2xl font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                    #{idx + 1}
                                                </div>
                                                <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                                                    {getFileIcon(doc.file?.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-[#1E293B] text-xl mb-2 group-hover:text-[#0694FA] transition-colors duration-300">
                                                        {doc.title}
                                                    </h3>
                                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                                        <div className="flex items-center text-gray-700 bg-blue-50 px-3 py-2 rounded-lg">
                                                            <Book size={14} className="mr-2 text-blue-500" />
                                                            <span>{doc.subject}</span>
                                                        </div>
                                                        <div className="flex items-center text-gray-700 bg-purple-50 px-3 py-2 rounded-lg">
                                                            <User size={14} className="mr-2 text-purple-500" />
                                                            <span>{doc.lecturer}</span>
                                                        </div>
                                                        <div className="flex items-center text-gray-700 bg-green-50 px-3 py-2 rounded-lg">
                                                            <GraduationCap size={14} className="mr-2 text-green-500" />
                                                            <span>{doc.faculty}</span>
                                                        </div>
                                                        <div className="flex items-center text-gray-700 bg-orange-50 px-3 py-2 rounded-lg">
                                                            <Calendar size={14} className="mr-2 text-orange-500" />
                                                            <span>{doc.academicYear}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-6">
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center bg-[#0694FA] text-white font-bold text-2xl px-4 py-2 rounded-xl shadow-lg mb-2">
                                                        <TrendingUp size={24} className="mr-2" />
                                                        {doc.downloads}
                                                    </div>
                                                    <span className="text-sm text-[#1E293B] font-medium">lượt tải</span>
                                                </div>
                                                <div className="flex flex-col space-y-3">
                                                    <button
                                                        type="button"
                                                        className="p-4 text-green-600 bg-green-50 hover:bg-green-100 rounded-2xl transition-all duration-200 hover:scale-110 shadow-lg hover:shadow-xl"
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
                                                        <Download size={24} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="p-4 text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl transition-all duration-200 hover:scale-110 shadow-lg hover:shadow-xl"
                                                        title="Xoá tài liệu"
                                                        onClick={() => handleDelete(doc._id)}
                                                    >
                                                        <Trash2 size={24} />
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
                                <DialogContent className="bg-white/95 backdrop-blur-lg border border-white/50 shadow-2xl rounded-2xl">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center text-xl">
                                            <div className="p-2 bg-[#F5F9FF] rounded-full mr-3">
                                                <UploadCloud className="text-[#0694FA]" size={24} />
                                            </div>
                                            <span className="text-[#1E293B] font-bold">
                                                Tải lên thành công!
                                            </span>
                                        </DialogTitle>
                                        <p className="text-[#1E293B] mt-2">Tài liệu đã được thêm vào thư viện</p>
                                    </DialogHeader>
                                    <div className="space-y-4 mt-6">
                                        {uploadedFiles.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 bg-[#F5F9FF] rounded-xl border border-[#0694FA]">
                                                <div className="flex items-center space-x-3">
                                                    <div className="text-3xl">{getFileIcon(file.type)}</div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{file.name}</p>
                                                        <p className="text-sm text-gray-600">{file.size}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center text-green-600 font-semibold bg-white px-3 py-1 rounded-lg shadow-sm">
                                                    <Star size={16} className="mr-1" />
                                                    Thành công
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <DialogFooter>
                                        <Button 
                                            onClick={() => setUploadedFiles([])} 
                                            className="w-full bg-[#0694FA] hover:bg-[#1E293B] text-white rounded-xl py-3"
                                        >
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
                <DialogContent className="bg-[#F5F9FF] border border-slate-300 shadow-2xl rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-[#1E293B] flex items-center">
                            <UploadCloud className="mr-3 text-[#0694FA]" size={28} />
                            Tải Lên Tài Liệu Mới
                        </DialogTitle>
                        <p className="text-[#1E293B] mt-2">Chia sẻ tài liệu học tập với cộng đồng</p>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#1E293B]">📝 Tiêu đề tài liệu</label>
                            <Input
                                name="title"
                                placeholder="Nhập tiêu đề tài liệu..."
                                value={form.title}
                                onChange={handleChange}
                                required
                                className="border-2 border-slate-200 focus:border-slate-400 rounded-xl py-3 px-4 transition-all duration-200"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#1E293B]">📚 Môn học</label>
                            <Select value={form.subject} onValueChange={val => setForm({ ...form, subject: val })} required>
                                <SelectTrigger className="w-full border-2 border-slate-200 focus:border-slate-400 rounded-xl py-3 px-4 transition-all duration-200">
                                    <SelectValue placeholder="Chọn môn học" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl shadow-lg border border-slate-200 bg-white">
                                    <SelectItem value="Advanced Mathematics" className="px-4 py-3 hover:bg-[#F5F9FF] transition-colors">
                                        📐 Advanced Mathematics
                                    </SelectItem>
                                    <SelectItem value="Web Programming" className="px-4 py-3 hover:bg-[#F5F9FF] transition-colors">
                                        💻 Web Programming
                                    </SelectItem>
                                    <SelectItem value="Microeconomics" className="px-4 py-3 hover:bg-[#F5F9FF] transition-colors">
                                        📈 Microeconomics
                                    </SelectItem>
                                    <SelectItem value="2D Graphic Design" className="px-4 py-3 hover:bg-[#F5F9FF] transition-colors">
                                        🎨 2D Graphic Design
                                    </SelectItem>
                                    <SelectItem value="English for Specific Purposes" className="px-4 py-3 hover:bg-[#F5F9FF] transition-colors">
                                        🌐 English for Specific Purposes
                                    </SelectItem>
                                    <SelectItem value="Basic Artificial Intelligence" className="px-4 py-3 hover:bg-[#F5F9FF] transition-colors">
                                        🤖 Basic Artificial Intelligence
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#1E293B]">👨‍🏫 Giảng viên</label>
                            <Input
                                name="lecturer"
                                placeholder="Nhập tên giảng viên..."
                                value={form.lecturer}
                                onChange={handleChange}
                                required
                                className="border-2 border-slate-200 focus:border-slate-400 rounded-xl py-3 px-4 transition-all duration-200"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#1E293B]">🏛️ Khoa</label>
                            <Select value={form.faculty} onValueChange={val => setForm({ ...form, faculty: val })} required>
                                <SelectTrigger className="w-full border-2 border-slate-200 focus:border-slate-400 rounded-xl py-3 px-4 transition-all duration-200">
                                    <SelectValue placeholder="Chọn khoa" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl shadow-lg border border-slate-200 bg-white">
                                    <SelectItem value="Software Engineering" className="px-4 py-3 hover:bg-[#F5F9FF] transition-colors">
                                        💻 Software Engineering
                                    </SelectItem>
                                    <SelectItem value="Artificial Intelligence" className="px-4 py-3 hover:bg-[#F5F9FF] transition-colors">
                                        🤖 Artificial Intelligence
                                    </SelectItem>
                                    <SelectItem value="Business Administration" className="px-4 py-3 hover:bg-[#F5F9FF] transition-colors">
                                        💼 Business Administration
                                    </SelectItem>
                                    <SelectItem value="Graphic Design" className="px-4 py-3 hover:bg-[#F5F9FF] transition-colors">
                                        🎨 Graphic Design
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#1E293B]">📅 Năm học</label>
                            <Input
                                name="academicYear"
                                placeholder="Ví dụ: 2024"
                                value={form.academicYear}
                                onChange={handleChange}
                                required
                                type="number"
                                min="1900"
                                max={new Date().getFullYear()}
                                className="border-2 border-slate-200 focus:border-slate-400 rounded-xl py-3 px-4 transition-all duration-200"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">📎 Chọn file</label>
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-slate-400 transition-colors">
                                <Input
                                    type="file"
                                    accept=".pdf,.docx,.pptx"
                                    onChange={handleFile}
                                    required
                                    className="border-0 bg-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                                />
                                <p className="text-sm text-gray-500 mt-2">Hỗ trợ: PDF, DOCX, PPTX</p>
                            </div>
                        </div>
                        
                        <DialogFooter>
                            <div className="flex space-x-4 w-full">
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                    className="flex-1 border-2 border-slate-300 hover:bg-gray-50 rounded-xl py-3"
                                >
                                    Hủy
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={loading}
                                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl py-3 font-semibold disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Đang tải...
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <UploadCloud size={18} className="mr-2" />
                                            Tải Lên
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            {/* Dialog đang xoá */}
            <Dialog open={deleting}>
                <DialogContent className="bg-white/95 backdrop-blur-lg border border-white/50 shadow-2xl rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center text-blue-600 text-xl">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                            Đang xoá tài liệu...
                        </DialogTitle>
                        <p className="text-gray-600 mt-2">Vui lòng đợi trong giây lát</p>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
            
            {/* Dialog thông báo xoá thành công */}
            <Dialog open={deleteSuccess} onOpenChange={setDeleteSuccess}>
                <DialogContent className="bg-white/95 backdrop-blur-lg border border-white/50 shadow-2xl rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center text-green-600 text-xl">
                            <div className="p-2 bg-green-100 rounded-full mr-3">
                                <Trash2 size={20} className="text-green-600" />
                            </div>
                            Đã xoá tài liệu thành công!
                        </DialogTitle>
                        <p className="text-gray-600 mt-2">Tài liệu đã được xoá khỏi hệ thống</p>
                    </DialogHeader>
                    <DialogFooter>
                        <Button 
                            onClick={() => setDeleteSuccess(false)} 
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl py-3"
                        >
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}