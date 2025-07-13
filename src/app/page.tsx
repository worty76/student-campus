'use client';
import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Hero Section with Background */}
      <div className="relative min-h-[100vh] w-full overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/landingpage/fpt.jpg"
            alt="Nền Trường Học"
            fill
            className="w-full h-full object-cover"
            priority
            quality={100}
          />
        </div>

        {/* Thanh Điều Hướng Hiện Đại */}
        <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-4 backdrop-blur-sm bg-white/10 border-b border-white/20">
          <div className="flex items-center">
            <Image
              src="/schoolimg.jpg"
              alt="Logo Trường"
              width={60}
              height={60}
              className="object-cover rounded-full mr-4 shadow-lg border-2 border-white/30"
            />
            <div className="flex flex-col">
              <span className="text-2xl md:text-3xl font-bold text-white">STUDENT CAMPUS</span>
              <span className="text-sm text-cyan-200 font-medium">Nền Tảng Chia Sẻ Sinh Viên</span>
            </div>
          </div>
          
          {/* Liên Kết Điều Hướng */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-white/90 hover:text-cyan-300 transition-colors font-medium">Tính Năng</a>
            <a href="#about" className="text-white/90 hover:text-cyan-300 transition-colors font-medium">Giới Thiệu</a>
            <a href="#contact" className="text-white/90 hover:text-cyan-300 transition-colors font-medium">Liên Hệ</a>
          </div>
        </nav>

        {/* Nội Dung Hero */}
        <div className="relative z-10 flex flex-col items-center justify-center h-[calc(100vh-120px)] px-6 md:px-12 text-center">
          {/* Huy Hiệu Hero Động */}
          <div className="mb-8 px-4 py-2 bg-cyan-500/20 backdrop-blur-md border border-cyan-400/30 rounded-full">
            <span className="text-cyan-300 text-sm font-semibold tracking-wide">🎓 Chào mừng đến với Tương lai của Cộng tác Sinh viên</span>
          </div>
          
          {/* Tiêu Đề Chính với Hoạt Ảnh */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
            <span className="text-[#0694fa]">
              Chia Sẻ Sinh Viên
            </span>
          </h1>
          
          {/* Phụ Đề */}
          <p className="text-xl md:text-2xl text-white/90 font-light max-w-4xl mb-10 leading-relaxed">
            Kết nối, cộng tác và thành công cùng nhau. Chia sẻ kiến thức, khám phá tài nguyên và xây dựng mối quan hệ học thuật bền vững trong một nền tảng liền mạch.
          </p>
          
          {/* Nút CTA */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button 
              className="px-8 py-4 text-lg font-semibold bg-[#0694fa] hover:bg-[#0580d1] text-white rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              onClick={() => router.push('/login')}
            >
              Bắt Đầu
            </Button>
            <Button 
              className="px-8 py-4 text-lg font-semibold bg-white/10 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/20 rounded-full shadow-xl transition-all duration-300"
              onClick={() => router.push('/register')}
            >
              Tham Gia Cộng Đồng
            </Button>
          </div>
          
          {/* Phần Thống Kê */}
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-cyan-400">10K+</span>
              <span className="text-white/80 text-sm">Sinh Viên Hoạt Động</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-cyan-400">50K+</span>
              <span className="text-white/80 text-sm">Tài Liệu Chia Sẻ</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-cyan-400">500+</span>
              <span className="text-white/80 text-sm">Nhóm Học Tập</span>
            </div>
          </div>
        </div>
      </div>

      {/* Phần Tính Năng Nâng Cao */}
      <section id="features" className="relative py-20 bg-gray-50">
        <div className="container mx-auto px-6 md:px-12">
          {/* Tiêu Đề Phần */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Tại Sao Chọn <span className="text-[#0694fa]">Chia Sẻ Sinh Viên?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Tham gia cùng hàng nghìn sinh viên đã đang thay đổi trải nghiệm học tập của họ thông qua việc cộng tác và chia sẻ kiến thức một cách liền mạch.
            </p>
          </div>

          {/* Lưới Thẻ Tính Năng */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Thẻ Tải Lên & Chia Sẻ */}
            <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white">
              <div className="relative w-full h-64 overflow-hidden">
                <Image
                  src="/landingpage/sharing.jpg"
                  alt="Tải Lên Tài Liệu"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  priority
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 bg-[#0694fa] rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                </div>
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-[#0694fa] transition-colors">
                  Tải Lên & Chia Sẻ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Dễ dàng tải lên ghi chú, bài tập và tài liệu học tập của bạn. Giúp đỡ các bạn cùng lớp thành công đồng thời xây dựng danh tiếng học thuật của bạn.
                </p>
                <div className="flex items-center text-[#0694fa] font-semibold group-hover:translate-x-2 transition-transform">
                  Tìm hiểu thêm
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </CardContent>
            </Card>

            {/* Thẻ Khám Phá Tài Nguyên */}
            <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white">
              <div className="relative w-full h-64 overflow-hidden">
                <Image
                  src="/landingpage/discover.jpg"
                  alt="Khám Phá Tài Nguyên"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  priority
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 bg-[#0694fa] rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-[#0694fa] transition-colors">
                  Khám Phá Tài Nguyên
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Khám phá thư viện rộng lớn các tài liệu do sinh viên đóng góp. Tìm chính xác những gì bạn cần với hệ thống tìm kiếm và lọc thông minh của chúng tôi.
                </p>
                <div className="flex items-center text-[#0694fa] font-semibold group-hover:translate-x-2 transition-transform">
                  Tìm hiểu thêm
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </CardContent>
            </Card>

            {/* Thẻ Cộng Tác & Kết Nối */}
            <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white">
              <div className="relative w-full h-64 overflow-hidden">
                <Image
                  src="/landingpage/collab.jpg"
                  alt="Cộng Tác"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  priority
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 bg-[#0694fa] rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-[#0694fa] transition-colors">
                  Cộng Tác & Kết Nối
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Tham gia các nhóm học tập, tham gia thảo luận và xây dựng những mối quan hệ có ý nghĩa với các bạn cùng có chung sở thích học thuật.
                </p>
                <div className="flex items-center text-[#0694fa] font-semibold group-hover:translate-x-2 transition-transform">
                  Tìm hiểu thêm
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tính Năng Bổ Sung */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[#0694fa] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Bảo Mật & Riêng Tư</h3>
              <p className="text-gray-600 text-sm">Dữ liệu của bạn được bảo vệ với bảo mật cấp doanh nghiệp</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[#0694fa] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tốc Độ Ánh Sáng</h3>
              <p className="text-gray-600 text-sm">Truy cập tài liệu của bạn ngay lập tức, mọi nơi</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[#0694fa] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Thân Thiện Sinh Viên</h3>
              <p className="text-gray-600 text-sm">Được xây dựng bởi sinh viên, dành cho sinh viên</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[#0694fa] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Đảm Bảo Chất Lượng</h3>
              <p className="text-gray-600 text-sm">Nội dung được xác minh từ những người có thành tích cao</p>
            </div>
          </div>
        </div>
      </section>

      {/* Phần Nhận Xét */}
      <section className="relative py-20 bg-white overflow-hidden">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Sinh Viên Nói Gì Về Chúng Tôi
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tham gia cùng hàng nghìn sinh viên đã thay đổi trải nghiệm học tập của họ với Chia Sẻ Sinh Viên
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Nhận Xét 1 */}
            <div className="bg-blue-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#0694fa] rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <div>
                  <h4 className="text-gray-900 font-semibold">Mai Nguyễn</h4>
                  <p className="text-gray-600 text-sm">Khoa Học Máy Tính, Năm 3</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Chia Sẻ Sinh Viên đã hoàn toàn thay đổi cách tôi học tập. Tôi đã tìm thấy những ghi chú tốt nhất cho lớp thuật toán và thậm chí còn kết nối với các bạn học cùng nhóm cho các dự án.
              </p>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Nhận Xét 2 */}
            <div className="bg-blue-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#0694fa] rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <div>
                  <h4 className="text-gray-900 font-semibold">Tuấn Lê</h4>
                  <p className="text-gray-600 text-sm">Quản Trị Kinh Doanh, Năm 2</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Các tính năng cộng tác thật tuyệt vời! Tôi đã tham gia nhiều nhóm học tập và điểm số của tôi đã cải thiện đáng kể kể từ khi sử dụng nền tảng này.
              </p>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Nhận Xét 3 */}
            <div className="bg-blue-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#0694fa] rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <div>
                  <h4 className="text-gray-900 font-semibold">Linh Phạm</h4>
                  <p className="text-gray-600 text-sm">Thiết Kế Đồ Họa, Năm 4</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Với tư cách là sinh viên thiết kế, việc chia sẻ tài nguyên hình ảnh là rất quan trọng. Chia Sẻ Sinh Viên giúp tôi dễ dàng tải lên và khám phá cảm hứng sáng tạo từ các bạn cùng lớp.
              </p>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Phần Kêu Gọi Hành Động */}
      <section className="relative py-20 bg-[#0694fa] overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-6 md:px-12 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Sẵn Sàng Thành Công Cùng Nhau?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto mb-10 leading-relaxed">
            Tham gia cộng đồng Chia Sẻ Sinh Viên ngay hôm nay và mở khóa thế giới học tập cộng tác, chia sẻ tài nguyên và thành công trong học tập.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Button 
              className="px-10 py-5 text-lg font-semibold bg-white text-[#0694fa] hover:bg-gray-100 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              onClick={() => router.push('/register')}
            >
              Bắt Đầu Hành Trình
            </Button>
            <Button 
              className="px-10 py-5 text-lg font-semibold bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#0694fa] rounded-full shadow-xl transition-all duration-300"
              onClick={() => router.push('/login')}
            >
              Đăng Nhập
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 text-white/80">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>100% Miễn Phí Tham Gia</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Truy Cập Ngay Lập Tức</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Cộng Đồng Sinh Viên Được Xác Minh</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Nâng Cao */}
      <footer className="w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300">
        {/* Nội Dung Footer Chính */}
        <div className="container mx-auto px-6 md:px-12 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Phần Thương Hiệu */}
            <div className="md:col-span-1">
              <div className="flex items-center mb-6">
                <Image
                  src="/schoolimg.jpg"
                  alt="Logo Đại Học FPT"
                  width={50}
                  height={50}
                  className="rounded-full mr-3 border-2 border-cyan-400/30"
                />
                <div>
                  <h4 className="text-white font-bold text-xl">Chia Sẻ Sinh Viên</h4>
                  <p className="text-cyan-400 text-sm font-medium">bởi Đại Học FPT</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                Trao quyền cho sinh viên cộng tác, chia sẻ kiến thức và thành công cùng nhau trong hành trình học tập của họ.
              </p>
              {/* Mạng Xã Hội */}
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-700 hover:bg-cyan-600 rounded-full flex items-center justify-center transition-colors group">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-700 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors group">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-700 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors group">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-700 hover:bg-purple-600 rounded-full flex items-center justify-center transition-colors group">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Liên Kết Nhanh */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-6">Nền Tảng</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center group">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Tính Năng
                </a></li>
                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center group">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Cách Hoạt Động
                </a></li>
                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center group">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Bảng Giá
                </a></li>
                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center group">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Ứng Dụng Di Động
                </a></li>
              </ul>
            </div>

            {/* Hỗ Trợ */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-6">Hỗ Trợ</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center group">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Trung Tâm Trợ Giúp
                </a></li>
                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center group">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Liên Hệ Hỗ Trợ
                </a></li>
                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center group">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Quy Tắc Cộng Đồng
                </a></li>
                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center group">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Báo Cáo Vấn Đề
                </a></li>
              </ul>
            </div>

            {/* Pháp Lý */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-6">Pháp Lý</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center group">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Chính Sách Bảo Mật
                </a></li>
                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center group">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Điều Khoản Dịch Vụ
                </a></li>
                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center group">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Chính Sách Cookie
                </a></li>
                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center group">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Thông Báo DMCA
                </a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Dưới */}
        <div className="border-t border-gray-700">
          <div className="container mx-auto px-6 md:px-12 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-gray-400 text-sm text-center md:text-left mb-4 md:mb-0">
                Bản quyền © {new Date().getFullYear()} Đại Học FPT. Tất cả quyền được bảo lưu.
              </p>
              <div className="flex items-center space-x-6 text-sm">
                <span className="text-gray-500">Được tạo với</span>
                <span className="text-red-500">❤️</span>
                <span className="text-gray-500">dành cho sinh viên</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}