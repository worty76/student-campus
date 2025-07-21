"use client";
import React from "react";
import { useRouter } from "next/navigation";
import NavigationBar from "@/app/(main)/layouts/navbar";
import Image from "next/image";

const InfoPage = () => {
  const router = useRouter();

  const features = [
    {
      icon: "👥",
      title: "Mạng xã hội sinh viên",
      description: "Kết nối và chia sẻ với sinh viên trên toàn quốc"
    },
    {
      icon: "📚",
      title: "Chia sẻ tài liệu",
      description: "Trao đổi tài liệu học tập và nghiên cứu"
    },
    {
      icon: "💬",
      title: "Nhóm thảo luận",
      description: "Tham gia các nhóm học tập theo chuyên ngành"
    },
    {
      icon: "🎯",
      title: "Định hướng nghề nghiệp",
      description: "Tư vấn và hướng dẫn phát triển sự nghiệp"
    },
    {
      icon: "🔔",
      title: "Thông báo thông minh",
      description: "Cập nhật thông tin quan trọng kịp thời"
    },
    {
      icon: "🏆",
      title: "Hệ thống Premium",
      description: "Trải nghiệm nâng cao với nhiều tính năng độc quyền"
    }
  ];

  const teamMembers = [
    {
      name: "Nguyễn Văn Dev",
      role: "Trưởng nhóm phát triển",
      avatar: "/schoolimg.jpg",
      description: "Chuyên gia Full-stack với 5 năm kinh nghiệm"
    },
    {
      name: "Trần Thị Design",
      role: "UI/UX Designer",
      avatar: "/schoolimg.jpg",
      description: "Thiết kế giao diện thân thiện và hiện đại"
    },
    {
      name: "Lê Văn Backend",
      role: "Backend Developer",
      avatar: "/schoolimg.jpg",
      description: "Chuyên gia về hệ thống và cơ sở dữ liệu"
    },
    {
      name: "Phạm Thị Product",
      role: "Product Manager",
      avatar: "/schoolimg.jpg",
      description: "Định hướng sản phẩm và trải nghiệm người dùng"
    }
  ];

  const milestones = [
    {
      year: "2023",
      title: "Ra mắt phiên bản Alpha",
      description: "Bắt đầu với các tính năng cơ bản cho sinh viên CNTT"
    },
    {
      year: "2024",
      title: "Mở rộng toàn quốc",
      description: "Phục vụ sinh viên tất cả các trường đại học"
    },
    {
      year: "2024",
      title: "Tích hợp AI",
      description: "Thêm tính năng tư vấn thông minh và gợi ý cá nhân hóa"
    },
    {
      year: "2025",
      title: "Hệ sinh thái hoàn chỉnh",
      description: "Kết nối với doanh nghiệp và cơ hội việc làm"
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
          <div className="text-center mb-12">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-[#1E293B]/10 mb-8">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <button
                  onClick={() => router.push("/about")}
                  className="flex items-center space-x-2 text-[#0694FA] hover:text-[#1E293B] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm font-medium">Quay lại</span>
                </button>
                <div className="w-16 h-16 bg-gradient-to-br from-[#0694FA] to-[#1E293B] rounded-full flex items-center justify-center">
                  <span className="text-3xl">📚</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-[#1E293B] mb-4">
                Student Campus
              </h1>
              <p className="text-lg text-[#1E293B]/70 max-w-3xl mx-auto">
                Nền tảng mạng xã hội dành riêng cho sinh viên, kết nối tri thức và cơ hội nghề nghiệp
              </p>
            </div>
          </div>

          {/* Mission Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#1E293B]/10 mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#1E293B] mb-4">Sứ mệnh của chúng tôi</h2>
              <p className="text-[#1E293B]/70 max-w-4xl mx-auto">
                Student Campus được tạo ra với sứ mệnh kết nối các sinh viên trên toàn quốc, 
                tạo ra một môi trường học tập tích cực và hỗ trợ sinh viên phát triển kỹ năng 
                cần thiết cho sự nghiệp tương lai.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-[#F5F5FF] rounded-xl">
                <div className="w-12 h-12 mx-auto mb-4 bg-[#0694FA] rounded-full flex items-center justify-center">
                  <span className="text-xl">🎯</span>
                </div>
                <h3 className="font-bold text-[#1E293B] mb-2">Tầm nhìn</h3>
                <p className="text-sm text-[#1E293B]/70">
                  Trở thành nền tảng hàng đầu cho sinh viên Việt Nam
                </p>
              </div>
              <div className="text-center p-6 bg-[#F1F1E6] rounded-xl">
                <div className="w-12 h-12 mx-auto mb-4 bg-[#1E293B] rounded-full flex items-center justify-center">
                  <span className="text-xl">💡</span>
                </div>
                <h3 className="font-bold text-[#1E293B] mb-2">Giá trị cốt lõi</h3>
                <p className="text-sm text-[#1E293B]/70">
                  Chia sẻ kiến thức, hỗ trợ lẫn nhau và phát triển cùng nhau
                </p>
              </div>
              <div className="text-center p-6 bg-[#F5F5FF] rounded-xl">
                <div className="w-12 h-12 mx-auto mb-4 bg-[#0694FA] rounded-full flex items-center justify-center">
                  <span className="text-xl">🚀</span>
                </div>
                <h3 className="font-bold text-[#1E293B] mb-2">Mục tiêu</h3>
                <p className="text-sm text-[#1E293B]/70">
                  Kết nối 100,000 sinh viên vào năm 2025
                </p>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#1E293B]/10 mb-12">
            <h2 className="text-2xl font-bold text-[#1E293B] mb-8 text-center">
              Tính năng nổi bật
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-6 bg-[#F5F5FF] rounded-xl hover:bg-[#F1F1E6] transition-colors duration-300"
                >
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="font-bold text-[#1E293B] mb-2">{feature.title}</h3>
                  <p className="text-sm text-[#1E293B]/70">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#1E293B]/10 mb-12">
            <h2 className="text-2xl font-bold text-[#1E293B] mb-8 text-center">
              Lộ trình phát triển
            </h2>
            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-[#0694FA] rounded-full flex items-center justify-center text-white font-bold">
                    {milestone.year}
                  </div>
                  <div className="flex-1 pb-6 border-b border-[#1E293B]/10 last:border-b-0">
                    <h3 className="font-bold text-[#1E293B] mb-2">{milestone.title}</h3>
                    <p className="text-[#1E293B]/70">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#1E293B]/10 mb-12">
            <h2 className="text-2xl font-bold text-[#1E293B] mb-8 text-center">
              Đội ngũ phát triển
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="text-center p-6 bg-[#F5F5FF] rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 mx-auto mb-4 rounded-full object-cover border-4 border-[#0694FA]/30"
                  />
                  <h3 className="font-bold text-[#1E293B] mb-1">{member.name}</h3>
                  <p className="text-sm text-[#0694FA] font-medium mb-2">{member.role}</p>
                  <p className="text-xs text-[#1E293B]/70">{member.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#1E293B]/10">
            <h2 className="text-2xl font-bold text-[#1E293B] mb-6 text-center">
              Liên hệ với chúng tôi
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="p-4">
                <div className="w-12 h-12 mx-auto mb-3 bg-[#0694FA] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-[#1E293B] mb-1">Email</h3>
                <p className="text-sm text-[#1E293B]/70">support@studentcampus.vn</p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 mx-auto mb-3 bg-[#1E293B] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="font-bold text-[#1E293B] mb-1">Hotline</h3>
                <p className="text-sm text-[#1E293B]/70">1900-CAMPUS</p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 mx-auto mb-3 bg-[#0694FA] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-[#1E293B] mb-1">Địa chỉ</h3>
                <p className="text-sm text-[#1E293B]/70">Hà Nội, Việt Nam</p>
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

export default InfoPage;
