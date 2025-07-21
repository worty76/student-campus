"use client";
import React from "react";
import { useRouter } from "next/navigation";
import NavigationBar from "@/app/(main)/layouts/navbar";

const CareerPage = () => {
  const router = useRouter();

  const careerPaths = [
    {
      title: "Frontend Developer",
      description: "Phát triển giao diện người dùng với React, Vue.js, Angular",
      requirements: ["HTML/CSS", "JavaScript", "React/Vue/Angular", "Responsive Design"],
      salary: "15-30 triệu VNĐ",
      demand: "Cao",
      icon: "🎨",
      skills: ["UI/UX Understanding", "Cross-browser Compatibility", "Performance Optimization"]
    },
    {
      title: "Backend Developer", 
      description: "Xây dựng API và hệ thống phía server",
      requirements: ["Python/Java/Node.js", "Database", "RESTful API", "Cloud Services"],
      salary: "18-35 triệu VNĐ",
      demand: "Rất cao",
      icon: "⚙️",
      skills: ["Server Architecture", "Database Design", "API Development"]
    },
    {
      title: "Full-stack Developer",
      description: "Phát triển cả frontend và backend",
      requirements: ["Frontend Tech", "Backend Tech", "Database", "DevOps"],
      salary: "20-40 triệu VNĐ", 
      demand: "Cao",
      icon: "🚀",
      skills: ["End-to-end Development", "System Integration", "Project Management"]
    },
    {
      title: "Mobile Developer",
      description: "Phát triển ứng dụng di động iOS/Android",
      requirements: ["Swift/Kotlin", "React Native/Flutter", "UI/UX", "App Store"],
      salary: "17-32 triệu VNĐ",
      demand: "Cao", 
      icon: "📱",
      skills: ["Mobile UI/UX", "Platform Guidelines", "Performance Optimization"]
    },
    {
      title: "DevOps Engineer",
      description: "Quản lý hạ tầng và triển khai ứng dụng",
      requirements: ["Docker", "Kubernetes", "AWS/Azure", "CI/CD"],
      salary: "25-45 triệu VNĐ",
      demand: "Rất cao",
      icon: "🔧",
      skills: ["Infrastructure as Code", "Monitoring", "Security"]
    },
    {
      title: "Data Scientist",
      description: "Phân tích dữ liệu và xây dựng mô hình ML",
      requirements: ["Python/R", "Machine Learning", "Statistics", "SQL"],
      salary: "22-40 triệu VNĐ",
      demand: "Cao",
      icon: "📊",
      skills: ["Statistical Analysis", "Data Visualization", "Machine Learning"]
    }
  ];

  const careerTips = [
    {
      title: "Xây dựng Portfolio mạnh",
      description: "Portfolio là CV sống động nhất của developer",
      icon: "💼",
      tips: [
        "Chọn 3-5 dự án chất lượng cao thể hiện kỹ năng đa dạng",
        "Viết documentation chi tiết cho từng dự án",
        "Deploy dự án lên cloud để dễ dàng demo",
        "Sử dụng GitHub/GitLab để showcase code quality"
      ]
    },
    {
      title: "Networking hiệu quả",
      description: "Xây dựng mạng lưới quan hệ trong ngành",
      icon: "🤝",
      tips: [
        "Tham gia các tech meetup và conference",
        "Đóng góp vào open source projects",
        "Xây dựng profile LinkedIn chuyên nghiệp",
        "Tham gia các cộng đồng developer online"
      ]
    },
    {
      title: "Học hỏi liên tục",
      description: "Cập nhật kiến thức và theo kịp xu hướng",
      icon: "📚",
      tips: [
        "Đọc tech blogs và documentation thường xuyên",
        "Tham gia online courses và certification",
        "Thực hành với các project cá nhân",
        "Chia sẻ kiến thức qua blog hoặc presentation"
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
                  <span className="text-2xl">💼</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-[#1E293B] mb-2">
                Nghề nghiệp CNTT
              </h1>
              <p className="text-[#1E293B]/70">
                Khám phá cơ hội nghề nghiệp và hướng dẫn phát triển sự nghiệp trong lĩnh vực công nghệ
              </p>
            </div>
          </div>

          {/* Introduction Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#1E293B]/10 mb-8">
            <h2 className="text-2xl font-bold text-[#1E293B] mb-6 text-center">
              Tại sao chọn nghề nghiệp CNTT?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-[#F5F5FF] rounded-xl">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#0694FA] rounded-full flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="font-bold text-[#1E293B] mb-2">Nhu cầu cao</h3>
                <p className="text-sm text-[#1E293B]/70">
                  Ngành CNTT có nhu cầu tuyển dụng lớn và tăng trưởng ổn định
                </p>
              </div>
              <div className="text-center p-6 bg-[#F1F1E6] rounded-xl">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#1E293B] rounded-full flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="font-bold text-[#1E293B] mb-2">Mức lương hấp dẫn</h3>
                <p className="text-sm text-[#1E293B]/70">
                  Thu nhập cao và nhiều cơ hội thăng tiến trong sự nghiệp
                </p>
              </div>
              <div className="text-center p-6 bg-[#F5F5FF] rounded-xl">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#0694FA] rounded-full flex items-center justify-center">
                  <span className="text-2xl">🌍</span>
                </div>
                <h3 className="font-bold text-[#1E293B] mb-2">Cơ hội toàn cầu</h3>
                <p className="text-sm text-[#1E293B]/70">
                  Có thể làm việc remote và tiếp cận thị trường quốc tế
                </p>
              </div>
            </div>
          </div>

          {/* Career Paths Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-[#1E293B] text-center mb-8">
              Các lộ trình nghề nghiệp phổ biến
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {careerPaths.map((career, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-[#1E293B]/10 hover:shadow-xl transition-all duration-300"
                >
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-3">{career.icon}</div>
                    <h3 className="text-lg font-bold text-[#1E293B] mb-2">
                      {career.title}
                    </h3>
                    <p className="text-sm text-[#1E293B]/70 mb-4">
                      {career.description}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-[#1E293B] text-sm mb-2">
                        Kỹ năng cần thiết:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {career.requirements.map((req, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-[#F5F5FF] text-[#0694FA] rounded-lg text-xs font-medium"
                          >
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-[#1E293B] text-sm mb-2">
                        Kỹ năng bổ sung:
                      </h4>
                      <ul className="space-y-1">
                        {career.skills.map((skill, i) => (
                          <li key={i} className="flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 bg-[#0694FA] rounded-full flex-shrink-0"></span>
                            <span className="text-xs text-[#1E293B]/70">{skill}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-[#1E293B]/10">
                      <div>
                        <div className="text-xs text-[#1E293B]/60">Mức lương</div>
                        <div className="font-bold text-[#0694FA] text-sm">
                          {career.salary}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[#1E293B]/60">Nhu cầu</div>
                        <div className={`font-bold text-sm ${
                          career.demand === "Rất cao" ? "text-green-600" : "text-[#0694FA]"
                        }`}>
                          {career.demand}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Career Tips Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#1E293B]/10 mb-8">
            <h2 className="text-2xl font-bold text-[#1E293B] mb-8 text-center">
              Lời khuyên để thành công
            </h2>
            <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
              {careerTips.map((tip, index) => (
                <div
                  key={index}
                  className="p-6 bg-[#F5F5FF] rounded-xl hover:bg-[#F1F1E6] transition-colors duration-300"
                >
                  <div className="text-center mb-4">
                    <div className="text-3xl mb-3">{tip.icon}</div>
                    <h3 className="font-bold text-[#1E293B] text-lg mb-2">
                      {tip.title}
                    </h3>
                    <p className="text-sm text-[#1E293B]/70 mb-4">
                      {tip.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-[#1E293B] text-sm">
                      Hướng dẫn thực hiện:
                    </h4>
                    <ul className="space-y-2">
                      {tip.tips.map((tipItem, i) => (
                        <li key={i} className="flex items-start space-x-3">
                          <div className="w-5 h-5 bg-[#0694FA] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <span className="text-xs text-[#1E293B]/70 leading-relaxed">{tipItem}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Trends Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#1E293B]/10 mb-8">
            <h2 className="text-2xl font-bold text-[#1E293B] mb-6 text-center">
              Xu hướng thị trường việc làm CNTT
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-[#F5F5FF] rounded-xl">
                <div className="text-3xl mb-3">🔥</div>
                <h3 className="font-bold text-[#1E293B] mb-2">AI/ML</h3>
                <p className="text-sm text-[#1E293B]/70">
                  Nhu cầu cao nhất hiện tại
                </p>
              </div>
              <div className="text-center p-4 bg-[#F1F1E6] rounded-xl">
                <div className="text-3xl mb-3">☁️</div>
                <h3 className="font-bold text-[#1E293B] mb-2">Cloud Computing</h3>
                <p className="text-sm text-[#1E293B]/70">
                  Tăng trưởng mạnh mẽ
                </p>
              </div>
              <div className="text-center p-4 bg-[#F5F5FF] rounded-xl">
                <div className="text-3xl mb-3">🔐</div>
                <h3 className="font-bold text-[#1E293B] mb-2">Cybersecurity</h3>
                <p className="text-sm text-[#1E293B]/70">
                  Cần thiết cho mọi doanh nghiệp
                </p>
              </div>
              <div className="text-center p-4 bg-[#F1F1E6] rounded-xl">
                <div className="text-3xl mb-3">📱</div>
                <h3 className="font-bold text-[#1E293B] mb-2">Mobile First</h3>
                <p className="text-sm text-[#1E293B]/70">
                  Ưu tiên trải nghiệm mobile
                </p>
              </div>
            </div>
          </div>

          {/* Skills Development Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#1E293B]/10">
            <h2 className="text-2xl font-bold text-[#1E293B] mb-6 text-center">
              Phát triển kỹ năng cần thiết
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold text-[#1E293B] mb-4">Kỹ năng kỹ thuật (Hard Skills)</h3>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3 p-3 bg-[#F5F5FF] rounded-lg">
                    <span className="text-xl">💻</span>
                    <div>
                      <div className="font-semibold text-[#1E293B] text-sm">Ngôn ngữ lập trình</div>
                      <div className="text-xs text-[#1E293B]/70">Python, JavaScript, Java, C++</div>
                    </div>
                  </li>
                  <li className="flex items-center space-x-3 p-3 bg-[#F1F1E6] rounded-lg">
                    <span className="text-xl">🗄️</span>
                    <div>
                      <div className="font-semibold text-[#1E293B] text-sm">Database & Cloud</div>
                      <div className="text-xs text-[#1E293B]/70">SQL, NoSQL, AWS, Azure</div>
                    </div>
                  </li>
                  <li className="flex items-center space-x-3 p-3 bg-[#F5F5FF] rounded-lg">
                    <span className="text-xl">⚡</span>
                    <div>
                      <div className="font-semibold text-[#1E293B] text-sm">Frameworks & Tools</div>
                      <div className="text-xs text-[#1E293B]/70">React, Angular, Docker, Git</div>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-[#1E293B] mb-4">Kỹ năng mềm (Soft Skills)</h3>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3 p-3 bg-[#F1F1E6] rounded-lg">
                    <span className="text-xl">🤝</span>
                    <div>
                      <div className="font-semibold text-[#1E293B] text-sm">Làm việc nhóm</div>
                      <div className="text-xs text-[#1E293B]/70">Collaboration & Communication</div>
                    </div>
                  </li>
                  <li className="flex items-center space-x-3 p-3 bg-[#F5F5FF] rounded-lg">
                    <span className="text-xl">🧠</span>
                    <div>
                      <div className="font-semibold text-[#1E293B] text-sm">Tư duy logic</div>
                      <div className="text-xs text-[#1E293B]/70">Problem solving & Critical thinking</div>
                    </div>
                  </li>
                  <li className="flex items-center space-x-3 p-3 bg-[#F1F1E6] rounded-lg">
                    <span className="text-xl">📚</span>
                    <div>
                      <div className="font-semibold text-[#1E293B] text-sm">Học hỏi liên tục</div>
                      <div className="text-xs text-[#1E293B]/70">Adaptability & Growth mindset</div>
                    </div>
                  </li>
                </ul>
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

export default CareerPage;
