'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import Image from 'next/image'
import axios from 'axios';
import {BASEURL} from "@/app/constants/url";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface User {
  username: string;
  email: string;
  password: string;
  faculty: string;
  major: string;
  year: string;
}
export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [faculty, setFaculty] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');
  const [registerError, setRegisterError] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [verificationModal, setVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [serverCode, setServerCode] = useState('');
  const [pendingRegisterData, setPendingRegisterData] = useState<User | null>(null);
  const [verificationError, setVerificationError] = useState(false);
  const [invalidFptEmail, setInvalidFptEmail] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const router = useRouter();
  
  const getVerifiedEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@fpt\.edu\.vn$/i;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (!/(?=.*[A-Za-z])/.test(password)) {
      return 'Mật khẩu phải chứa ít nhất một chữ cái';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Mật khẩu phải chứa ít nhất một số';
    }
    return '';
  };

  const validateName = (name: string) => {
    if (name.length < 2) {
      return 'Họ tên phải có ít nhất 2 ký tự';
    }
    if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(name)) {
      return 'Họ tên chỉ được chứa chữ cái và khoảng trắng';
    }
    return '';
  };

  const validateEmail = (email: string) => {
    if (!email) {
      return 'Email là bắt buộc';
    }
    if (!getVerifiedEmail(email)) {
      return 'Vui lòng sử dụng email trường FPT (@fpt.edu.vn)';
    }
    return '';
  };

  const isFormValid = () => {
    return !nameError && !emailError && !passwordError && !confirmPasswordError && 
           name && email && password && confirmPassword && faculty && major && year;
  };
  
  

  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields before sending
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    const confirmPasswordErr = password !== confirmPassword ? 'Mật khẩu không khớp' : '';
    
    setNameError(nameErr);
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    setConfirmPasswordError(confirmPasswordErr);
    
    if (nameErr || emailErr || passwordErr || confirmPasswordErr) {
      return;
    }

    if (!getVerifiedEmail(email)) {
      setInvalidFptEmail(true);
      return;
    }
    
    setIsRegistering(true);
    try {
      const items = {
        username: name,
        email: email,
        password: password,
        faculty: faculty,
        major: major,
        year: year
      };
      const response = await axios.post(
        `${BASEURL.replace(/\/?$/, "/")}api/register/verification`,
        { email: email },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      setIsRegistering(false);
      if (response && response.data && response.data.code) {
        setServerCode(response.data.code);
        setPendingRegisterData(items);
        setVerificationModal(true);
      } else {
        setRegisterError(true);
      }
    } catch (error) {
      setIsRegistering(false);
      console.error("Error sending verification code:", error);
      setRegisterError(true);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode === serverCode) {
      try {
        const response = await axios.post(
          `${BASEURL.replace(/\/?$/, "/")}api/auth/register`,
          { items: pendingRegisterData },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        if (response && response.data) {
          setVerificationModal(false);
          setRegisterSuccess(true);
          setTimeout(() => {
            setRegisterSuccess(false);
            router.push("/login");
          }, 2000);
        }
      } catch (error) {
        console.error("Error registering user:", error);
        setVerificationModal(false);
        setRegisterError(true);
      }
    } else {
      setVerificationError(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        
        <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* School Logo at top left */}
      <div className="absolute top-4 left-4 z-20 flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
        <Image
          src="/schoolimg.jpg"
          alt="School Logo"
          width={48}
          height={48}
          className="h-10 w-10 md:h-12 md:w-12 object-cover rounded-full mr-3 shadow-sm"
        />
        <span className="text-lg md:text-xl font-bold text-cyan-700 hidden sm:block">Đại học FPT</span>
      </div>

      {/* Main container */}
      <div className="flex w-[95vw] md:w-[90vw] max-w-[1200px] h-[85vh] md:h-[80vh] max-h-[800px] bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden z-10 border border-white/20">
        {/* Left - Image and text */}
        <div className="hidden md:flex w-1/2 h-full relative flex-col justify-end">
          <Image
            src="/authbgimg.avif"
            alt="Beach"
            fill
            className="absolute inset-0 w-full h-full object-cover rounded-l-3xl"
            style={{ zIndex: 0 }}
            priority
          />
          <div className="relative z-10 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-8 h-full flex flex-col justify-end">
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
                Create Your Academic Future
              </h1>
              <p className="text-lg text-white/95 mb-6 drop-shadow">
                Join thousands of students and access unlimited academic resources in our vibrant learning community.
              </p>
              <div className="flex space-x-4">
                <div className="flex items-center text-white/90">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Free Resources</span>
                </div>
                <div className="flex items-center text-white/90">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Study Groups</span>
                </div>
                <div className="flex items-center text-white/90">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right - Register form */}
        <div className="w-full md:w-1/2 h-full flex items-center justify-center bg-gradient-to-br from-white to-gray-50 relative">
          <div className="flex flex-col items-center justify-center w-full h-full px-6 md:px-8 py-6 overflow-y-auto">
            <div className="w-full max-w-sm mx-auto">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  <Image
                    src="/schoolimg.jpg"
                    alt="School Avatar"
                    width={80}
                    height={80}
                    className="h-16 w-16 md:h-20 md:w-20 object-cover rounded-full shadow-lg border-4 border-white"
                  />
                </div>
                <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  THAM GIA CỘNG ĐỒNG HỌC TẬP
                </h2>
                <p className="text-gray-600 text-sm">Tạo tài khoản để bắt đầu sử dụng</p>
              </div>
            <form onSubmit={handleSendVerification} className="space-y-4 w-full max-w-sm mx-auto">
              <div className="w-full">
                <Input
                  type="text"
                  placeholder="Họ và tên"
                  value={name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setName(value);
                    const error = validateName(value);
                    setNameError(error);
                  }}
                  required
                  className={`w-full ${nameError ? 'border-red-500 focus:border-red-500' : 'focus:border-cyan-500'}`}
                />
                {nameError && (
                  <p className="text-red-500 text-xs mt-1 ml-1">{nameError}</p>
                )}
              </div>
              
              <div className="w-full">
                <Input
                  type="email"
                  placeholder="Email sinh viên (@fpt.edu.vn)"
                  value={email}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEmail(value);
                    const error = validateEmail(value);
                    setEmailError(error);
                  }}
                  required
                  className={`w-full ${emailError ? 'border-red-500 focus:border-red-500' : 'focus:border-cyan-500'}`}
                />
                {emailError && (
                  <p className="text-red-500 text-xs mt-1 ml-1">{emailError}</p>
                )}
              </div>
              <div className="relative w-full">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPassword(value);
                    const error = validatePassword(value);
                    setPasswordError(error);
                    
                    // Check confirm password match when password changes
                    if (confirmPassword && value !== confirmPassword) {
                      setConfirmPasswordError('Mật khẩu không khớp');
                    } else if (confirmPassword && value === confirmPassword) {
                      setConfirmPasswordError('');
                    }
                  }}
                  required
                  className={`pr-10 w-full ${passwordError ? 'border-red-500 focus:border-red-500' : 'focus:border-cyan-500'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12m-2.122-2.122l4.242 4.242M12 12l2.878 2.878-2.878-2.878zm0 0L9.122 9.122 12 12z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                {passwordError && (
                  <p className="text-red-500 text-xs mt-1 ml-1">{passwordError}</p>
                )}
              </div>

              <div className="relative w-full">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Xác nhận mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => {
                    const value = e.target.value;
                    setConfirmPassword(value);
                    if (password && value !== password) {
                      setConfirmPasswordError('Mật khẩu không khớp');
                    } else {
                      setConfirmPasswordError('');
                    }
                  }}
                  required
                  className={`pr-10 w-full ${confirmPasswordError ? 'border-red-500 focus:border-red-500' : 'focus:border-cyan-500'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12m-2.122-2.122l4.242 4.242M12 12l2.878 2.878-2.878-2.878zm0 0L9.122 9.122 12 12z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                {confirmPasswordError && (
                  <p className="text-red-500 text-xs mt-1 ml-1">{confirmPasswordError}</p>
                )}
              </div>
              {/* Faculty select */}
              <div className="w-full">
                <Select value={faculty} onValueChange={setFaculty} required>
                  <SelectTrigger className={`w-full ${!faculty ? 'text-gray-500' : ''} focus:border-cyan-500`}>
                    <SelectValue placeholder="Chọn Khoa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Software Engineering">
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Kỹ thuật phần mềm
                      </div>
                    </SelectItem>
                    <SelectItem value="Artificial Intelligence">
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        Trí tuệ nhân tạo
                      </div>
                    </SelectItem>
                    <SelectItem value="Business Administration">
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Quản trị kinh doanh
                      </div>
                    </SelectItem>
                    <SelectItem value="Graphic Design">
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
                        Thiết kế đồ họa
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Major select */}
              <div className="w-full">
                <Select value={major} onValueChange={setMajor} required>
                  <SelectTrigger className={`w-full ${!major ? 'text-gray-500' : ''} focus:border-cyan-500`}>
                    <SelectValue placeholder="Chọn Chuyên ngành" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Web Development">
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                        Phát triển Web
                      </div>
                    </SelectItem>
                    <SelectItem value="Mobile Development">
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
                        Phát triển Di động
                      </div>
                    </SelectItem>
                    <SelectItem value="Marketing">
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        Marketing
                      </div>
                    </SelectItem>
                    <SelectItem value="Animation">
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                        Hoạt hình
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Year select */}
              <div className="w-full">
                <Select value={year} onValueChange={setYear} required>
                  <SelectTrigger className={`w-full ${!year ? 'text-gray-500' : ''} focus:border-cyan-500`}>
                    <SelectValue placeholder="Chọn Năm học" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="First Year">
                      <div className="flex items-center justify-between w-full">
                        <span>First Year</span>
                        <span className="text-xs text-gray-500">K18</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Second Year">
                      <div className="flex items-center justify-between w-full">
                        <span>Second Year</span>
                        <span className="text-xs text-gray-500">K17</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Third Year">
                      <div className="flex items-center justify-between w-full">
                        <span>Third Year</span>
                        <span className="text-xs text-gray-500">K16</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Fourth Year">
                      <div className="flex items-center justify-between w-full">
                        <span>Fourth Year</span>
                        <span className="text-xs text-gray-500">K15</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                type="submit"
                disabled={!isFormValid() || isRegistering}
                className={`w-full py-3 rounded-full font-medium shadow-lg transition-all duration-300 transform ${
                  isFormValid() && !isRegistering
                    ? 'bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 hover:scale-105 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isRegistering ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending verification...
                  </div>
                ) : (
                  'ĐĂNG KÝ'
                )}
              </Button>
            </form>
            
            {/* Footer */}
            <div className="mt-6 text-center w-full">
              <div className="flex items-center justify-center mb-4">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-sm text-gray-500">hoặc</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>
              <p className="text-gray-600 text-sm">
                Đã có tài khoản?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="text-cyan-600 hover:text-cyan-700 font-semibold transition-colors duration-200 hover:underline bg-transparent border-none p-0 m-0"
                >
                  Đăng nhập tại đây
                </button>
              </p>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Modal for Registration Error */}
      <Dialog open={registerError} onOpenChange={setRegisterError}>
        <DialogContent className="max-w-md bg-white rounded-2xl border-0 shadow-2xl">
          <DialogHeader className="text-center pb-4">
            <div className="mx-auto flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <DialogTitle className="text-xl font-semibold text-red-700">Đăng ký thất bại</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Đã xảy ra lỗi hoặc email đã tồn tại. Vui lòng thử lại với địa chỉ email khác.
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={() => setRegisterError(false)}
            className="mt-6 w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 font-medium transition-all duration-200 transform hover:scale-105"
          >
            Thử lại
          </button>
        </DialogContent>
      </Dialog>

      {/* Enhanced Modal for Registration Success */}
      <Dialog open={registerSuccess} onOpenChange={setRegisterSuccess}>
        <DialogContent className="max-w-md bg-white rounded-2xl border-0 shadow-2xl">
          <DialogHeader className="text-center pb-4">
            <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <DialogTitle className="text-xl font-semibold text-green-700">Đăng ký thành công!</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Tài khoản của bạn đã được tạo thành công. Đang chuyển hướng đến trang đăng nhập...
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Modal for Verification Code */}
      <Dialog open={verificationModal} onOpenChange={setVerificationModal}>
        <DialogContent className="max-w-md bg-white rounded-2xl border-0 shadow-2xl">
          <DialogHeader className="text-center pb-4">
            <div className="mx-auto flex items-center justify-center w-16 h-16 bg-cyan-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <DialogTitle className="text-xl font-semibold text-cyan-700">Xác thực email của bạn</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Chúng tôi đã gửi mã xác thực đến email của bạn. Vui lòng nhập mã bên dưới để hoàn tất đăng ký.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Nhập mã xác thực"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full text-center text-lg font-mono tracking-widest focus:border-cyan-500"
              maxLength={6}
            />
            {verificationError && (
              <div className="flex items-center text-red-500 text-sm">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Mã xác thực không đúng. Vui lòng thử lại.
              </div>
            )}
          </div>
          <button
            onClick={handleVerifyCode}
            disabled={!verificationCode}
            className={`mt-6 w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 transform ${
              verificationCode 
                ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-600 hover:to-cyan-700 hover:scale-105' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Xác thực & Hoàn tất đăng ký
          </button>
        </DialogContent>
      </Dialog>

      {/* Enhanced Modal for Invalid FPT Email */}
      <Dialog open={invalidFptEmail} onOpenChange={setInvalidFptEmail}>
        <DialogContent className="max-w-md bg-white rounded-2xl border-0 shadow-2xl">
          <DialogHeader className="text-center pb-4">
            <div className="mx-auto flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <DialogTitle className="text-xl font-semibold text-orange-700">Email không hợp lệ</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Chỉ chấp nhận email sinh viên Đại học FPT với tên miền <span className="font-semibold text-cyan-600">@fpt.edu.vn</span> để đăng ký.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-4 bg-cyan-50 rounded-xl border border-cyan-200">
            <p className="text-sm text-cyan-800">
              <span className="font-semibold">Ví dụ:</span> student.name@fpt.edu.vn
            </p>
          </div>
          <button
            onClick={() => setInvalidFptEmail(false)}
            className="mt-6 w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 font-medium transition-all duration-200 transform hover:scale-105"
          >
            Tôi đã hiểu
          </button>
        </DialogContent>
      </Dialog>

      {/* Enhanced Loading Modal */}
      <Dialog open={isRegistering}>
        <DialogContent className="max-w-sm bg-white rounded-2xl border-0 shadow-2xl">
          <DialogHeader className="text-center pb-6">
            <div className="mx-auto flex items-center justify-center w-16 h-16 bg-cyan-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-cyan-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <DialogTitle className="text-xl font-semibold text-cyan-700">Đang xử lý đăng ký</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Vui lòng chờ trong khi chúng tôi gửi mã xác thực đến email của bạn...
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}