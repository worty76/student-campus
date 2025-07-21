"use client";
import React from "react";
import { useRouter } from "next/navigation";
import NavigationBar from "@/app/(main)/layouts/navbar";


const AboutPage = () => {
  const router = useRouter();

  const aboutSections = [
    {
      id: "qa",
      title: "Hỏi đáp CNTT",
      description: "Nền tảng hỏi đáp và thảo luận về các vấn đề công nghệ thông tin",
      icon: "🗨️",
      features: [
        "Đặt câu hỏi và nhận câu trả lời từ cộng đồng",
        "Thảo luận về các chủ đề CNTT",
        "Chia sẻ kinh nghiệm và kiến thức",
        "Tìm hiểu các xu hướng công nghệ mới"
      ],
      route: "/about/qa"
    },
    {
      id: "info",
      title: "Thông tin trang web",
      description: "Thông tin chi tiết về nền tảng Student Campus và các tính năng",
      icon: "📚",
      features: [
        "Lịch sử phát triển của nền tảng",
        "Mục tiêu và sứ mệnh",
        "Đội ngũ phát triển",
        "Hướng dẫn sử dụng chi tiết"
      ],
      route: "/about/info"
    },
    {
      id: "career",
      title: "Nghề nghiệp",
      description: "Thông tin về cơ hội nghề nghiệp và hướng dẫn phát triển sự nghiệp",
      icon: "💼",
      features: [
        "Tư vấn định hướng nghề nghiệp",
        "Thông tin về các công ty tuyển dụng",
        "Hướng dẫn viết CV và phỏng vấn",
        "Chia sẻ kinh nghiệm từ những người đi trước"
      ],
      route: "/about/career"
    }
  ];

  return (
    <div className="bg-[#F1F1E6] min-h-screen pb-20 flex flex-col relative overflow-x-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#0694FA]/10 rounded-full blur-3xl opacity-40 -z-10" />
      <div className="absolute top-20 right-0 w-72 h-72 bg-[#1E293B]/10 rounded-full blur-3xl opacity-30 -z-10" />
      <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-[#0694FA]/10 rounded-full blur-3xl opacity-25 -z-10" />

      {/* Top gradient bar */}
      <div className="w-full h-1 bg-[#0694FA] shadow-sm" />

      {/* Fixed Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-[#1E293B]/10">
        <NavigationBar />
      </div>

      {/* Main Content */}
      <div className="flex-1 pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-[#1E293B]/10 mb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#0694FA] to-[#1E293B] rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-[#1E293B] mb-4">
                Về Student Campus
              </h1>
              <p className="text-lg text-[#1E293B]/70 max-w-3xl mx-auto">
                Khám phá các tính năng và dịch vụ mà Student Campus cung cấp để hỗ trợ sinh viên 
                trong quá trình học tập và phát triển nghề nghiệp.
              </p>
            </div>
          </div>

          {/* Sections Grid */}
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {aboutSections.map((section) => (
              <div
                key={section.id}
                className="bg-white rounded-2xl p-6 shadow-lg border border-[#1E293B]/10 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => router.push(section.route)}
              >
                <div className="text-center mb-6">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {section.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[#1E293B] mb-2 group-hover:text-[#0694FA] transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-[#1E293B]/70 text-sm">
                    {section.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-[#1E293B] text-sm">Tính năng chính:</h4>
                  <ul className="space-y-2">
                    {section.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2 text-xs text-[#1E293B]/70">
                        <span className="w-1.5 h-1.5 bg-[#0694FA] rounded-full mt-1.5 flex-shrink-0"></span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-[#1E293B]/10">
                  <button className="w-full px-4 py-2 bg-[#0694FA] text-white rounded-xl font-medium hover:bg-[#1E293B] transition-colors duration-300 text-sm">
                    Tìm hiểu thêm
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#1E293B]/10 mb-8">
            <h3 className="text-xl font-bold text-[#1E293B] mb-6 text-center">
              Thống kê nền tảng
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-[#F5F5FF] rounded-xl">
                <div className="text-2xl font-bold text-[#0694FA] mb-1">1000+</div>
                <div className="text-xs text-[#1E293B]/70">Sinh viên tham gia</div>
              </div>
              <div className="text-center p-4 bg-[#F1F1E6] rounded-xl">
                <div className="text-2xl font-bold text-[#0694FA] mb-1">500+</div>
                <div className="text-xs text-[#1E293B]/70">Bài viết chia sẻ</div>
              </div>
              <div className="text-center p-4 bg-[#F5F5FF] rounded-xl">
                <div className="text-2xl font-bold text-[#0694FA] mb-1">50+</div>
                <div className="text-xs text-[#1E293B]/70">Nhóm học tập</div>
              </div>
              <div className="text-center p-4 bg-[#F1F1E6] rounded-xl">
                <div className="text-2xl font-bold text-[#0694FA] mb-1">24/7</div>
                <div className="text-xs text-[#1E293B]/70">Hỗ trợ trực tuyến</div>
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

export default AboutPage;
