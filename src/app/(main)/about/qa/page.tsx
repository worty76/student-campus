"use client";
import React from "react";
import { useRouter } from "next/navigation";
import NavigationBar from "@/app/(main)/layouts/navbar";

const QAPage = () => {
  const router = useRouter();

  const qaTopics = [
    {
      title: "Hỏi đáp về Lập trình",
      description: "Thảo luận về các ngôn ngữ lập trình, frameworks và best practices",
      icon: "💻",
      topics: [
        "Python Programming",
        "JavaScript & Node.js",
        "Java Development",
        "C++ & Data Structures",
        "Web Development"
      ]
    },
    {
      title: "Hỏi đáp về Database",
      description: "Trao đổi kiến thức về cơ sở dữ liệu và quản lý dữ liệu",
      icon: "🗄️",
      topics: [
        "MySQL & PostgreSQL",
        "MongoDB & NoSQL",
        "Database Design",
        "SQL Optimization",
        "Data Modeling"
      ]
    },
    {
      title: "Hỏi đáp về AI/ML",
      description: "Thảo luận về trí tuệ nhân tạo và machine learning",
      icon: "🤖",
      topics: [
        "Machine Learning Basics",
        "Deep Learning",
        "Natural Language Processing",
        "Computer Vision",
        "Data Science"
      ]
    },
    {
      title: "Hỏi đáp về Mobile Development",
      description: "Phát triển ứng dụng di động và cross-platform",
      icon: "📱",
      topics: [
        "React Native",
        "Flutter Development",
        "iOS Swift",
        "Android Kotlin",
        "Cross-platform Solutions"
      ]
    },
    {
      title: "Hỏi đáp về DevOps",
      description: "Triển khai, CI/CD và quản lý hạ tầng",
      icon: "🔧",
      topics: [
        "Docker & Containers",
        "Kubernetes",
        "CI/CD Pipelines",
        "Cloud Services (AWS, Azure)",
        "Infrastructure as Code"
      ]
    },
    {
      title: "Hỏi đáp về Cybersecurity",
      description: "Bảo mật thông tin và an toàn hệ thống",
      icon: "🔒",
      topics: [
        "Web Security",
        "Network Security",
        "Penetration Testing",
        "Cryptography",
        "Security Best Practices"
      ]
    }
  ];

  return (
    <div className="bg-[#F1F1E6] min-h-screen pb-20 flex flex-col relative overflow-x-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#0694FA]/10 rounded-full blur-3xl opacity-40 -z-10" />
      <div className="absolute top-20 right-0 w-72 h-72 bg-[#1E293B]/10 rounded-full blur-3xl opacity-30 -z-10" />

      {/* Top gradient bar */}
      <div className="w-full h-1 bg-[#0694FA] shadow-sm" />

      {/* Fixed Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-[#1E293B]/10">
        <NavigationBar />
      </div>

      {/* Main Content */}
      <div className="flex-1 pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-[#1E293B]/10 mb-6">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <button
                  onClick={() => router.push("/about")}
                  className="flex items-center space-x-2 text-[#0694FA] hover:text-[#1E293B] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm font-medium">Quay lại</span>
                </button>
                <div className="w-12 h-12 bg-gradient-to-br from-[#0694FA] to-[#1E293B] rounded-full flex items-center justify-center">
                  <span className="text-2xl">🗨️</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-[#1E293B] mb-2">
                Hỏi đáp CNTT
              </h1>
              <p className="text-[#1E293B]/70">
                Nền tảng hỏi đáp và thảo luận về các vấn đề công nghệ thông tin
              </p>
            </div>
          </div>

          {/* Introduction Section */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#1E293B]/10 mb-8">
            <h2 className="text-2xl font-bold text-[#1E293B] mb-4 text-center">
              Về tính năng Hỏi đáp CNTT
            </h2>
            <p className="text-[#1E293B]/70 text-center max-w-4xl mx-auto mb-6">
              Student Campus cung cấp nền tảng hỏi đáp chuyên sâu về công nghệ thông tin, 
              giúp sinh viên và developers chia sẻ kiến thức, giải đáp thắc mắc và học hỏi lẫn nhau.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="text-center p-4 bg-[#F5F5FF] rounded-xl">
                <div className="w-12 h-12 mx-auto mb-3 bg-[#0694FA] rounded-full flex items-center justify-center">
                  <span className="text-xl">❓</span>
                </div>
                <h3 className="font-bold text-[#1E293B] mb-2">Đặt câu hỏi</h3>
                <p className="text-sm text-[#1E293B]/70">
                  Đăng câu hỏi về bất kỳ chủ đề CNTT nào
                </p>
              </div>
              <div className="text-center p-4 bg-[#F1F1E6] rounded-xl">
                <div className="w-12 h-12 mx-auto mb-3 bg-[#1E293B] rounded-full flex items-center justify-center">
                  <span className="text-xl">💬</span>
                </div>
                <h3 className="font-bold text-[#1E293B] mb-2">Thảo luận</h3>
                <p className="text-sm text-[#1E293B]/70">
                  Tham gia thảo luận với cộng đồng
                </p>
              </div>
              <div className="text-center p-4 bg-[#F5F5FF] rounded-xl">
                <div className="w-12 h-12 mx-auto mb-3 bg-[#0694FA] rounded-full flex items-center justify-center">
                  <span className="text-xl">🎯</span>
                </div>
                <h3 className="font-bold text-[#1E293B] mb-2">Chuyên sâu</h3>
                <p className="text-sm text-[#1E293B]/70">
                  Nhận câu trả lời chuyên môn từ experts
                </p>
              </div>
            </div>
          </div>

          {/* Topics Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1E293B] text-center mb-8">
              Các chủ đề hỏi đáp
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {qaTopics.map((topic, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-[#1E293B]/10 hover:shadow-xl transition-all duration-300"
                >
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-3">{topic.icon}</div>
                    <h3 className="text-lg font-bold text-[#1E293B] mb-2">
                      {topic.title}
                    </h3>
                    <p className="text-sm text-[#1E293B]/70 mb-4">
                      {topic.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-[#1E293B] text-sm">
                      Chủ đề phổ biến:
                    </h4>
                    <ul className="space-y-2">
                      {topic.topics.map((topicItem, i) => (
                        <li key={i} className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-[#0694FA] rounded-full flex-shrink-0"></span>
                          <span className="text-xs text-[#1E293B]/70">{topicItem}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#1E293B]/10 mt-12">
            <h2 className="text-2xl font-bold text-[#1E293B] mb-8 text-center">
              Tính năng nổi bật
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#F5F5FF] rounded-full flex items-center justify-center">
                  <span className="text-2xl">🏷️</span>
                </div>
                <h3 className="font-bold text-[#1E293B] mb-2">Tags & Categories</h3>
                <p className="text-sm text-[#1E293B]/70">
                  Phân loại câu hỏi theo chủ đề rõ ràng
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#F1F1E6] rounded-full flex items-center justify-center">
                  <span className="text-2xl">⭐</span>
                </div>
                <h3 className="font-bold text-[#1E293B] mb-2">Rating System</h3>
                <p className="text-sm text-[#1E293B]/70">
                  Đánh giá chất lượng câu trả lời
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#F5F5FF] rounded-full flex items-center justify-center">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="font-bold text-[#1E293B] mb-2">Advanced Search</h3>
                <p className="text-sm text-[#1E293B]/70">
                  Tìm kiếm thông minh và chính xác
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#F1F1E6] rounded-full flex items-center justify-center">
                  <span className="text-2xl">👨‍💻</span>
                </div>
                <h3 className="font-bold text-[#1E293B] mb-2">Expert Community</h3>
                <p className="text-sm text-[#1E293B]/70">
                  Cộng đồng chuyên gia và experienced developers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient bar */}
      <div className="w-full h-1 bg-[#0694FA] shadow-sm" />
    </div>
  );
};

export default QAPage;
