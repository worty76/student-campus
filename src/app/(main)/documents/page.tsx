'use client';
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, Flame } from "lucide-react";
import NavigationBar from "@/app/(main)/layouts/navbar";
// Dummy data for filters and documents
const subjects = ["Toán", "Lý", "Hóa", "Văn"];
const lecturers = ["Thầy A", "Cô B", "Thầy C"];
const faculties = ["CNTT/Năm 1", "Kinh tế/Năm 2", "Y/Năm 3"];

const documents = [
    {
        id: 1,
        name: "Bài giảng Toán cao cấp.pdf",
        subject: "Toán",
        lecturer: "Thầy A",
        faculty: "CNTT/Năm 1",
        downloads: 120,
        url: "#",
    },
    {
        id: 2,
        name: "Slide Kinh tế vĩ mô.pptx",
        subject: "Kinh tế",
        lecturer: "Cô B",
        faculty: "Kinh tế/Năm 2",
        downloads: 80,
        url: "#",
    },
    {
        id: 3,
        name: "Tài liệu Hóa học.docx",
        subject: "Hóa",
        lecturer: "Thầy C",
        faculty: "Y/Năm 3",
        downloads: 200,
        url: "#",
    },
];

export default function DocumentsPage() {
    const [subject, setSubject] = useState("");
    const [lecturer, setLecturer] = useState("");
    const [faculty, setFaculty] = useState("");
    // const [file, setFile] = useState(null);

    // Filter documents
    const filteredDocs = documents.filter(
        (doc) =>
            (!subject || subject === "all" || doc.subject === subject) &&
            (!lecturer || lecturer === "all" || doc.lecturer === lecturer) &&
            (!faculty || faculty === "all" || doc.faculty === faculty)
    );

    // Hot documents (top 3 by downloads)
    const hotDocs = [...documents]
        .sort((a, b) => b.downloads - a.downloads)
        .slice(0, 3);

    // const handleUpload = () => {
    //     setFile(file);
    // };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Chia sẻ tài liệu</h1>
            <NavigationBar />
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-8">
                <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger className="w-48 bg-white border-solid border-blue-300 hover:border-blue-400 focus-within:border-blue-500">
                        <SelectValue placeholder="Chọn môn học" />
                    </SelectTrigger>
                    <SelectContent>
                        {[
                            { label: "Tất cả môn học", value: "all" },
                            ...subjects.map((s) => ({ label: s, value: s })),
                        ].map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                                {item.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={lecturer} onValueChange={setLecturer}>
                    <SelectTrigger className="w-48 bg-white border-solid border-blue-300 hover:border-blue-400 focus-within:border-blue-500">
                        <SelectValue placeholder="Chọn giảng viên" />
                    </SelectTrigger>
                    <SelectContent>
                        {[
                            { label: "Tất cả giảng viên", value: "all" },
                            ...lecturers.map((l) => ({ label: l, value: l })),
                        ].map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                                {item.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={faculty} onValueChange={setFaculty}>
                    <SelectTrigger className="w-48 bg-white border-solid border-blue-300 hover:border-blue-400 focus-within:border-blue-500">
                        <SelectValue placeholder="Chọn khoa/năm học" />
                    </SelectTrigger>
                    <SelectContent>
                        {[
                            { label: "Tất cả khoa/năm", value: "all" },
                            ...faculties.map((f) => ({ label: f, value: f })),
                        ].map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                                {item.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Upload */}
            <div className="flex items-center gap-4 mb-10 bg-blue-50 p-4 rounded-lg">
                <Input
                    type="file"
                    accept=".pdf,.docx,.pptx"
                    // onChange={(e) => {console.log("no")}}
                    className="bg-white"
                />
                <Button
                    // onClick={handleUpload}
                    className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                    // disabled={!file}
                >
                    <UploadCloud size={18} />
                    Tải lên
                </Button>
            </div>

            {/* Hot Documents */}
            <Card className="mb-8 border-blue-200 bg-gradient-to-r from-blue-50 to-white">
                <CardHeader className="flex flex-row items-center gap-2">
                    <Flame className="text-blue-600" />
                    <CardTitle className="text-blue-700">Tài liệu hot</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul>
                        {hotDocs.map((doc) => (
                            <li
                                key={doc.id}
                                className="flex justify-between items-center py-2 border-b last:border-b-0"
                            >
                                <a
                                    href={doc.url}
                                    className="text-blue-800 font-medium hover:underline"
                                >
                                    {doc.name}
                                </a>
                                <span className="text-blue-600 font-semibold">
                                    {doc.downloads} lượt tải
                                </span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* Document List */}
            <div>
                <h2 className="text-xl font-semibold mb-4 text-blue-700">
                    Danh sách tài liệu
                </h2>
                <div className="grid gap-4">
                    {filteredDocs.length === 0 && (
                        <div className="text-gray-500">Không có tài liệu phù hợp.</div>
                    )}
                    {filteredDocs.map((doc) => (
                        <Card key={doc.id} className="border-blue-100">
                            <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-2 py-4">
                                <div>
                                    <a
                                        href={doc.url}
                                        className="text-blue-800 font-medium hover:underline"
                                    >
                                        {doc.name}
                                    </a>
                                    <div className="text-sm text-gray-500">
                                        {doc.subject} | {doc.lecturer} | {doc.faculty}
                                    </div>
                                </div>
                                <span className="text-blue-600 font-semibold">
                                    {doc.downloads} lượt tải
                                </span>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}