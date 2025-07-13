'use client';
import React, { useState, useEffect } from 'react';
import NavigationBar from '@/app/(main)/layouts/navbar';
import { Button } from '@/components/ui/button';
import PasswordChange from '@/components/settings/password';
import Image from 'next/image';
import Privacy from '@/components/settings/privacy';
import axios from 'axios';
import { BASEURL } from '@/app/constants/url';
import { useRouter } from 'next/navigation';
import { useWebSocket } from '@/app/context/websocket.contex';
import { 
  Shield, 
  Lock, 
  LogOut, 
  User, 
  Mail, 
  CheckCircle,
  Loader2,

} from 'lucide-react';
import './settings.css';
interface UserdataProps {
  id?: string,
  username: string,
  Year: string,
  Major: string,
  email: string,
  status:string,
  Faculty: string,
  avatar?: string,
  avatar_link?: string,
  friends?: string[]
  profilePrivacy?: string;
  messagePrivacy?: string;
  notifcationSettings?: string;
}
const SettingsPage = () => {
    const [item, setItem] = useState('password');
    const [showSuccess, setShowSuccess] = useState(false);
    const [userData, setUserData] = useState<UserdataProps | null>(null);
    const [loggingOut, setLoggingOut] = useState(false);
    const router = useRouter();
    const { disconnect } = useWebSocket();
    const getUserData = async () => {
    try {
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const response = await axios.get(
        `${BASEURL}/api/get/userinfo/` + userId,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      if (response.status === 200) {
        const userData = response.data.resUser;
        setUserData(userData);

        console.log(userData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
    const handleSavePrivacy = async (privacySetting: { profilePrivacy: string; messagePrivacy: string; notifications: string }) => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            if (!userId || !token) {
                alert('Bạn chưa đăng nhập!');
                return;
            }

            const res = await axios.put(
                `${BASEURL}/api/update/privacy/${userId}`,
                {
                    profileVisibility: privacySetting.profilePrivacy,
                    messagePermission: privacySetting.messagePrivacy,
                    notifications: privacySetting.notifications,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (res.status === 200) {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 2000);
            } else {
                alert(res.data.message || 'Có lỗi xảy ra khi cập nhật quyền riêng tư');
            }
        } catch (error) {
            alert(error || 'Lỗi kết nối máy chủ');
        }
    };

    const handleSavePassword = async (newPassword: string ,oldPassword:string,confirmPassword:string) => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            if (!userId || !token) {
                alert('Bạn chưa đăng nhập!');
                return;
            }
            if (newPassword !== confirmPassword) {
                alert('Mật khẩu mới và xác nhận mật khẩu không khớp!');
                return;
            }

            const res = await axios.put(
                `${BASEURL}/api/update/password/${userId}`,
                {
                    newPassword: newPassword,
                    oldPassword: oldPassword
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (res.status === 200) {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 2000);
            } else {
                alert(res.data.message || 'Có lỗi xảy ra khi cập nhật mật khẩu');
            }
        } catch (error) {
            console.error('Error updating password:', error);
            
        }
    }

    const handleLogout = () => {
        setLoggingOut(true);
        disconnect();
        setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('userdata');
            localStorage.removeItem('friends');
            router.push('/login');
        }, 1500); // Đợi 1.5s cho UX mượt
    };

    useEffect(() => {
        getUserData();
    }, []);
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/login";
        }
      }, []);
        
    return (
        <div className="min-h-screen bg-[#F1F1E6]">
            <NavigationBar />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-[12vh] pb-8">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Cài đặt tài khoản
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                        Quản lý thông tin cá nhân và cài đặt bảo mật của bạn
                    </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden sticky top-24 hover-lift transition-all-smooth">
                            {/* Profile Section */}
                            <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
                                <div className="flex flex-col items-center text-center animate-fade-in-up">
                                    <div className="relative mb-3 sm:mb-4">
                                        {userData?.avatar_link ? (
                                            <Image
                                                width={80}
                                                height={80}
                                                src={userData.avatar_link}
                                                alt="Avatar"
                                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white dark:border-gray-600 shadow-md transition-all-smooth hover:shadow-lg"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center border-4 border-white dark:border-gray-600 shadow-md transition-all-smooth hover:shadow-lg">
                                                <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                            </div>
                                        )}
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-600 animate-pulse-gentle"></div>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg mb-1">
                                        {userData?.username || 'Tên người dùng'}
                                    </h3>
                                    <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                        <Mail className="w-3 h-3 mr-1" />
                                        <span className="truncate max-w-[200px]">{userData?.email || 'Email'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Navigation */}
                            <nav className="p-2">
                                <Button
                                    onClick={() => setItem('password')}
                                    className={`w-full justify-start px-3 sm:px-4 py-2 sm:py-3 mb-1 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                                        item === 'password'
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                                            : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <Lock className="w-4 h-4 mr-2 sm:mr-3" />
                                    Bảo mật
                                </Button>
                                <Button
                                    onClick={() => setItem('privacy')}
                                    className={`w-full justify-start px-3 sm:px-4 py-2 sm:py-3 mb-1 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                                        item === 'privacy'
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                                            : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <Shield className="w-4 h-4 mr-2 sm:mr-3" />
                                    Quyền riêng tư
                                </Button>
                                
                                <hr className="my-3 sm:my-4 border-gray-200 dark:border-gray-700" />
                                
                                <Button
                                    className="w-full justify-start px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 text-sm sm:text-base"
                                    onClick={handleLogout}
                                    disabled={loggingOut}
                                >
                                    {loggingOut ? (
                                        <Loader2 className="w-4 h-4 mr-2 sm:mr-3 animate-spin" />
                                    ) : (
                                        <LogOut className="w-4 h-4 mr-2 sm:mr-3" />
                                    )}
                                    Đăng xuất
                                </Button>
                            </nav>
                        </div>
                    </div>
                    
                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover-lift transition-all-smooth">
                            <div className="p-4 sm:p-6 lg:p-8 custom-scrollbar">
                                {item === 'password' && (
                                    <div className="animate-in fade-in duration-300">
                                        <div className="flex flex-col sm:flex-row sm:items-center mb-6 animate-fade-in-up">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 gradient-blue rounded-lg flex items-center justify-center mb-3 sm:mb-0 sm:mr-4 shadow-md">
                                                <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                                    Bảo mật tài khoản
                                                </h2>
                                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                                                    Thay đổi mật khẩu để bảo vệ tài khoản của bạn khỏi các truy cập trái phép.
                                                </p>
                                            </div>
                                        </div>
                                        <PasswordChange
                                            onSave={({ currentPassword, newPassword, confirmPassword }) =>
                                                handleSavePassword(newPassword, currentPassword, confirmPassword)
                                            }
                                        />
                                    </div>
                                )}
                
                                {item === 'privacy' && (
                                    <div className="animate-in fade-in duration-300">
                                        <div className="flex flex-col sm:flex-row sm:items-center mb-6 animate-fade-in-up">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 gradient-green rounded-lg flex items-center justify-center mb-3 sm:mb-0 sm:mr-4 shadow-md">
                                                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                                    Quyền riêng tư
                                                </h2>
                                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                                                    Quản lý quyền riêng tư: Ai có thể xem hồ sơ, gửi tin nhắn hoặc tìm thấy bạn trên hệ thống.
                                                </p>
                                            </div>
                                        </div>
                                        <Privacy
                                            onSave={(settings) =>
                                                handleSavePrivacy({
                                                    profilePrivacy: settings.profileVisibility,
                                                    messagePrivacy: settings.messagePermission,
                                                    notifications: settings.notifications, 
                                                })
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Success Notification */}
            {showSuccess && (
                <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black bg-opacity-20 p-4">
                    <div className="bg-white dark:bg-gray-800 px-6 sm:px-8 py-4 sm:py-6 rounded-xl shadow-2xl border border-green-200 dark:border-green-700 animate-zoom-in max-w-sm w-full">
                        <div className="flex items-center text-green-700 dark:text-green-300">
                            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 flex-shrink-0" />
                            <span className="font-semibold text-base sm:text-lg">Lưu thành công!</span>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Logout Loading */}
            {loggingOut && (
                <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black bg-opacity-40 p-4">
                    <div className="bg-white dark:bg-gray-900 px-6 sm:px-8 py-4 sm:py-6 rounded-xl shadow-2xl flex flex-col items-center animate-zoom-in max-w-sm w-full">
                        <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500 mb-3 sm:mb-4 animate-spin" />
                        <span className="font-semibold text-blue-700 dark:text-blue-300 text-base sm:text-lg text-center">Đang đăng xuất...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;