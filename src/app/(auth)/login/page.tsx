"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useWebSocket } from "@/app/context/websocket.contex";
import { BASEURL } from "@/app/constants/url";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { setCookie } from "@/utils/auth";
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [loadingForgot, setLoadingForgot] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const router = useRouter();
  const { connectWebSocket } = useWebSocket();

  useEffect(() => {
    setMounted(true);
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError("Vui lòng nhập địa chỉ email hợp lệ");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (value && value.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
    } else {
      setPasswordError("");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    let hasError = false;
    if (!email) {
      setEmailError("Email là bắt buộc");
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError("Vui lòng nhập địa chỉ email hợp lệ");
      hasError = true;
    }

    if (!password) {
      setPasswordError("Mật khẩu là bắt buộc");
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
      hasError = true;
    }

    if (hasError) return;

    setLoadingLogin(true);
    try {
      const items = {
        email: email,
        password: password,
      };

      const response = await axios.post(
        `${BASEURL}/api/auth/login`,
        { items },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response && response.data) {
        console.log(response.data);

        // Lưu token
        localStorage.setItem("token", response.data.logindata.token);
        localStorage.setItem("userId", response.data.logindata.user._id);
        localStorage.setItem(
          "userdata",
          JSON.stringify(response.data.logindata.user)
        );
        localStorage.setItem(
          "friends",
          response.data.logindata.user.friends
            ? JSON.stringify(response.data.logindata.user.friends)
            : "[]"
        );

        // Set cookie for middleware
        setCookie("token", response.data.logindata.token, 3); // 3 days to match JWT expiry

        // Kết nối WebSocket sau khi login thành công
        connectWebSocket(response.data.logindata.user._id);

        // Chuyển hướng với smooth transition
        setTimeout(() => {
          if (isForgotPassword) {
            router.push("/settings");
            setIsForgotPassword(false);
          } else {
            // Check if user is admin and redirect to dashboard
            const userRole = response.data.logindata.user.role;
            if (userRole === "admin") {
              router.push("/dashboard");
            } else {
              const userId = response.data.logindata.user._id;
              router.push(`/home?user=${encodeURIComponent(userId)}`);
            }
          }
        }, 1500);
        setLoginError(false);
      }
    } catch (error) {
      setLoginError(true);
      console.error("Login error:", error);
      setLoadingLogin(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotSent(false);
    setLoadingForgot(true);
    try {
      await axios.put(`${BASEURL}/api/auth/reset`, { email: forgotEmail });
      setForgotSent(true);
      setIsForgotPassword(true);

      setLoadingForgot(false);
    } catch (err) {
      console.error("Forgot password error:", err);
      setForgotError("Không thể gửi mật khẩu mới. Vui lòng kiểm tra email.");
      setLoadingForgot(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F9FF] flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#0694FE]/20 rounded-full animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#1E293B]/10 rounded-full animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#0694FE]/10 rounded-full animate-ping delay-2000" />
      </div>

      {/* School Logo at top left with improved styling */}
      <div className="absolute top-4 left-4 z-20 flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg transition-all duration-300 hover:scale-105">
        <Image
          src="/schoolimg.jpg"
          alt="School Logo"
          width={80}
          height={80}
          className="h-10 w-10 md:h-12 md:w-12 object-cover rounded-full mr-3 shadow-sm"
        />
        <span className="text-lg md:text-xl font-bold text-[#0694FE] hidden sm:block">
          FPT University
        </span>
      </div>

      {/* Main container with improved styling and mobile responsiveness */}
      <div
        className={`flex flex-col lg:flex-row w-[95vw] lg:w-[92vw] max-w-[1200px] h-[90vh] lg:h-[75vh] max-h-[900px] lg:max-h-[850px] bg-white/95 backdrop-blur-sm rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden z-10 transition-all duration-700 ${
          mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        {/* Left - Image and text with enhanced design - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:flex w-1/2 h-full relative flex-col justify-end">
          <Image
            src="/authbgimg.avif"
            alt="Môi trường học thuật"
            fill
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="relative z-10 p-8 pt-20 h-full flex flex-col justify-end">
            <div className="transform transition-all duration-700 hover:translate-y-[-4px]">
              <h1 className="text-[2.8vw] min-text-2xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
                Trải nghiệm học tập
                <br />
                <span className="text-[#0694FE]">Tốt nhất</span>
              </h1>
              <p className="text-lg text-white/90 max-w-[85%] mb-6 drop-shadow leading-relaxed">
                Truy cập hàng ngàn tài nguyên học tập và công cụ hỗ trợ hợp tác
                giúp nâng cao hành trình học tập của bạn.
              </p>
              <div className="flex items-center space-x-4 text-white/80">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-[#0694FE]" />
                  <span className="text-sm">Nền tảng an toàn</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-[#0694FE]" />
                  <span className="text-sm">Hỗ trợ 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Header - Only shown on mobile */}
        <div className="lg:hidden w-full bg-gradient-to-r from-[#0694FE] to-[#1E293B] p-6 pt-16">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-2">Chào mừng trở lại</h1>
            <p className="text-white/90 text-sm">
              Đăng nhập để tiếp tục học tập
            </p>
          </div>
        </div>

        {/* Right - Login form with enhanced UX */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#F1F1E6] relative min-h-0 flex-1 mobile-form-container safe-area-padding hide-scrollbar">
          <div className="w-full max-w-[90%] lg:max-w-[85%] px-4 lg:px-8 py-6 lg:py-8 flex flex-col items-center hide-scrollbar">
            {/* Profile image with improved styling - Smaller on mobile */}
            <div className="relative mb-6 lg:mb-8 group">
              <Image
                src="/schoolimg.jpg"
                width={120}
                height={120}
                alt="School Avatar"
                className="h-16 w-16 lg:h-[6vw] lg:w-[6vw] lg:min-h-[64px] lg:min-w-[64px] lg:max-h-[96px] lg:max-w-[96px] object-cover rounded-full shadow-xl ring-4 ring-[#0694FE]/20 transition-all duration-300 group-hover:shadow-2xl group-hover:ring-[#0694FE]/30"
              />
              <div className="absolute inset-0 rounded-full bg-[#0694FE]/10 group-hover:bg-[#0694FE]/20 transition-all duration-300" />
            </div>

            <h2 className="text-xl lg:text-[2.2vw] lg:min-text-xl font-bold text-[#0694FE] mb-6 lg:mb-8 hidden lg:block">
              Chào mừng trở lại
            </h2>

            <form
              onSubmit={handleLogin}
              className="space-y-4 lg:space-y-6 w-full max-w-sm lg:max-w-none"
            >
              {/* Enhanced email input */}
              <div className="space-y-2">
                <div className="relative group">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400 group-focus-within:text-[#0694FE] transition-colors duration-200" />
                  <Input
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    className={`pl-10 lg:pl-11 h-11 lg:h-12 bg-white/80 border-2 rounded-lg lg:rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#0694FE]/20 focus:border-[#0694FE] hover:border-gray-300 mobile-input mobile-text ${
                      emailError
                        ? "border-red-400 focus:border-red-500"
                        : "border-gray-200"
                    }`}
                  />
                </div>
                {emailError && (
                  <p className="text-red-500 text-sm ml-1 animate-fadeIn">
                    {emailError}
                  </p>
                )}
              </div>

              {/* Enhanced password input */}
              <div className="space-y-2">
                <div className="relative group">
                  <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400 group-focus-within:text-[#0694FE] transition-colors duration-200" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    className={`pl-10 lg:pl-11 pr-10 lg:pr-11 h-11 lg:h-12 bg-white/80 border-2 rounded-lg lg:rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#0694FE]/20 focus:border-[#0694FE] hover:border-gray-300 mobile-input mobile-text ${
                      passwordError
                        ? "border-red-400 focus:border-red-500"
                        : "border-gray-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                    ) : (
                      <EyeIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-red-500 text-sm ml-1 animate-fadeIn">
                    {passwordError}
                  </p>
                )}
              </div>

              {/* Forgot password link */}
              <div className="w-full text-right">
                <button
                  type="button"
                  className="text-[#0694FE] hover:text-[#1E293B] text-sm font-medium transition-colors duration-200 hover:underline"
                  onClick={() => setForgotOpen(true)}
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Enhanced login button */}
              <Button
                type="submit"
                className="w-full h-11 lg:h-12 bg-[#0694FE] hover:bg-[#1E293B] text-white font-semibold rounded-lg lg:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={loadingLogin || !!emailError || !!passwordError}
              >
                {loadingLogin ? (
                  <div className="flex items-center space-x-2">
                    <svg
                      className="animate-spin h-4 w-4 lg:h-5 lg:w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      ></path>
                    </svg>
                    <span className="text-sm lg:text-base">
                      Đang đăng nhập...
                    </span>
                  </div>
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </form>

            {/* Divider with improved styling */}
            <div className="my-6 lg:my-8 text-center w-full">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#F1F1E6] text-gray-500 font-medium">
                    Mới sử dụng nền tảng?
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced register link */}
            <div className="text-center w-full">
              <span className="text-gray-600 text-sm lg:text-base">
                Chưa có tài khoản?{" "}
              </span>
              <button
                type="button"
                onClick={() => router.push("/register")}
                className="text-[#0694FE] hover:text-[#1E293B] font-semibold transition-colors duration-200 hover:underline text-sm lg:text-base"
              >
                Tạo tài khoản
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Enhanced Error Modal */}
      <Dialog open={loginError} onOpenChange={setLoginError}>
        <DialogContent className="max-w-sm rounded-2xl border-0 shadow-2xl">
          <DialogHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <DialogTitle className="text-red-600 text-lg font-semibold">
              Đăng nhập thất bại
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại thông tin và
              thử lại.
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => setLoginError(false)}
            className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white rounded-xl h-11 font-medium transition-all duration-300"
          >
            Thử lại
          </Button>
        </DialogContent>
      </Dialog>

      {/* Enhanced Forgot Password Modal */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="max-w-md rounded-2xl border-0 shadow-2xl">
          <DialogHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-[#0694FE]/10 rounded-full flex items-center justify-center mb-4">
              <EnvelopeIcon className="w-6 h-6 text-[#0694FE]" />
            </div>
            <DialogTitle className="text-gray-900 text-xl font-semibold">
              Đặt lại mật khẩu
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Nhập địa chỉ email, chúng tôi sẽ gửi mật khẩu mới cho bạn.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-6 mt-6">
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="email"
                placeholder="Nhập địa chỉ email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                disabled={loadingForgot}
                className="pl-11 h-11 bg-gray-50 border-gray-200 rounded-xl focus:border-[#0694FE] focus:ring-[#0694FE]/20"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-[#0694FE] hover:bg-[#1E293B] text-white rounded-xl font-medium transition-all duration-300"
              disabled={loadingForgot}
            >
              {loadingForgot ? (
                <div className="flex items-center space-x-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                  <span>Đang gửi...</span>
                </div>
              ) : (
                "Gửi mật khẩu mới"
              )}
            </Button>
          </form>
          {forgotSent && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  Gửi email thành công!
                </span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Vui lòng kiểm tra hộp thư để nhận mật khẩu mới.
              </p>
            </div>
          )}
          {forgotError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span className="text-red-800 font-medium">Lỗi</span>
              </div>
              <p className="text-red-700 text-sm mt-1">{forgotError}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Enhanced Loading Modal */}
      <Dialog open={loadingLogin}>
        <DialogContent className="max-w-xs border-0 shadow-2xl rounded-2xl">
          <DialogTitle className="sr-only">Đang đăng nhập</DialogTitle>
          <div className="flex flex-col items-center py-8">
            <div className="relative">
              <svg
                className="animate-spin h-12 w-12 text-cyan-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <h3 className="text-cyan-700 font-semibold text-lg">
                Đang đăng nhập
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Vui lòng chờ trong giây lát...
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
