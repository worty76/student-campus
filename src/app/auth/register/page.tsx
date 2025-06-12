'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [faculty, setFaculty] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle register logic here
    console.log({ name, email, password, faculty, major, year });
  };

  return (
    <div className="min-h-screen bg-cyan-50 flex items-center justify-center relative overflow-hidden">
      {/* School Logo at top left */}
      <div className="absolute top-8 left-10 z-20 flex items-center">
        <img
          src="https://th.bing.com/th/id/OIP.H7B2zQa6tyItU1JR6pPcngHaEE?rs=1&pid=ImgDetMain"
          alt="School Logo"
          className="h-24 w-24 object-cover rounded-full mr-5 shadow"
        />
        <span className="text-3xl font-extrabold text-cyan-700">FPT University</span>
      </div>

      {/* Decorative teal shape */}
      <div className="hidden md:block absolute bg-cyan-400 rounded-full w-[500px] h-[500px] right-[-180px] top-1/2 -translate-y-1/2 z-0" />

      <div className="flex w-[1400px] h-[700px] bg-white rounded-2xl shadow-xl overflow-hidden z-10">
        {/* Left - Image and text */}
        <div className="w-1/2 h-full relative flex flex-col justify-end">
          <img
            src="https://campusm.exlibrisgroup.com/wp-content/uploads/2019/07/GettyImages-887132600-scaled.jpg"
            alt="Beach"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="relative z-10 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-10 pt-32 h-full flex flex-col justify-end rounded-bl-2xl">
            <h1 className="text-5xl font-bold text-white mb-4 leading-tight drop-shadow">
              Create Your Academic Future
            </h1>
            <p className="text-base text-white/90 max-w-md mb-4 drop-shadow">
              Access to thousands of academic resources and join our vibrant community of learners.
            </p>
          </div>
        </div>
        {/* Right - Register form */}
        <div className="w-1/2 flex items-center justify-center bg-white relative">
          <div className="w-full max-w-md px-10 py-12 flex flex-col items-center">
            <img
              src="https://th.bing.com/th/id/OIP.H7B2zQa6tyItU1JR6pPcngHaEE?rs=1&pid=ImgDetMain"
              alt="School Avatar"
              className="h-20 w-20 object-cover rounded-full mb-6 shadow"
            />
            <h2 className="text-3xl font-bold text-cyan-700 mb-6">JOIN OUR ACADEMIC</h2>
              <form onSubmit={handleRegister} className="space-y-5 w-full">
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
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10 w-full"
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
                    <SelectItem value="SE">Software Engineering</SelectItem>
                    <SelectItem value="AI">Artificial Intelligence</SelectItem>
                    <SelectItem value="BA">Business Administration</SelectItem>
                    <SelectItem value="GD">Graphic Design</SelectItem>
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
                    <SelectItem value="Web">Web Development</SelectItem>
                    <SelectItem value="Mobile">Mobile Development</SelectItem>
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
                    <SelectItem value="1">Year 1</SelectItem>
                    <SelectItem value="2">Year 2</SelectItem>
                    <SelectItem value="3">Year 3</SelectItem>
                    <SelectItem value="4">Year 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                className="w-full bg-cyan-400 hover:bg-cyan-500 text-white py-3 rounded-full font-medium shadow transition-all"
              >
                SIGN UP
              </Button>
            </form>
            <div className="mt-6 text-center w-full">
              <span className="text-gray-400">Already have an account? </span>
              <a href="/auth/login" className="text-cyan-600 hover:underline font-medium">Log in</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}