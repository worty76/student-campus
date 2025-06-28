'use client';

import { useState,} from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useWebSocket } from '@/app/constants/websocket.contex';
import { BASEURL } from "@/app/constants/url";
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
 
  const router = useRouter();
  const { connectWebSocket } = useWebSocket();
  // Cleanup WebSocket khi component unmount
  
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
     
    try {
      const items = {
        email: email,
        password: password,
      };

      const response = await axios.post(`${BASEURL}/api/auth/login`,
        { items }, 
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response && response.data) {
        console.log(response.data);
        
        // Lưu token
        localStorage.setItem('token', response.data.logindata.token);
        localStorage.setItem('userId',response.data.logindata.user._id)
        localStorage.setItem('userdata', JSON.stringify(response.data.logindata.user));
        
        // Kết nối WebSocket sau khi login thành công
       
        connectWebSocket(response.data.logindata.user._id);
        
        // Chuyển hướng (có thể delay một chút để WebSocket kết nối)
        setTimeout(() => {
          const userId = response.data.logindata.user._id;
          router.push(`/home?user=${encodeURIComponent(userId)}`);
        }, 1000);
      }
    } catch (error) {
      console.error('Login error:', error);
     
    }
  };
  
  return (
    <div className="min-h-screen bg-cyan-50 flex items-center justify-center relative overflow-hidden">
      {/* School Logo at top left */}
      <div className="absolute top-4 left-4 z-20 flex items-center">
        <Image
          src="/schoolimg.jpg"
          alt="School Logo"
          width={80}
          height={80}
          className="h-[5vw] w-[5vw] min-h-[48px] min-w-[48px] max-h-[96px] max-w-[96px] object-cover rounded-full mr-4 shadow"
        />
        <span className="text-[2vw] min-text-2xl font-extrabold text-cyan-700">FPT University</span>
      </div>

      {/* Connection Status */}
     

      {/* Decorative teal shape */}
      <div className="hidden md:block absolute bg-cyan-400 rounded-full w-[35%] h-[60%] right-[-12%] top-1/2 -translate-y-1/2 z-0" />

      <div className="flex w-[90vw] max-w-[1100px] h-[70vh] max-h-[800px] bg-white rounded-2xl shadow-xl overflow-hidden z-10">
        {/* Left - Image and text */}
        <div className="w-1/2 h-full relative flex flex-col justify-end">
          <Image
            src="/authbgimg.avif"
            alt="Beach"
            fill
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="relative z-10 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-[6%] pt-[18%] h-full flex flex-col justify-end rounded-bl-2xl">
            <h1 className="text-[3vw] min-text-3xl font-bold text-white mb-4 leading-tight drop-shadow">
              The Best Academic  <br />Experience
            </h1>
            <p className="text-base text-white/90 max-w-[80%] mb-4 drop-shadow">
              Access to thousands of academic resources and tools to enhance your learning experience.
            </p>
          </div>
        </div>
        
        {/* Right - Login form */}
        <div className="w-1/2 flex items-center justify-center bg-white relative">
          <div className="w-full max-w-[80%] px-[8%] py-[8%] flex flex-col items-center">
            <Image
              src="/schoolimg.jpg"
              width={80}
              height={80}
              alt="School Avatar"
              className="h-[7vw] w-[7vw] min-h-[48px] min-w-[48px] max-h-[80px] max-w-[80px] object-cover rounded-full mb-6 shadow"
            />
            <h2 className="text-[2vw] min-text-2xl font-bold text-cyan-700 mb-6">Sign in</h2>
            
            <form onSubmit={handleLogin} className="space-y-5 w-full">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.236.938-4.675M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.062-2.675A9.956 9.956 0 0122 9c0 5.523-4.477 10-10 10a9.956 9.956 0 01-4.675-.938" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm7.5 0c-1.74 4.5-6.5 7.5-10.5 7.5S2.24 16.5.5 12C2.24 7.5 7.04 4.5 12 4.5s9.26 3 10.5 7.5z" />
                    </svg>
                  )}
                </button>
              </div>
              <Button
                type="submit"
                className="w-full bg-cyan-400 hover:bg-cyan-500 text-white py-3 rounded-full font-medium shadow transition-all"
              >
                LOGIN
              </Button>
            </form>
            
            <div className="my-5 text-center w-full">
              <span className="text-gray-400">Or</span>
            </div>
            
            <div className="mt-6 text-center w-full">
              <span className="text-gray-400">Already have an account? </span>
              <a href="/register" className="text-cyan-600 hover:underline font-medium">Sign up</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}