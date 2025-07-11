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
  const [faculty, setFaculty] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');
  const [showPassword,] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
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
  
  

  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!getVerifiedEmail(email)) {
      setInvalidFptEmail(true);
      return;
    }
    setIsRegistering(true); // Hiện dialog đang đăng ký
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
      setIsRegistering(false); // Tắt dialog khi xong
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
    <div className="min-h-screen bg-cyan-50 flex items-center justify-center relative overflow-hidden">
      {/* School Logo at top left */}
      <div className="absolute top-[2%] left-[2%] z-20 flex items-center">
        <Image
          src="/schoolimg.jpg"
          alt="School Logo"
          width={96}
          height={96}
          className="h-[7vw] w-[7vw] min-h-[48px] min-w-[48px] max-h-[96px] max-w-[96px] object-cover rounded-full mr-[2vw] shadow"
        />
        <span className="text-[2vw] min-text-2xl font-extrabold text-cyan-700">FPT University</span>
      </div>

      {/* Decorative teal shape */}
      <div className="hidden md:block absolute bg-cyan-400 rounded-full w-[35%] h-[60%] right-[-12%] top-1/2 -translate-y-1/2 z-0" />

      <div className="flex w-[90vw] max-w-[1100px] h-[70vh] max-h-[700px] bg-white rounded-2xl shadow-xl overflow-hidden z-10">
        {/* Left - Image and text */}
        <div className="w-1/2 h-full relative flex flex-col justify-end">
          <Image
            src="/authbgimg.avif"
            alt="Beach"
            fill
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 0 }}
            priority
          />
          <div className="relative z-10 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-[6%] pt-[18%] h-full flex flex-col justify-end rounded-bl-2xl">
            <h1 className="text-[3vw] min-text-3xl font-bold text-white mb-4 leading-tight drop-shadow">
              Create Your Academic Future
            </h1>
            <p className="text-base text-white/90 max-w-[80%] mb-4 drop-shadow">
              Access to thousands of academic resources and join our vibrant community of learners.
            </p>
          </div>
        </div>
        {/* Right - Register form */}
        <div className="w-1/2 h-full flex items-center justify-center bg-white relative object-cover">
          <div className="flex flex-col items-center justify-center w-full h-full px-8 py-6">
            <Image
              src="/schoolimg.jpg"
              alt="School Avatar"
              width={80}
              height={80}
              className="h-8 w-8 md:h-20 md:w-20 object-cover rounded-full mb-4 shadow"
            />
            <h2 className="text-xl md:text-2xl font-bold text-cyan-700 mb-4 text-center">JOIN OUR ACADEMIC</h2>
            <form onSubmit={handleSendVerification} className="space-y-4 w-full max-w-sm mx-auto">
              <Input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full"
              />
              <Input
                type="email"
                placeholder="Student Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
              <div className="relative w-full">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPassword(value);

                    // Regex: ít nhất 6 ký tự, gồm ít nhất 1 chữ cái và 1 số
                    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

                    if (!passwordRegex.test(value)) {
                      setPasswordError(true);
                    } else {
                      setPasswordError(false);
                    }
                  }}
                  required
                  className={`pr-10 w-full ${passwordError ===true ? 'border-red-500' : ''}`}
                />

  
              </div>
              {/* Faculty select */}
              <div className="w-full">
                <Select value={faculty} onValueChange={setFaculty} required>
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
              </div>
              {/* Major select */}
              <div className="w-full">
                <Select value={major} onValueChange={setMajor} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Major" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Web Development">Web Development</SelectItem>
                    <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Animation">Animation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Year select */}
              <div className="w-full">
                <Select value={year} onValueChange={setYear} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="First Year">First Year</SelectItem>
                    <SelectItem value="Second Year">Second Year</SelectItem>
                    <SelectItem value="Third Year">Third Year</SelectItem>
                    <SelectItem value="Fourth Year">Fourth Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                className="w-full bg-cyan-400 hover:bg-cyan-500 text-white py-2 rounded-full font-medium shadow transition-all"
              >
                SIGN UP
              </Button>
            </form>
            <div className="mt-4 text-center w-full">
              <span className="text-gray-400">Already have an account? </span>
              <a href="/login" className="text-cyan-600 hover:underline font-medium">Log in</a>
            </div>
          </div>
        </div>
      </div>

      {/* Modal đăng ký thất bại */}
      <Dialog open={registerError} onOpenChange={setRegisterError}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Đăng ký thất bại</DialogTitle>
            <DialogDescription>
              Có lỗi xảy ra hoặc email đã tồn tại. Vui lòng thử lại!
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={() => setRegisterError(false)}
            className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 w-full"
          >
            Đóng
          </button>
        </DialogContent>
      </Dialog>

      {/* Modal đăng ký thành công */}
      <Dialog open={registerSuccess} onOpenChange={setRegisterSuccess}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-green-600">Đăng ký thành công</DialogTitle>
            <DialogDescription>
              Bạn sẽ được chuyển về trang đăng nhập sau 2 giây.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Modal nhập mã xác thực */}
      <Dialog open={verificationModal} onOpenChange={setVerificationModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-cyan-700">Nhập mã xác thực</DialogTitle>
            <DialogDescription>
              Mã xác thực đã được gửi đến email của bạn. Vui lòng nhập mã để hoàn tất đăng ký.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="text"
            placeholder="Verification Code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="w-full"
          />
          {verificationError && (
            <div className="text-red-500 text-sm mt-2">Mã xác thực không đúng. Vui lòng thử lại.</div>
          )}
          <button
            onClick={handleVerifyCode}
            className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 w-full"
          >
            Xác nhận
          </button>
        </DialogContent>
      </Dialog>

      {/* Dialog email không phải FPT */}
      <Dialog open={invalidFptEmail} onOpenChange={setInvalidFptEmail}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Email không hợp lệ</DialogTitle>
            <DialogDescription>
              Chỉ có thể đăng ký bằng email đuôi <b>@fpt.edu.vn</b>. Vui lòng sử dụng email sinh viên FPT!
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={() => setInvalidFptEmail(false)}
            className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 w-full"
          >
            Đóng
          </button>
        </DialogContent>
      </Dialog>

      <Dialog open={isRegistering}>
        <DialogContent className="max-w-sm flex flex-col items-center">
          <DialogHeader>
            <DialogTitle className="text-cyan-600">Đang đăng ký...</DialogTitle>
            <DialogDescription>
              Vui lòng chờ trong giây lát.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-center">
            <span className="loader border-4 border-cyan-400 border-t-transparent rounded-full w-8 h-8 animate-spin"></span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}