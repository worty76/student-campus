'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import Image from 'next/image'
import axios from 'axios';




export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [faculty, setFaculty] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(false);



     const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault(); // Ngăn form reload trang

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
            'http://localhost:3001/api/auth/register',
            { items: items },
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );

          if(response){
            console.log(response.data)
          }
        } catch (error: any) {
          alert(error.response?.data?.message || error.message || 'Đã xảy ra lỗi');
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
            <form onSubmit={handleRegister} className="space-y-4 w-full max-w-sm mx-auto">
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

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.236.938-4.675M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.062-2.675A9.956 9.956 0 0022 9c0 5.523-4.477 10-10 10a9.956 9.956 0 01-4.675-.938" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm7.5 0c-1.74 4.5-6.5 7.5-10.5 7.5S2.24 16.5.5 12C2.24 7.5 7.04 4.5 12 4.5s9.26 3 10.5 7.5z" />
                    </svg>
                  )}
                </button>
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
                onClick={handleRegister}
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
    </div>
  );
}